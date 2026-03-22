import uuid
import pandas as pd
from pathlib import Path
from typing import Any

from app.models.schemas import (
    ColumnInfo,
    DatasetSummary,
    ChartSuggestion,
    AnalysisResult,
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

_dataset_store: dict[str, pd.DataFrame] = {}


def store_dataframe(df: pd.DataFrame) -> str:
    dataset_id = str(uuid.uuid4())
    _dataset_store[dataset_id] = df
    return dataset_id


def get_dataframe(dataset_id: str) -> pd.DataFrame | None:
    return _dataset_store.get(dataset_id)


def parse_csv(file_bytes: bytes, filename: str) -> pd.DataFrame:
    import io
    df = pd.read_csv(io.BytesIO(file_bytes))
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]
    return df


def _get_column_info(df: pd.DataFrame) -> list[ColumnInfo]:
    cols = []
    for col in df.columns:
        series = df[col]
        cols.append(ColumnInfo(
            name=col,
            dtype=str(series.dtype),
            sample_values=series.dropna().head(3).tolist(),
            null_count=int(series.isna().sum()),
            unique_count=int(series.nunique()),
        ))
    return cols


def _suggest_charts(df: pd.DataFrame) -> list[ChartSuggestion]:
    suggestions = []
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    datetime_cols = df.select_dtypes(include=["datetime"]).columns.tolist()

    # Bar chart — categorical x numeric
    if categorical_cols and numeric_cols:
        suggestions.append(ChartSuggestion(
            chart_type="bar",
            x_column=categorical_cols[0],
            y_column=numeric_cols[0],
            title=f"{numeric_cols[0]} by {categorical_cols[0]}",
            reason="Categorical column paired with a numeric — ideal for comparison.",
        ))

    # Line chart — datetime x numeric
    if datetime_cols and numeric_cols:
        suggestions.append(ChartSuggestion(
            chart_type="line",
            x_column=datetime_cols[0],
            y_column=numeric_cols[0],
            title=f"{numeric_cols[0]} over time",
            reason="Datetime column detected — shows trends over time.",
        ))

    # Scatter — two numeric columns
    if len(numeric_cols) >= 2:
        suggestions.append(ChartSuggestion(
            chart_type="scatter",
            x_column=numeric_cols[0],
            y_column=numeric_cols[1],
            title=f"{numeric_cols[0]} vs {numeric_cols[1]}",
            reason="Two numeric columns — scatter reveals correlation.",
        ))

    # Pie chart — low-cardinality categorical
    if categorical_cols:
        col = categorical_cols[0]
        if df[col].nunique() <= 8:
            suggestions.append(ChartSuggestion(
                chart_type="pie",
                x_column=col,
                y_column=None,
                title=f"Distribution of {col}",
                reason="Low-cardinality categorical — pie shows proportion clearly.",
            ))

    # Histogram — single numeric
    if numeric_cols:
        suggestions.append(ChartSuggestion(
            chart_type="histogram",
            x_column=numeric_cols[0],
            y_column=None,
            title=f"Distribution of {numeric_cols[0]}",
            reason="Numeric column — histogram reveals distribution shape.",
        ))

    return suggestions[:4]


def analyze_dataframe(df: pd.DataFrame, filename: str) -> DatasetSummary:
    preview_df = df.head(5).fillna("").astype(str)
    return DatasetSummary(
        filename=filename,
        row_count=len(df),
        col_count=len(df.columns),
        columns=_get_column_info(df),
        preview=preview_df.to_dict(orient="records"),
    )


def run_query(df: pd.DataFrame, pandas_code: str) -> list[dict[str, Any]]:
    local_env = {"df": df.copy(), "pd": pd}
    exec(pandas_code, {}, local_env)
    result = local_env.get("result", pd.DataFrame())
    if isinstance(result, pd.Series):
        result = result.to_frame()
    return result.fillna("").astype(str).head(100).to_dict(orient="records")


def get_stats_summary(df: pd.DataFrame) -> dict[str, Any]:
    numeric = df.select_dtypes(include="number")
    stats = {}
    if not numeric.empty:
        desc = numeric.describe().to_dict()
        stats["numeric_summary"] = desc
    stats["shape"] = {"rows": len(df), "cols": len(df.columns)}
    stats["missing_pct"] = (df.isna().sum() / len(df) * 100).round(2).to_dict()
    return stats