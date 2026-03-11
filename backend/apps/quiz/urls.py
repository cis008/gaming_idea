from django.urls import path

from apps.quiz.views import GenerateQuizView, SubmitQuizView

urlpatterns = [
    path("generate-quiz", GenerateQuizView.as_view(), name="generate-quiz"),
    path("submit-quiz", SubmitQuizView.as_view(), name="submit-quiz"),
]
