import json
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Analysis(Base):
    """Stores completed video analyses."""
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_url = Column(String(500), nullable=True, index=True)
    title = Column(String(500), nullable=False)
    channel_name = Column(String(200), nullable=True)
    recommended_age = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
    risk_scores_json = Column(Text, nullable=False)  # JSON-serialized RiskScores
    educational_score = Column(Float, nullable=False)
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def risk_scores(self) -> dict:
        return json.loads(self.risk_scores_json)

    @risk_scores.setter
    def risk_scores(self, value: dict):
        self.risk_scores_json = json.dumps(value)
