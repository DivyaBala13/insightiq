from pydantic import BaseModel
from typing import Any

class ColumnInfo(BaseModel):
    name: str
    dtype: str
    sample_values: list[Any]
    null_count: int
    unique_count: int

class DatasetSummary(BaseModel):
    filename: str
    row_count: int
    col_count: int
    columns: list[ColumnInfo]
    preview: list[dict[str, Any]]

class ChartSuggestion(BaseModel):
    chart_type: str
    x_column: str
    y_column: str | None
    title: str
    reason: str

class AnalysisResult(BaseModel):
    dataset_id: str
    summary: DatasetSummary
    chart_suggestions: list[ChartSuggestion]

class QueryRequest(BaseModel):
    dataset_id: str
    question: str

class QueryResult(BaseModel):
    question: str
    pandas_code: str
    result: list[dict[str, Any]]
    row_count: int

class InsightRequest(BaseModel):
    dataset_id: str

class InsightCard(BaseModel):
    title: str
    body: str
    insight_type: str

class InsightResponse(BaseModel):
    dataset_id: str
    insights: list[InsightCard]

class ErrorResponse(BaseModel):
    detail: str
    code: str