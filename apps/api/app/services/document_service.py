"""Document ingestion: extract/OCR -> clean -> chunk -> embed -> user Qdrant."""
from pathlib import Path
from uuid import uuid4
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from ai.ocr.service import OCRResult, OCRService, SUPPORTED_EXTENSIONS
from ai.ocr.engines import TesseractUnavailable
from ai.preprocessing.chunk import chunk_text
from ai.preprocessing.clean import clean_text
from ai.retrieval import index as vector_index
from app.config import settings
from app.models import Chunk, Document
from app.services import s3_storage

MIME_TYPES={'.txt':{'text/plain'},'.pdf':{'application/pdf'},'.jpg':{'image/jpeg'},'.jpeg':{'image/jpeg'},'.png':{'image/png'},'.webp':{'image/webp'}}

def _validate_filename(filename):
    name=Path(filename or '').name; ext=Path(name).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS: raise HTTPException(400,detail="Unsupported file type. Allowed: PDF, TXT, JPG, JPEG, PNG, WEBP")
    return name

def _validate_mime(filename, content_type):
    if content_type and content_type not in {'application/octet-stream'}|MIME_TYPES[Path(filename).suffix.lower()]:
        raise HTTPException(400,detail='File content type does not match its extension.')

def _validate_size(size_bytes,*,max_mb):
    if size_bytes<=0: raise HTTPException(400,detail='Uploaded file is empty.')
    if size_bytes>max_mb*1024*1024: raise HTTPException(400,detail=f'File exceeds {max_mb} MB limit.')

def _extract(path,language):
    try: return OCRService().extract(path,language)
    except TesseractUnavailable:
        return OCRResult('', 'unknown', 'tesseract', None, 'ocr', 'poor', [], ['Local OCR is unavailable. Please ask an administrator to install OCR support.'])
    except (ValueError,RuntimeError) as error: raise HTTPException(422,detail=str(error)) from error
    except Exception as error: raise HTTPException(422,detail='Could not read this document.') from error

def _index_extracted_document(db,*,source_path,filename,owner_id,size_bytes,case_id=None,ocr_language='auto'):
    result=_extract(source_path,ocr_language); metadata=result.metadata(); page_chunks=[]
    for page in result.pages:
        cleaned=clean_text(page.text)
        for piece in chunk_text(cleaned): page_chunks.append((page,piece))
    text='\n\n'.join(clean_text(page.text) for page in result.pages if clean_text(page.text))
    if not text:
        metadata['indexing_status']='skipped_empty'
        if 'No readable text was extracted; the document was stored but not indexed.' not in metadata['processing_warnings']: metadata['processing_warnings'].append('No readable text was extracted; the document was stored but not indexed.')
    elif len(text.split())<20 and result.extraction_method not in {'ocr','hybrid'}:
        raise HTTPException(422,detail='The document contains too little extractable text.')
    document=Document(owner_id=owner_id,case_id=case_id,filename=filename,title=Path(filename).stem.replace('_',' ').replace('-',' ').strip(),size_bytes=size_bytes,text=text,processing_metadata=metadata)
    db.add(document); db.flush()
    chunks=[Chunk(document_id=document.id,position=i,text=piece.text,page=page.page,extraction_method=page.extraction_method) for i,(page,piece) in enumerate(page_chunks)]
    db.add_all(chunks); db.commit(); db.refresh(document)
    if chunks:
        try:
            vector_index.add_chunks([c.id for c in chunks],[c.text for c in chunks],owner_id=owner_id,document_id=document.id,document_title=document.title,chunk_metadata=[{'case_id':case_id,'page':c.page,'extraction_method':c.extraction_method} for c in chunks])
            metadata['indexing_status']='indexed'
        except Exception:
            metadata['indexing_status']='failed'; metadata['processing_warnings'].append('Text was saved, but AI search indexing is temporarily unavailable.')
        document.processing_metadata=metadata; db.commit(); db.refresh(document)
    return document

def ingest_upload(db,file:UploadFile,owner_id,case_id=None,ocr_language='auto'):
    filename=_validate_filename(file.filename or ''); _validate_mime(filename,file.content_type)
    content=file.file.read(); _validate_size(len(content),max_mb=settings.max_upload_mb)
    destination=settings.upload_dir/f'{uuid4().hex}_{filename}'; destination.write_bytes(content)
    return _index_extracted_document(db,source_path=destination,filename=filename,owner_id=owner_id,size_bytes=len(content),case_id=case_id,ocr_language=ocr_language)

def ingest_s3_object(db,*,object_key,filename,owner_id,case_id=None,ocr_language='auto'):
    filename=_validate_filename(filename)
    try: metadata=s3_storage.head_object(owner_id,object_key)
    except s3_storage.S3StorageError as error: raise HTTPException(422,detail=str(error)) from error
    _validate_mime(filename,metadata.get('ContentType')); size=int(metadata.get('ContentLength') or 0); _validate_size(size,max_mb=settings.max_s3_upload_mb)
    destination=settings.upload_dir/f's3_{uuid4().hex}_{filename}'
    try:
        s3_storage.download_object(owner_id,object_key,destination)
        return _index_extracted_document(db,source_path=destination,filename=filename,owner_id=owner_id,size_bytes=size,case_id=case_id,ocr_language=ocr_language)
    except s3_storage.S3StorageError as error: raise HTTPException(422,detail=str(error)) from error
    finally: destination.unlink(missing_ok=True)
