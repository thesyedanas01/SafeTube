"""
Configurable age classification thresholds.

Each tier defines the MAXIMUM allowed score per risk category for that age group.
If any category exceeds its max, the video bumps to the next age tier.

Weights determine how much each category contributes to the overall risk assessment.
Educational content acts as a negative weight (reduces perceived age requirement).
"""

from dataclasses import dataclass


@dataclass
class AgeThreshold:
    age: int
    max_violence: float
    max_profanity: float
    max_sexual: float
    max_drugs: float
    max_fear: float
    max_hate_speech: float


# Ordered from youngest to oldest — classifier iterates upward
AGE_THRESHOLDS: list[AgeThreshold] = [
    AgeThreshold(age=3,  max_violence=5,  max_profanity=0,  max_sexual=0,  max_drugs=0,  max_fear=10, max_hate_speech=0),
    AgeThreshold(age=7,  max_violence=15, max_profanity=5,  max_sexual=0,  max_drugs=0,  max_fear=20, max_hate_speech=0),
    AgeThreshold(age=10, max_violence=30, max_profanity=10, max_sexual=0,  max_drugs=5,  max_fear=35, max_hate_speech=5),
    AgeThreshold(age=13, max_violence=50, max_profanity=25, max_sexual=10, max_drugs=15, max_fear=50, max_hate_speech=15),
    AgeThreshold(age=16, max_violence=70, max_profanity=50, max_sexual=30, max_drugs=40, max_fear=70, max_hate_speech=40),
    AgeThreshold(age=18, max_violence=100,max_profanity=100,max_sexual=100,max_drugs=100,max_fear=100,max_hate_speech=100),
]

# How much each category contributes to overall risk
CATEGORY_WEIGHTS: dict[str, float] = {
    "violence": 0.25,
    "profanity": 0.15,
    "sexual_content": 0.25,
    "drugs": 0.10,
    "scary_content": 0.15,
    "hate_speech": 0.10,
}

# Educational score reduces the effective age by this factor (0-1 scale applied)
EDUCATIONAL_DISCOUNT: float = 0.10

# Minimum confidence (%) for a rating — below this we add a caveat
MIN_CONFIDENCE_THRESHOLD: float = 50.0
