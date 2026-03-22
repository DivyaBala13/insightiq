import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI
from app.models.schemas import InsightCard
from app.services.data_service import get_dataframe, get_stats_summary

load_dotenv()

def get_client():
    api_key = os.getenv("OPENAI_API_KEY")
    print(api_key,"api_keyyyyy")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set")
    return AsyncOpenAI(api_key=api_key)

def _build_context(dataset_id: str) -> str:
    df = get_dataframe(dataset_id)
    if df is None:
        raise ValueError(f"Dataset {dataset_id} not found")

    stats = get_stats_summary(df)
    col_info = []
    for col in df.columns:
        col_info.append({
            "column": col,
            "dtype": str(df[col].dtype),
            "sample": df[col].dropna().head(3).tolist(),
            "nulls": int(df[col].isna().sum()),
            "unique": int(df[col].nunique()),
        })

    return json.dumps({
        "shape": stats["shape"],
        "columns": col_info,
        "missing_pct": stats["missing_pct"],
        "numeric_summary": stats.get("numeric_summary", {}),
    }, default=str)


async def generate_insights(dataset_id: str) -> list[InsightCard]:
    context = _build_context(dataset_id)

    prompt = f"""You are a data analyst. Analyze this dataset metadata and return exactly 4 insight cards as a JSON array.

Dataset metadata:
{context}

Return ONLY a JSON array with this exact shape, no other text:
[
  {{
    "title": "Short insight title",
    "body": "2-3 sentence explanation of the insight with specific numbers.",
    "insight_type": "one of: trend | anomaly | distribution | correlation | quality"
  }}
]"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=800,
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    cards_data = json.loads(raw)
    return [InsightCard(**card) for card in cards_data]


async def generate_pandas_query(dataset_id: str, question: str) -> str:
    df = get_dataframe(dataset_id)
    if df is None:
        raise ValueError(f"Dataset {dataset_id} not found")

    columns_info = {col: str(df[col].dtype) for col in df.columns}
    sample = df.head(3).fillna("").to_dict(orient="records")

    prompt = f"""You are a Python/pandas expert. Write a single pandas expression to answer the user's question.

DataFrame variable name: df
Columns and dtypes: {json.dumps(columns_info)}
Sample rows: {json.dumps(sample, default=str)}

User question: {question}

Rules:
- Assign the result to a variable called `result`
- result must be a DataFrame or Series
- Use only pandas operations — no imports needed, df and pd are already available
- Return ONLY the Python code, no explanation, no markdown fences

Example:
result = df[df["revenue"] > 5000].sort_values("revenue", ascending=False)"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=200,
    )

    code = response.choices[0].message.content.strip()
    code = code.replace("```python", "").replace("```", "").strip()
    return code