"""
Age classification engine.

Takes blended risk scores and educational score, then determines
the appropriate age rating using configurable thresholds.

The algorithm:
1. Iterate through age tiers from youngest (3+) to oldest (18+)
2. For each tier, check if ALL risk scores fall within that tier's maximums
3. The first tier where any category exceeds its max bumps to the next tier
4. Educational content provides a slight discount on the effective risk
5. Confidence is calculated from ML/keyword score agreement
"""

from app.config.thresholds import (
    AGE_THRESHOLDS,
    CATEGORY_WEIGHTS,
    EDUCATIONAL_DISCOUNT,
    MIN_CONFIDENCE_THRESHOLD,
)


CATEGORY_TO_THRESHOLD_FIELD = {
    "violence": "max_violence",
    "profanity": "max_profanity",
    "sexual_content": "max_sexual",
    "drugs": "max_drugs",
    "scary_content": "max_fear",
    "hate_speech": "max_hate_speech",
}


def classify_age(
    risk_scores: dict[str, float],
    educational_score: float,
) -> int:
    """
    Determine the minimum recommended viewing age.

    Applies educational discount before threshold comparison:
    effective_score = risk_score * (1 - educational_discount * educational_factor)
    """
    educational_factor = educational_score / 100.0  # 0 to 1
    discount = 1.0 - (EDUCATIONAL_DISCOUNT * educational_factor)

    for threshold in AGE_THRESHOLDS:
        fits_tier = True
        for category, field_name in CATEGORY_TO_THRESHOLD_FIELD.items():
            score = risk_scores.get(category, 0)
            effective_score = score * discount
            max_allowed = getattr(threshold, field_name)

            if effective_score > max_allowed:
                fits_tier = False
                break

        if fits_tier:
            return threshold.age

    # Fallback to highest tier
    return AGE_THRESHOLDS[-1].age


def calculate_confidence(
    ml_scores: dict[str, float],
    keyword_scores: dict[str, float],
) -> float:
    """
    Confidence measures how well ML and keyword scores agree.

    High agreement → high confidence.
    Large divergence → lower confidence (one method may be unreliable).
    """
    categories = set(ml_scores.keys()) & set(keyword_scores.keys())
    if not categories:
        return 50.0

    total_diff = 0.0
    total_weight = 0.0

    for cat in categories:
        weight = CATEGORY_WEIGHTS.get(cat, 0.1)
        diff = abs(ml_scores[cat] - keyword_scores[cat])
        total_diff += diff * weight
        total_weight += weight

    if total_weight == 0:
        return 50.0

    avg_weighted_diff = total_diff / total_weight
    # Convert: 0 diff → 100% confidence, 100 diff → 0% confidence
    confidence = max(0, 100 - avg_weighted_diff)
    return round(confidence, 1)


def generate_summary(
    recommended_age: int,
    risk_scores: dict[str, float],
    educational_score: float,
    confidence: float,
) -> str:
    """Generate a human-readable summary of the analysis."""
    parts = []

    # Overall safety assessment
    if recommended_age <= 3:
        parts.append("This video appears to be safe for all ages.")
    elif recommended_age <= 7:
        parts.append("This video is suitable for young children with minimal concerns.")
    elif recommended_age <= 10:
        parts.append("This video contains some content that may require parental guidance for younger children.")
    elif recommended_age <= 13:
        parts.append("This video contains content that may be unsuitable for children under 13.")
    elif recommended_age <= 16:
        parts.append("This video contains mature content recommended for teens 16 and older.")
    else:
        parts.append("This video contains adult content and is recommended for viewers 18 and older.")

    # Highlight top risk categories
    high_risks = {k: v for k, v in risk_scores.items() if v >= 40}
    moderate_risks = {k: v for k, v in risk_scores.items() if 20 <= v < 40}

    if high_risks:
        names = [k.replace("_", " ") for k in high_risks.keys()]
        parts.append(f"Notable concerns include: {', '.join(names)}.")

    if moderate_risks:
        names = [k.replace("_", " ") for k in moderate_risks.keys()]
        parts.append(f"Moderate levels of: {', '.join(names)}.")

    # Educational value
    if educational_score >= 70:
        parts.append("The video has strong educational value.")
    elif educational_score >= 40:
        parts.append("The video has some educational content.")

    # Confidence caveat
    if confidence < MIN_CONFIDENCE_THRESHOLD:
        parts.append("Note: confidence in this rating is lower than usual — consider reviewing the content yourself.")

    return " ".join(parts)


def blend_scores(
    ml_scores: dict[str, float],
    keyword_scores: dict[str, float],
    ml_weight: float,
    keyword_weight: float,
) -> dict[str, float]:
    """Blend ML and keyword scores using configurable weights."""
    all_categories = set(ml_scores.keys()) | set(keyword_scores.keys())
    blended = {}

    for cat in all_categories:
        ml = ml_scores.get(cat, 0.0)
        kw = keyword_scores.get(cat, 0.0)
        blended[cat] = round(ml * ml_weight + kw * keyword_weight, 1)

    return blended
