from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, QueryResult
from app.services.data_service import get_dataframe, run_query
from app.services.ai_service import generate_pandas_query

router = APIRouter(prefix="/query", tags=["query"])

BLOCKED_KEYWORDS = ["import", "open(", "exec(", "eval(", "__", "os.", "sys."]


def _is_safe(code: str) -> bool:
    return not any(kw in code for kw in BLOCKED_KEYWORDS)


@router.post("/", response_model=QueryResult)
async def query_dataset(body: QueryRequest):
    df = get_dataframe(body.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found. Please upload a CSV first."
        )

    try:
        pandas_code = await generate_pandas_query(body.dataset_id, body.question)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    if not _is_safe(pandas_code):
        raise HTTPException(
            status_code=400,
            detail="Generated query contains unsafe operations."
        )

    try:
        result = run_query(df, pandas_code)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Query execution failed: {str(e)}"
        )

    return QueryResult(
        question=body.question,
        pandas_code=pandas_code,
        result=result,
        row_count=len(result),
    )