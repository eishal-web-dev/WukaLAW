import os
import sys
from pathlib import Path

# fast deterministic embeddings + isolated storage, set before app imports
os.environ["FAKE_EMBEDDINGS"] = "1"
os.environ["DATABASE_URL"] = "sqlite:///./test_wakulaw.db"
os.environ["UPLOAD_DIR"] = "./test_uploads"
os.environ["STORAGE_DIR"] = "./test_storage"

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient

from ai.retrieval import index as vector_index
from app.db import Base, engine
from app.main import app


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    vector_index.reset_for_tests()
    with TestClient(app) as test_client:
        yield test_client


SAMPLE_JUDGMENT = """
IN THE SUPREME COURT OF PAKISTAN
Criminal Appeal No. 123 of 2020

The appellant was convicted under Section 302 of the Pakistan Penal Code by the trial court.
The question before this Court is whether the prosecution proved its case beyond reasonable doubt.
The prosecution relied on the testimony of two eyewitnesses who were present at the scene.
The defense argued that the witnesses were related to the deceased and their testimony was unreliable.
The medical evidence confirmed that the deceased died of gunshot wounds on the night of the incident.
The recovery of the weapon from the appellant was effected two days after his arrest.
This Court has held in numerous cases that the testimony of related witnesses requires careful scrutiny.
After careful consideration of the evidence, the benefit of doubt must be extended to the accused.
Under Article 4 of the Constitution every citizen is entitled to due process of law.
Consequently, the appeal is allowed and the conviction is set aside. The appellant shall be released forthwith.
""".strip()
