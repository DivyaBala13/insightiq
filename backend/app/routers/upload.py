from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import AnalysisResult
from app.services.data_service import (
    parse_csv,
    store_dataframe,
    analyze_dataframe,
    _suggest_charts,
)

router = APIRouter(prefix="/upload", tags=["upload"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {"text/csv", "application/csv", "application/vnd.ms-excel"}


@router.post("/csv", response_model=AnalysisResult)
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only .csv files are accepted."
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 10 MB."
        )

    try:
        df = parse_csv(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse CSV: {str(e)}"
        )

    if df.empty:
        raise HTTPException(status_code=422, detail="CSV file is empty.")

    dataset_id = store_dataframe(df)
    summary = analyze_dataframe(df, file.filename)
    charts = _suggest_charts(df)

    return AnalysisResult(
        dataset_id=dataset_id,
        summary=summary,
        chart_suggestions=charts,
    )