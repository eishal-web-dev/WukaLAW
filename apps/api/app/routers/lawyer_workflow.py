from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import CalendarEvent, Case, Hearing, LawyerTask, ResearchLog, User
from app.schemas import (
    CalendarEventCreate, CalendarEventOut, CalendarEventUpdate,
    HearingCreate, HearingOut, HearingUpdate,
    LawyerTaskCreate, LawyerTaskOut, LawyerTaskUpdate,
    ResearchLogCreate, ResearchLogOut,
)

router = APIRouter(prefix="/lawyer-workflow", tags=["lawyer-workflow"])


def _lawyer(user: User) -> None:
    if user.role != "lawyer":
        raise HTTPException(status_code=403, detail="This workspace is available to lawyers only.")


def _case(db: Session, case_id: int | None, user: User, *, required: bool = False) -> Case | None:
    if case_id is None:
        if required:
            raise HTTPException(status_code=422, detail="Choose a case.")
        return None
    item = db.scalar(select(Case).where(Case.id == case_id, Case.owner_id == user.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Case not found in your workspace.")
    return item


def _case_fields(case: Case | None) -> dict:
    return {
        "case_number": case.case_number if case else None,
        "case_title": case.title if case else None,
    }


def _owned(db: Session, model, item_id: int, user: User):
    item = db.scalar(select(model).where(model.id == item_id, model.owner_id == user.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found.")
    return item


def _apply(item, payload) -> None:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)


def _event_out(item: CalendarEvent, case: Case | None) -> dict:
    return {"id": item.id, "case_id": item.case_id, "title": item.title, "starts_at": item.starts_at,
            "ends_at": item.ends_at, "event_type": item.event_type, "location": item.location,
            "notes": item.notes, "created_at": item.created_at, **_case_fields(case)}


def _task_out(item: LawyerTask, case: Case | None) -> dict:
    return {"id": item.id, "case_id": item.case_id, "title": item.title, "status": item.status,
            "priority": item.priority, "due_at": item.due_at, "notes": item.notes,
            "created_at": item.created_at, **_case_fields(case)}


def _hearing_out(item: Hearing, case: Case) -> dict:
    return {"id": item.id, "case_id": item.case_id, "title": item.title,
            "scheduled_at": item.scheduled_at, "court": item.court, "judge": item.judge,
            "hearing_type": item.hearing_type, "status": item.status,
            "preparation_notes": item.preparation_notes, "outcome": item.outcome,
            "created_at": item.created_at, **_case_fields(case)}


def _research_out(item: ResearchLog, case: Case | None) -> dict:
    return {"id": item.id, "case_id": item.case_id, "query": item.query, "notes": item.notes,
            "results": item.results or [], "created_at": item.created_at, **_case_fields(case)}


@router.get("/events", response_model=list[CalendarEventOut])
def list_events(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    items = db.scalars(select(CalendarEvent).where(CalendarEvent.owner_id == user.id).order_by(CalendarEvent.starts_at)).all()
    return [_event_out(x, db.get(Case, x.case_id) if x.case_id else None) for x in items]


@router.post("/events", response_model=CalendarEventOut, status_code=201)
def create_event(payload: CalendarEventCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); case = _case(db, payload.case_id, user)
    if payload.ends_at and payload.ends_at < payload.starts_at:
        raise HTTPException(status_code=422, detail="End time must be after the start time.")
    item = CalendarEvent(owner_id=user.id, **payload.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return _event_out(item, case)


@router.patch("/events/{item_id}", response_model=CalendarEventOut)
def update_event(item_id: int, payload: CalendarEventUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); item = _owned(db, CalendarEvent, item_id, user)
    target_case_id = payload.case_id if "case_id" in payload.model_fields_set else item.case_id
    case = _case(db, target_case_id, user)
    _apply(item, payload)
    if item.ends_at and item.ends_at < item.starts_at:
        raise HTTPException(status_code=422, detail="End time must be after the start time.")
    db.commit(); db.refresh(item)
    return _event_out(item, case)


@router.delete("/events/{item_id}", status_code=204)
def delete_event(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); db.delete(_owned(db, CalendarEvent, item_id, user)); db.commit(); return Response(status_code=204)


@router.get("/tasks", response_model=list[LawyerTaskOut])
def list_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    items = db.scalars(select(LawyerTask).where(LawyerTask.owner_id == user.id).order_by(LawyerTask.created_at.desc())).all()
    return [_task_out(x, db.get(Case, x.case_id) if x.case_id else None) for x in items]


@router.post("/tasks", response_model=LawyerTaskOut, status_code=201)
def create_task(payload: LawyerTaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); case = _case(db, payload.case_id, user)
    item = LawyerTask(owner_id=user.id, **payload.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return _task_out(item, case)


@router.patch("/tasks/{item_id}", response_model=LawyerTaskOut)
def update_task(item_id: int, payload: LawyerTaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); item = _owned(db, LawyerTask, item_id, user)
    target_case_id = payload.case_id if "case_id" in payload.model_fields_set else item.case_id
    case = _case(db, target_case_id, user); _apply(item, payload); db.commit(); db.refresh(item)
    return _task_out(item, case)


@router.delete("/tasks/{item_id}", status_code=204)
def delete_task(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); db.delete(_owned(db, LawyerTask, item_id, user)); db.commit(); return Response(status_code=204)


@router.get("/hearings", response_model=list[HearingOut])
def list_hearings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    items = db.scalars(select(Hearing).where(Hearing.owner_id == user.id).order_by(Hearing.scheduled_at)).all()
    return [_hearing_out(x, db.get(Case, x.case_id)) for x in items]


@router.post("/hearings", response_model=HearingOut, status_code=201)
def create_hearing(payload: HearingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); case = _case(db, payload.case_id, user, required=True)
    item = Hearing(owner_id=user.id, **payload.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return _hearing_out(item, case)


@router.patch("/hearings/{item_id}", response_model=HearingOut)
def update_hearing(item_id: int, payload: HearingUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); item = _owned(db, Hearing, item_id, user); case = _case(db, item.case_id, user, required=True)
    _apply(item, payload); db.commit(); db.refresh(item)
    return _hearing_out(item, case)


@router.delete("/hearings/{item_id}", status_code=204)
def delete_hearing(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); db.delete(_owned(db, Hearing, item_id, user)); db.commit(); return Response(status_code=204)


@router.get("/research", response_model=list[ResearchLogOut])
def list_research(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    items = db.scalars(select(ResearchLog).where(ResearchLog.owner_id == user.id).order_by(ResearchLog.created_at.desc())).all()
    return [_research_out(x, db.get(Case, x.case_id) if x.case_id else None) for x in items]


@router.post("/research", response_model=ResearchLogOut, status_code=201)
def create_research(payload: ResearchLogCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); case = _case(db, payload.case_id, user)
    item = ResearchLog(owner_id=user.id, **payload.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return _research_out(item, case)


@router.delete("/research/{item_id}", status_code=204)
def delete_research(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user); db.delete(_owned(db, ResearchLog, item_id, user)); db.commit(); return Response(status_code=204)
