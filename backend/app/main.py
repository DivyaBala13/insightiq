import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import upload, insights, query

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("InsightIQ API starting up...")
    yield
    print("InsightIQ API shutting down...")


app = FastAPI(
    title="InsightIQ API",
    description="AI-powered CSV analytics — upload data, get charts and insights.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(insights.router)
app.include_router(query.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "insightiq-api", "version": "0.1.0"}