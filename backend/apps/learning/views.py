from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai_agents.crew import run_learning_crew
from apps.ai_agents.service import AIOrchestratorService
from apps.learning.models import BattleProgress, BattleSession
from apps.learning.progress import get_topic_progress_payload, mark_topic_progress
from apps.learning.prerecorded_lectures import PRERECORDED_LECTURES
from apps.users.models import UserProfile


SUBJECT_LABELS = {
    "dsa": "Data Structures and Algorithms",
    "databases": "Databases",
    "mathematics": "Mathematics for Computer Science",
}

MAX_BATTLE_QUESTIONS = 4


class BattleRoadmapView(APIView):
    def post(self, request):
        subject = request.data.get("subject", "").strip().lower()
        if subject not in SUBJECT_LABELS:
            return Response({"detail": "Valid subject is required."}, status=status.HTTP_400_BAD_REQUEST)

        ai_service = AIOrchestratorService()
        concepts = ai_service.generate_battle_roadmap(subject)

        progress, _ = BattleProgress.objects.get_or_create(user=request.user, subject=subject)
        if not progress.roadmap:
            progress.roadmap = concepts
            progress.save(update_fields=["roadmap", "updated_at"])
        else:
            concepts = progress.roadmap

        return Response(
            {
                "subject": subject,
                "subject_label": SUBJECT_LABELS[subject],
                "roadmap": concepts,
                "progress": {
                    "unlocked_index": progress.unlocked_index,
                    "mastered_concepts": progress.mastered_concepts,
                    "xp": progress.xp,
                    "level": progress.level,
                },
            }
        )


class BattleFlashcardsView(APIView):
    def post(self, request):
        subject = request.data.get("subject", "").strip().lower()
        concept = request.data.get("concept", "").strip()

        if subject not in SUBJECT_LABELS or not concept:
            return Response({"detail": "Subject and concept are required."}, status=status.HTTP_400_BAD_REQUEST)

        cards = AIOrchestratorService().generate_flashcards(subject=SUBJECT_LABELS[subject], concept=concept)
        return Response({"subject": subject, "concept": concept, "flashcards": cards})


class BattleStartView(APIView):
    def post(self, request):
        subject = request.data.get("subject", "").strip().lower()
        concept = request.data.get("concept", "").strip()

        if subject not in SUBJECT_LABELS or not concept:
            return Response({"detail": "Subject and concept are required."}, status=status.HTTP_400_BAD_REQUEST)

        progress, _ = BattleProgress.objects.get_or_create(user=request.user, subject=subject)
        if not progress.roadmap:
            progress.roadmap = AIOrchestratorService().generate_battle_roadmap(subject)
            progress.save(update_fields=["roadmap", "updated_at"])

        if concept not in progress.roadmap:
            return Response({"detail": "Concept is not in this subject roadmap."}, status=status.HTTP_400_BAD_REQUEST)

        concept_index = progress.roadmap.index(concept)
        if concept_index > progress.unlocked_index:
            return Response({"detail": "Concept is locked. Complete previous concept first."}, status=status.HTTP_400_BAD_REQUEST)

        if concept in (progress.mastered_concepts or []):
            return Response({"detail": "Concept already mastered."}, status=status.HTTP_400_BAD_REQUEST)

        session = BattleSession.objects.create(
            user=request.user,
            subject=subject,
            concept=concept,
            player_hp=100,
            enemy_hp=100,
            status="active",
            current_question={},
        )

        return Response(
            {
                "session_id": session.id,
                "subject": subject,
                "subject_label": SUBJECT_LABELS[subject],
                "concept": concept,
                "player_hp": session.player_hp,
                "enemy_hp": session.enemy_hp,
                "status": session.status,
                "max_questions": MAX_BATTLE_QUESTIONS,
            }
        )


class BattleQuestionView(APIView):
    def post(self, request):
        session_id = request.data.get("session_id")
        if not session_id:
            return Response({"detail": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = BattleSession.objects.get(id=session_id, user=request.user)
        except BattleSession.DoesNotExist:
            return Response({"detail": "Battle session not found."}, status=status.HTTP_404_NOT_FOUND)

        if session.status != "active":
            return Response({"detail": "Battle already finished."}, status=status.HTTP_400_BAD_REQUEST)

        if session.turns >= MAX_BATTLE_QUESTIONS:
            return Response(
                {
                    "detail": f"Battle reached {MAX_BATTLE_QUESTIONS} questions.",
                    "status": session.status,
                    "turns": session.turns,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        asked_questions = [str(item).strip() for item in (session.asked_questions or []) if str(item).strip()]
        asked_questions_set = {item.casefold() for item in asked_questions}

        ai_service = AIOrchestratorService()
        question = {}
        for _ in range(5):
            candidate = ai_service.generate_battle_question(
                subject=SUBJECT_LABELS.get(session.subject, session.subject),
                concept=session.concept,
                asked_questions=asked_questions,
            )
            question_text = str(candidate.get("question", "")).strip()
            if question_text and question_text.casefold() not in asked_questions_set:
                question = candidate
                asked_questions.append(question_text)
                break

        if not question:
            question = ai_service.generate_battle_question(
                subject=SUBJECT_LABELS.get(session.subject, session.subject),
                concept=session.concept,
                asked_questions=asked_questions,
            )
            question_text = str(question.get("question", "")).strip()
            if question_text and question_text.casefold() not in asked_questions_set:
                asked_questions.append(question_text)

        session.current_question = question
        session.asked_questions = asked_questions
        session.save(update_fields=["current_question", "asked_questions", "updated_at"])

        return Response(
            {
                "session_id": session.id,
                "question": question.get("question"),
                "options": question.get("options", []),
                "turns": session.turns,
                "max_questions": MAX_BATTLE_QUESTIONS,
            }
        )


class BattleAnswerView(APIView):
    @transaction.atomic
    def post(self, request):
        session_id = request.data.get("session_id")
        selected_option = request.data.get("selected_option")

        if session_id is None or selected_option is None:
            return Response({"detail": "session_id and selected_option are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            selected_option = int(selected_option)
        except (TypeError, ValueError):
            return Response({"detail": "selected_option must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = BattleSession.objects.select_for_update().get(id=session_id, user=request.user)
        except BattleSession.DoesNotExist:
            return Response({"detail": "Battle session not found."}, status=status.HTTP_404_NOT_FOUND)

        if session.status != "active":
            return Response({"detail": "Battle already finished."}, status=status.HTTP_400_BAD_REQUEST)

        question = session.current_question or {}
        if "correct_option" not in question:
            return Response({"detail": "No active question. Request a question first."}, status=status.HTTP_400_BAD_REQUEST)

        is_correct = selected_option == question.get("correct_option")
        damage_enemy = 25 if is_correct else 0
        damage_player = 20 if not is_correct else 0
        xp_gain = 15 if is_correct else 5

        session.turns += 1
        session.enemy_hp = max(0, session.enemy_hp - damage_enemy)
        session.player_hp = max(0, session.player_hp - damage_player)
        session.current_question = {}

        progress, _ = BattleProgress.objects.select_for_update().get_or_create(user=request.user, subject=session.subject)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        progress.xp += xp_gain
        progress.level = max(1, (progress.xp // 120) + 1)

        battle_won = session.enemy_hp == 0
        battle_lost = session.player_hp == 0

        if not battle_won and not battle_lost and session.turns >= MAX_BATTLE_QUESTIONS:
            if session.enemy_hp < session.player_hp:
                battle_won = True
            else:
                battle_lost = True

        unlocked_concept = None

        if battle_won:
            session.status = "won"
            mastered = list(progress.mastered_concepts or [])
            if session.concept not in mastered:
                mastered.append(session.concept)
                progress.mastered_concepts = mastered

                if progress.roadmap and session.concept in progress.roadmap:
                    concept_index = progress.roadmap.index(session.concept)
                    if concept_index >= progress.unlocked_index:
                        progress.unlocked_index = min(len(progress.roadmap) - 1, concept_index + 1)
                    if concept_index + 1 < len(progress.roadmap):
                        unlocked_concept = progress.roadmap[concept_index + 1]

                profile.points += 25
                profile.quizzes_completed += 1
                if f"Battle:{session.concept}" not in profile.badges:
                    profile.badges.append(f"Battle:{session.concept}")
                profile.save(update_fields=["points", "quizzes_completed", "badges"])

                battle_category = f"Battle Mode - {SUBJECT_LABELS.get(session.subject, session.subject)}"
                mark_topic_progress(request.user, topic=session.concept, action="explained", category=battle_category)
                mark_topic_progress(request.user, topic=session.concept, action="chatted", category=battle_category)
                mark_topic_progress(request.user, topic=session.concept, action="quiz_completed", category=battle_category)
        elif battle_lost:
            session.status = "lost"

        session.save(update_fields=["turns", "enemy_hp", "player_hp", "status", "current_question", "updated_at"])
        progress.save(update_fields=["xp", "level", "mastered_concepts", "unlocked_index", "updated_at"])

        return Response(
            {
                "session_id": session.id,
                "result": "correct" if is_correct else "wrong",
                "correct_option": question.get("correct_option"),
                "explanation": question.get("explanation", "Review and try the next round."),
                "damage": {
                    "enemy": damage_enemy,
                    "player": damage_player,
                },
                "player_hp": session.player_hp,
                "enemy_hp": session.enemy_hp,
                "status": session.status,
                "turns": session.turns,
                "max_questions": MAX_BATTLE_QUESTIONS,
                "xp_gain": xp_gain,
                "battle_progress": {
                    "xp": progress.xp,
                    "level": progress.level,
                    "unlocked_index": progress.unlocked_index,
                    "mastered_concepts": progress.mastered_concepts,
                    "next_unlocked_concept": unlocked_concept,
                },
            }
        )


class ExplainTopicView(APIView):
    def post(self, request):
        topic = request.data.get("topic", "").strip()
        category = request.data.get("category", "").strip()
        if not topic:
            return Response({"detail": "Topic is required."}, status=status.HTTP_400_BAD_REQUEST)

        ai_service = AIOrchestratorService()
        explanation = ai_service.explain_topic(topic)
        crew_result = run_learning_crew(topic)
        mark_topic_progress(request.user, topic=topic, action="explained", category=category)

        return Response(
            {
                "topic": topic,
                "explanation": explanation.model_dump(),
                "crew_metadata": crew_result,
            }
        )


class StudyChatView(APIView):
    def post(self, request):
        topic = request.data.get("topic", "").strip()
        category = request.data.get("category", "").strip()
        user_message = request.data.get("message", "").strip()
        history = request.data.get("history", [])

        if not topic:
            return Response({"detail": "Topic is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not user_message:
            return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        ai_service = AIOrchestratorService()
        response_payload = ai_service.study_chat(topic=topic, user_message=user_message, history=history)
        mark_topic_progress(request.user, topic=topic, action="chatted", category=category)

        return Response({"topic": topic, **response_payload})


class VideoSummaryView(APIView):
    def post(self, request):
        video_url = request.data.get("video_url", "").strip()
        video_title = request.data.get("video_title", "").strip()

        if not video_url:
            return Response({"detail": "video_url is required."}, status=status.HTTP_400_BAD_REQUEST)

        ai_service = AIOrchestratorService()
        result = ai_service.summarize_video(video_url=video_url, video_title=video_title)
        return Response(result)


class PrerecordedLecturesView(APIView):
    def get(self, request):
        return Response({"lectures": PRERECORDED_LECTURES})


class TopicProgressView(APIView):
    def get(self, request):
        return Response(get_topic_progress_payload(request.user))
