from fastapi import APIRouter, HTTPException
from app.models.schemas import InsightRequest, InsightResponse
from app.services.data_service import get_dataframe
from app.services.ai_service import generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("/", response_model=InsightResponse)
async def get_insights(body: InsightRequest):
    df = get_dataframe(body.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found. Please upload a CSV first."
        )

    try:
        cards = await generate_insights(body.dataset_id)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI service error: {str(e)}"
        )

    return InsightResponse(dataset_id=body.dataset_id, insights=cards)