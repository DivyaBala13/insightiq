import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_CSV = b"""name,age,salary,department
Alice,30,75000,Engineering
Bob,25,55000,Marketing
Carol,35,90000,Engineering
Dave,28,62000,Design
Eve,32,80000,Engineering
"""


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_upload_valid_csv():
    response = client.post(
        "/upload/csv",
        files={"file": ("test.csv", io.BytesIO(SAMPLE_CSV), "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "dataset_id" in data
    assert data["summary"]["row_count"] == 5
    assert data["summary"]["col_count"] == 4
    assert len(data["chart_suggestions"]) > 0


def test_upload_rejects_non_csv():
    response = client.post(
        "/upload/csv",
        files={"file": ("test.txt", io.BytesIO(b"not a csv"), "text/plain")},
    )
    assert response.status_code == 400


def test_upload_empty_file():
    response = client.post(
        "/upload/csv",
        files={"file": ("empty.csv", io.BytesIO(b""), "text/csv")},
    )
    assert response.status_code == 422


def test_query_without_upload():
    response = client.post(
        "/query/",
        json={"dataset_id": "nonexistent-id", "question": "show top rows"},
    )
    assert response.status_code == 404