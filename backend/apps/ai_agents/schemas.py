from pydantic import BaseModel, Field


class ConceptExplanation(BaseModel):
    concept_summary: str
    simple_explanation: str
    example: str
    key_points: list[str] = Field(default_factory=list)


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_option: int = Field(ge=0, le=3)
    explanation: str


class QuizPayload(BaseModel):
    questions: list[QuizQuestion] = Field(min_length=3, max_length=5)


class QuizEvaluation(BaseModel):
    score: int
    total: int
    correct_answers: list[int]
    mistakes: list[dict]
