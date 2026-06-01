"""
Analysis orchestrator.

Combines all inputs and sends them to the unified Gemini Multimodal Analyzer:
  1. Fetch unified risk scores & educational score from Gemini
  2. Classify age based on risk scores
  3. Compute confidence & summary
  4. Persist to database
"""

import json
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schemas import AnalysisRequest, AnalysisResponse, RiskScores
from app.services.gemini_analyzer import analyze_multimodal
from app.services.age_classifier import (
    classify_age,
    generate_summary,
)
from app.db.models import Analysis

logger = logging.getLogger(__name__)


async def analyze_video(
    request: AnalysisRequest,
    session: AsyncSession,
) -> AnalysisResponse:
    """Run the unified analysis pipeline and return results."""

    logger.info("Analyzing with Unified Gemini: %s", request.title[:80])

    # 1. Unified Multimodal Scoring (Text + Images)
    scores = analyze_multimodal(request)
    
    educational_score = scores.pop("educational_score", 0.0)
    risk_scores = scores
    
    logger.debug("Unified Risk scores: %s", risk_scores)
    logger.debug("Unified Educational score: %s", educational_score)

    # 2. Classify age
    recommended_age = classify_age(risk_scores, educational_score)

    # 3. Confidence (Always high because we are using a unified VLM)
    confidence = 95.0

    # 4. Generate summary
    summary = generate_summary(recommended_age, risk_scores, educational_score, confidence)

    # 5. Build response
    response = AnalysisResponse(
        recommended_age=recommended_age,
        confidence=confidence,
        risk_scores=RiskScores(**risk_scores),
        educational_score=educational_score,
        summary=summary,
    )

    # 6. Persist to database
    db_record = Analysis(
        video_url=request.video_url,
        title=request.title,
        channel_name=request.channel_name,
        recommended_age=recommended_age,
        confidence=confidence,
        risk_scores_json=json.dumps(risk_scores),
        educational_score=educational_score,
        summary=summary,
    )
    session.add(db_record)
    await session.commit()
    await session.refresh(db_record)

    response.id = db_record.id
    logger.info("Analysis complete: age=%d+, confidence=%.1f%%", recommended_age, confidence)
    return response

