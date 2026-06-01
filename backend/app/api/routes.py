"""API routes for SafeTube AI."""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_session
from app.db.models import Analysis
from app.models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisHistoryItem,
    RiskScores,
)
from app.services.analyzer import analyze_video

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(
    request: AnalysisRequest,
    session: AsyncSession = Depends(get_session),
):
    """Analyze a YouTube video's content and return an age rating."""
    try:
        result = await analyze_video(request, session)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/history", response_model=list[AnalysisHistoryItem])
async def get_history(
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
):
    """Retrieve analysis history, most recent first."""
    stmt = (
        select(Analysis)
        .order_by(desc(Analysis.created_at))
        .limit(limit)
        .offset(offset)
    )
    result = await session.execute(stmt)
    records = result.scalars().all()

    return [
        AnalysisHistoryItem(
            id=r.id,
            title=r.title,
            channel_name=r.channel_name,
            video_url=r.video_url,
            recommended_age=r.recommended_age,
            confidence=r.confidence,
            risk_scores=RiskScores(**json.loads(r.risk_scores_json)),
            educational_score=r.educational_score,
            summary=r.summary,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in records
    ]


@router.get("/history/{analysis_id}", response_model=AnalysisHistoryItem)
async def get_analysis(
    analysis_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Retrieve a single analysis by ID."""
    stmt = select(Analysis).where(Analysis.id == analysis_id)
    result = await session.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return AnalysisHistoryItem(
        id=record.id,
        title=record.title,
        channel_name=record.channel_name,
        video_url=record.video_url,
        recommended_age=record.recommended_age,
        confidence=record.confidence,
        risk_scores=RiskScores(**json.loads(record.risk_scores_json)),
        educational_score=record.educational_score,
        summary=record.summary,
        created_at=record.created_at.isoformat() if record.created_at else "",
    )
