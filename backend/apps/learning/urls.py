from django.urls import path

from apps.learning.views import (
    BattleAnswerView,
    BattleFlashcardsView,
    BattleQuestionView,
    BattleRoadmapView,
    BattleStartView,
    ExplainTopicView,
    PrerecordedLecturesView,
    StudyChatView,
    TopicProgressView,
    VideoSummaryView,
)

urlpatterns = [
    path("explain-topic", ExplainTopicView.as_view(), name="explain-topic"),
    path("study-chat", StudyChatView.as_view(), name="study-chat"),
    path("prerecorded-lectures", PrerecordedLecturesView.as_view(), name="prerecorded-lectures"),
    path("topic-progress", TopicProgressView.as_view(), name="topic-progress"),
    path("video-summary", VideoSummaryView.as_view(), name="video-summary"),
    path("battle-roadmap", BattleRoadmapView.as_view(), name="battle-roadmap"),
    path("battle-flashcards", BattleFlashcardsView.as_view(), name="battle-flashcards"),
    path("battle-start", BattleStartView.as_view(), name="battle-start"),
    path("battle-question", BattleQuestionView.as_view(), name="battle-question"),
    path("battle-answer", BattleAnswerView.as_view(), name="battle-answer"),
]
