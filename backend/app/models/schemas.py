from pydantic import BaseModel, Field
from typing import Optional


class AnalysisRequest(BaseModel):
    """Incoming request to analyze a YouTube video."""
    title: str = Field(..., min_length=1, max_length=500, description="Video title")
    description: str = Field(default="", max_length=10000, description="Video description")
    transcript: str = Field(default="", description="Video transcript text")
    channel_name: Optional[str] = Field(default=None, max_length=200, description="Channel name")
    video_url: Optional[str] = Field(default=None, max_length=500, description="YouTube video URL")
    thumbnail_url: Optional[str] = Field(default=None, description="Video thumbnail URL")
    video_frames_b64: Optional[list[str]] = Field(default=None, description="List of base64 encoded video frames")


class RiskScores(BaseModel):
    """Risk scores per content category (0-100 scale)."""
    violence: float = Field(..., ge=0, le=100)
    profanity: float = Field(..., ge=0, le=100)
    sexual_content: float = Field(..., ge=0, le=100)
    drugs: float = Field(..., ge=0, le=100)
    hate_speech: float = Field(..., ge=0, le=100)
    scary_content: float = Field(..., ge=0, le=100)


class AnalysisResponse(BaseModel):
    """Full analysis result returned to the client."""
    recommended_age: int = Field(..., description="Minimum recommended viewing age")
    confidence: float = Field(..., ge=0, le=100, description="Confidence in the rating (0-100)")
    risk_scores: RiskScores
    educational_score: float = Field(..., ge=0, le=100, description="Educational value score (0-100)")
    summary: str = Field(..., description="Human-readable analysis summary")
    id: Optional[int] = Field(default=None, description="Database record ID")


class AnalysisHistoryItem(BaseModel):
    """Stored analysis for history/dashboard."""
    id: int
    title: str
    channel_name: Optional[str]
    video_url: Optional[str]
    recommended_age: int
    confidence: float
    risk_scores: RiskScores
    educational_score: float
    summary: str
    created_at: str

    class Config:
        from_attributes = True
