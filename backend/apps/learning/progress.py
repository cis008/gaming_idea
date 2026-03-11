from typing import Any

from apps.learning.models import TopicProgress
from apps.learning.prerecorded_lectures import PRERECORDED_LECTURES


def _catalog_index() -> dict[str, dict[str, Any]]:
    index = {}
    for section in PRERECORDED_LECTURES:
        category = section.get("category", "")
        for item in section.get("topics", []):
            title = item.get("title", "")
            if title:
                index[title.lower()] = {
                    "category": category,
                    "title": title,
                }
    return index


def resolve_topic_category(topic: str, category: str | None = None) -> tuple[str, str]:
    topic = (topic or "").strip()
    category = (category or "").strip()

    if category and topic:
        return category, topic

    lookup = _catalog_index().get(topic.lower())
    if lookup:
        return lookup["category"], lookup["title"]

    return category or "General", topic


def mark_topic_progress(user, topic: str, action: str, category: str | None = None):
    resolved_category, resolved_topic = resolve_topic_category(topic=topic, category=category)
    if not resolved_topic:
        return None

    progress, _ = TopicProgress.objects.get_or_create(
        user=user,
        category=resolved_category,
        topic_title=resolved_topic,
    )

    if action == "explained":
        progress.explained = True
    elif action == "chatted":
        progress.chatted = True
    elif action == "quiz_completed":
        progress.quiz_completed = True

    progress.save()
    return progress


def get_topic_progress_payload(user) -> dict[str, Any]:
    user_progress = TopicProgress.objects.filter(user=user)
    progress_map = {
        (item.category, item.topic_title): {
            "explained": item.explained,
            "chatted": item.chatted,
            "quiz_completed": item.quiz_completed,
        }
        for item in user_progress
    }

    sections = []
    known_categories = set()
    for section in PRERECORDED_LECTURES:
        category = section.get("category", "")
        known_categories.add(category)
        topics = section.get("topics", [])

        topic_entries = []
        completed_count = 0

        for topic in topics:
            title = topic.get("title", "")
            status = progress_map.get(
                (category, title),
                {"explained": False, "chatted": False, "quiz_completed": False},
            )
            if status["quiz_completed"]:
                completed_count += 1

            topic_entries.append(
                {
                    "title": title,
                    "status": status,
                }
            )

        total = len(topics)
        percent = round((completed_count / total) * 100, 2) if total else 0.0
        sections.append(
            {
                "category": category,
                "completed_topics": completed_count,
                "total_topics": total,
                "progress_percent": percent,
                "topics": topic_entries,
            }
        )

    extra_categories: dict[str, list[TopicProgress]] = {}
    for progress in user_progress:
        if progress.category not in known_categories:
            extra_categories.setdefault(progress.category, []).append(progress)

    for category, items in extra_categories.items():
        topic_entries = []
        completed_count = 0
        for item in items:
            status = {
                "explained": item.explained,
                "chatted": item.chatted,
                "quiz_completed": item.quiz_completed,
            }
            if item.quiz_completed:
                completed_count += 1
            topic_entries.append({"title": item.topic_title, "status": status})

        total = len(items)
        percent = round((completed_count / total) * 100, 2) if total else 0.0
        sections.append(
            {
                "category": category,
                "completed_topics": completed_count,
                "total_topics": total,
                "progress_percent": percent,
                "topics": topic_entries,
            }
        )

    return {"sections": sections}
