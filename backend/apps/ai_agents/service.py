import json
import os
import re
from typing import Any

from apps.ai_agents.crew import run_quiz_generation_crew
from apps.ai_agents.schemas import ConceptExplanation, QuizEvaluation, QuizPayload


class AIOrchestratorService:
    DEFAULT_ROADMAPS = {
        "dsa": [
            "Arrays",
            "Linked Lists",
            "Stacks",
            "Queues",
            "Trees",
            "Graphs",
            "Dynamic Programming",
        ],
        "databases": [
            "SQL Basics",
            "Normalization",
            "Indexes",
            "Transactions",
            "ACID Properties",
            "Query Optimization",
        ],
        "mathematics": [
            "Discrete Mathematics",
            "Probability",
            "Linear Algebra",
            "Graph Theory",
            "Logic",
        ],
    }

    def _llm(self):
        provider = os.getenv("LLM_PROVIDER", "openai").lower()
        if provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI

            return ChatGoogleGenerativeAI(
                model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
                google_api_key=os.getenv("GEMINI_API_KEY", ""),
                temperature=0.3,
            )

        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            api_key=os.getenv("OPENAI_API_KEY", ""),
            temperature=0.3,
        )

    def _extract_json_object(self, text: str) -> dict[str, Any]:
        try:
            return json.loads(text)
        except Exception:
            pass

        fenced_match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text)
        if fenced_match:
            try:
                return json.loads(fenced_match.group(1))
            except Exception:
                pass

        bracket_match = re.search(r"(\{[\s\S]*\})", text)
        if bracket_match:
            try:
                return json.loads(bracket_match.group(1))
            except Exception:
                pass

        return {}

    def _invoke_json(self, prompt: str) -> dict[str, Any]:
        try:
            from langchain_core.output_parsers import StrOutputParser
            from langchain_core.prompts import PromptTemplate

            chain = PromptTemplate.from_template("{prompt}") | self._llm() | StrOutputParser()
            response = chain.invoke({"prompt": prompt})
            return self._extract_json_object(response)
        except Exception:
            return {}

    def _fallback_study_response(
        self,
        topic: str,
        user_message: str,
    ) -> dict[str, Any]:
        lower_message = user_message.lower().strip()
        term_match = re.search(r"(?:what do you mean by|meaning of|define)\s+(.+)$", lower_message)

        stock_term_help = {
            "hammer": (
                "A hammer is a candlestick with a small body near the top and a long lower wick. "
                "It can signal that sellers pushed price down but buyers recovered, so downside momentum may be weakening."
            ),
            "candles": (
                "Candles (candlesticks) summarize price movement for a time window using open, high, low, and close."
            ),
            "candlestick": (
                "A candlestick shows open, high, low, and close for one time period and helps you read momentum and reversals."
            ),
        }

        if term_match:
            term = term_match.group(1).strip(" ?.!")
            stock_explanation = None
            for key, value in stock_term_help.items():
                if key in term:
                    stock_explanation = value
                    break

            if stock_explanation:
                assistant_message = (
                    f"Great question. {stock_explanation} "
                    "Confirm with trend context and volume before making a decision."
                )
            else:
                assistant_message = (
                    f"Great question. In {topic}, '{term}' usually refers to a core concept you should understand first. "
                    "I can explain it in simple terms, then give a worked example."
                )
            recommended_next_action = "Ask: give me one real chart-style example with numbers."
        elif "hammer" in lower_message and ("candle" in lower_message or "candlestick" in lower_message):
            assistant_message = (
                "A hammer candle has a small body near the top and a long lower wick. "
                "It often appears after a decline and may indicate buyers are stepping in. "
                "Use it with support level and volume confirmation instead of trading it alone."
            )
            recommended_next_action = "Ask: show me a hammer setup with entry, stop-loss, and target."
        elif "strategy" in lower_message:
            assistant_message = (
                "Here is a beginner strategy for candlestick-based learning: "
                "1) Trade only in trend direction, 2) wait for a clear pattern at support/resistance, "
                "3) enter on confirmation candle close, 4) place stop-loss below invalidation, "
                "5) risk only 1-2% per trade."
            )
            recommended_next_action = "Ask: give me one paper-trading strategy example for stocks with numbers."
        elif "analogy" in lower_message:
            assistant_message = (
                f"Think of {topic} like learning to drive: theory first, controlled practice second, real road confidence last. "
                "In the same way, learn definitions, then examples, then timed practice."
            )
            recommended_next_action = "Ask: now test me with 3 quick questions."
        elif "test" in lower_message or "quiz" in lower_message:
            assistant_message = (
                f"Quick check for {topic}: Q1) What is the core definition? Q2) Where is it used in practice? "
                "Q3) What common mistake should you avoid?"
            )
            recommended_next_action = "Answer Q1-Q3 and I will score your understanding."
        elif "example" in lower_message:
            assistant_message = (
                f"Here is a simple way to study {topic}: first learn one definition, then one real-world example, then test yourself with 2 quick questions. "
                "This sequence helps you understand and remember faster."
            )
            recommended_next_action = "Ask: give me 2 quick questions to test this concept."
        else:
            assistant_message = (
                f"Got it. You asked: '{user_message}'. Let us break this down for {topic} in one clear step at a time. "
                "I can give you definition, strategy, worked example, or a mini test next."
            )
            recommended_next_action = "Reply with one word: definition, strategy, example, or test."

        return {
            "assistant_message": assistant_message,
            "previous_knowledge_check": [
                f"What do you already know about {topic} in 1-2 lines?",
                "Can you explain one related term in your own words?",
                "Which exact sub-topic should we simplify first?",
            ],
            "study_plan": [
                "Start with one key definition.",
                "Understand one practical example.",
                "Compare with a similar concept.",
                "Do 3 short practice checks.",
                "Review mistakes and summarize in your own words.",
            ],
            "recommended_next_action": recommended_next_action,
        }

    def explain_topic(self, topic: str) -> ConceptExplanation:
        prompt = f"""
You are ConceptTutorAgent in a CrewAI multi-agent system.
Return only valid JSON with keys: concept_summary, simple_explanation, example, key_points.
Topic: {topic}
- Keep it concise and student-friendly.
- key_points must be a list of 4 bullet-style strings.
"""
        data = self._invoke_json(prompt)
        if not data:
            data = {
                "concept_summary": f"{topic} is a foundational subject that helps you reason about system behavior.",
                "simple_explanation": f"Think of {topic} as a set of practical rules and patterns that make software reliable and efficient.",
                "example": f"In {topic}, a simple example is analyzing how an application responds under different workloads.",
                "key_points": [
                    "Understand the core idea",
                    "Know common real-world use cases",
                    "Identify trade-offs",
                    "Practice with small examples",
                ],
            }
        return ConceptExplanation(**data)

    def generate_quiz(self, topic: str, explanation: dict[str, Any] | None = None) -> QuizPayload:
        explanation_text = json.dumps(explanation or {}, ensure_ascii=False)
        prompt = f"""
You are QuizGeneratorAgent in a CrewAI multi-agent system.
Return only valid JSON with key `questions`.
Each item in questions must include: question, options (exactly 4), correct_option (0-3), explanation.
Generate 4 MCQs for topic: {topic}
Explanation context: {explanation_text}
Rules:
- Questions must be distinct and non-repetitive.
- Avoid asking the same stem with minor wording changes.
"""
        langchain_data = self._invoke_json(prompt)

        crew_raw = run_quiz_generation_crew(topic=topic, context=explanation_text).get("raw", "")
        crew_data = self._extract_json_object(crew_raw)

        merged_candidates: list[dict[str, Any]] = []
        for source in (langchain_data, crew_data):
            if isinstance(source, dict):
                merged_candidates.extend(source.get("questions", []) or [])

        normalized: list[dict[str, Any]] = []
        seen_stems: set[str] = set()
        for item in merged_candidates:
            if not isinstance(item, dict):
                continue

            question = str(item.get("question", "")).strip()
            options = item.get("options", [])
            correct_option = item.get("correct_option")
            explanation_text_item = str(item.get("explanation", "")).strip() or "Review and retry this concept."

            if not question or not isinstance(options, list) or len(options) != 4:
                continue
            if not isinstance(correct_option, int) or not (0 <= correct_option <= 3):
                continue

            signature = re.sub(r"\s+", " ", question.lower())
            if signature in seen_stems:
                continue
            seen_stems.add(signature)

            normalized.append(
                {
                    "question": question,
                    "options": [str(opt) for opt in options],
                    "correct_option": correct_option,
                    "explanation": explanation_text_item,
                }
            )
            if len(normalized) == 5:
                break

        if len(normalized) < 3:
            fallback_questions = [
                {
                    "question": f"Which statement best describes {topic}?",
                    "options": [
                        "A foundational concept for solving practical computing problems",
                        "A database backup format",
                        "A network cable standard",
                        "A hardware-only protocol",
                    ],
                    "correct_option": 0,
                    "explanation": "It captures the conceptual role of the topic.",
                },
                {
                    "question": f"Why do learners study {topic}?",
                    "options": [
                        "To memorize random facts",
                        "To understand principles and apply them to real tasks",
                        "To avoid writing code",
                        "To configure BIOS settings",
                    ],
                    "correct_option": 1,
                    "explanation": "The main value is conceptual understanding and application.",
                },
                {
                    "question": f"What is a good way to improve at {topic}?",
                    "options": [
                        "Skip examples",
                        "Read once and stop",
                        "Practice with small problems and review mistakes",
                        "Only watch short videos",
                    ],
                    "correct_option": 2,
                    "explanation": "Deliberate practice strengthens understanding.",
                },
                {
                    "question": f"Which practice gives the strongest mastery in {topic}?",
                    "options": [
                        "Applying concepts to varied problems with feedback",
                        "Memorizing one definition only",
                        "Ignoring mistakes",
                        "Skipping revision entirely",
                    ],
                    "correct_option": 0,
                    "explanation": "Variation + feedback builds durable understanding.",
                },
            ]
            normalized = fallback_questions

        return QuizPayload(**{"questions": normalized[:5]})

    def evaluate_quiz(self, questions: list[dict[str, Any]], user_answers: list[int]) -> QuizEvaluation:
        correct_answers = []
        mistakes = []
        for idx, question in enumerate(questions):
            correct_option = question.get("correct_option")
            answer = user_answers[idx] if idx < len(user_answers) else None
            if answer == correct_option:
                correct_answers.append(idx)
            else:
                mistakes.append(
                    {
                        "question_index": idx,
                        "selected": answer,
                        "correct": correct_option,
                        "explanation": question.get("explanation", "Review the topic explanation for this concept."),
                    }
                )

        score = len(correct_answers)
        return QuizEvaluation(
            score=score,
            total=len(questions),
            correct_answers=correct_answers,
            mistakes=mistakes,
        )

    def study_chat(self, topic: str, user_message: str, history: list[dict[str, str]] | None = None) -> dict[str, Any]:
        conversation = "\n".join(
            [f"{item.get('role', 'user')}: {item.get('content', '')}" for item in (history or [])]
        )
        prompt = f"""
You are ConceptTutorAgent using LangChain in a multi-agent learning app.
Return only valid JSON with keys:
- assistant_message (string)
- previous_knowledge_check (array of exactly 3 short diagnostic questions)
- study_plan (array of exactly 5 action-oriented steps)
- recommended_next_action (string)

Topic: {topic}
User message: {user_message}
Conversation history:
{conversation}

Rules:
- Keep the tone conversational and encouraging.
- Help the learner identify current knowledge before teaching deeper material.
- Suggest how to study in a sequence: baseline check -> core concepts -> practice -> recall -> quiz.
- Do not include markdown. Output JSON only.
"""
        data = self._invoke_json(prompt)
        if not data:
            data = self._fallback_study_response(topic=topic, user_message=user_message)
        return {
            "assistant_message": str(data.get("assistant_message", "")),
            "previous_knowledge_check": list(data.get("previous_knowledge_check", []))[:3],
            "study_plan": list(data.get("study_plan", []))[:5],
            "recommended_next_action": str(data.get("recommended_next_action", "")),
        }

    def generate_battle_roadmap(self, subject: str) -> list[str]:
        defaults = self.DEFAULT_ROADMAPS.get(subject, self.DEFAULT_ROADMAPS["dsa"])
        subject_title = {
            "dsa": "Data Structures and Algorithms",
            "databases": "Databases",
            "mathematics": "Mathematics for Computer Science",
        }.get(subject, "Data Structures and Algorithms")

        prompt = f"""
You are RoadmapAgent in a CrewAI + LangChain learning game.
Return only valid JSON in the format:
{{"concepts": ["item1", "item2", ...]}}

Subject: {subject_title}
Rules:
- Return 6 to 8 concepts in prerequisite order.
- Keep concept names short and standard.
- No markdown.
"""
        data = self._invoke_json(prompt)
        concepts = data.get("concepts", []) if isinstance(data, dict) else []
        cleaned = [str(item).strip() for item in concepts if str(item).strip()]
        if len(cleaned) < 4:
            return defaults
        return cleaned[:8]

    def generate_flashcards(self, subject: str, concept: str) -> list[dict[str, str]]:
        prompt = f"""
You are FlashcardAgent in a battle-learning app.
Return only valid JSON in the format:
{{"flashcards": [
  {{"front": "...", "explanation": "...", "example": "...", "takeaway": "..."}},
  ...
]}}

Subject: {subject}
Concept: {concept}
Rules:
- Generate exactly 3 flashcards.
- Keep each field concise and student friendly.
- No markdown.
"""
        data = self._invoke_json(prompt)
        cards = data.get("flashcards", []) if isinstance(data, dict) else []
        normalized = []
        for card in cards[:3]:
            if not isinstance(card, dict):
                continue
            normalized.append(
                {
                    "front": str(card.get("front", f"What is {concept}?")),
                    "explanation": str(card.get("explanation", f"{concept} is a core concept in {subject}.")),
                    "example": str(card.get("example", f"A practical example of {concept} appears in real systems.")),
                    "takeaway": str(card.get("takeaway", f"Understand {concept} and apply it with practice.")),
                }
            )

        if len(normalized) < 3:
            return [
                {
                    "front": f"Define {concept}",
                    "explanation": f"{concept} is a foundational topic in {subject} that supports problem solving.",
                    "example": f"Use {concept} to reason about algorithmic or system behavior.",
                    "takeaway": f"Master the core definition and one common use of {concept}.",
                },
                {
                    "front": f"Why does {concept} matter?",
                    "explanation": f"It helps optimize correctness, performance, and design choices.",
                    "example": f"Interview and production problems often test {concept} directly.",
                    "takeaway": "Link theory with one worked example for retention.",
                },
                {
                    "front": f"Common mistake in {concept}",
                    "explanation": "Learners often memorize terms without practicing applications.",
                    "example": "Always test your understanding with one quiz-style question.",
                    "takeaway": "Practice and feedback convert understanding into mastery.",
                },
            ]

        return normalized

    def generate_battle_question(self, subject: str, concept: str, asked_questions: list[str] | None = None) -> dict[str, Any]:
        asked_questions = [str(item).strip() for item in (asked_questions or []) if str(item).strip()]
        avoid_text = "\n".join([f"- {item}" for item in asked_questions]) if asked_questions else "- none"

        prompt = f"""
You are QuizAgent for a retro battle mode.
Return only valid JSON with keys:
- question (string)
- options (array of exactly 4 strings)
- correct_option (integer 0-3)
- explanation (string)

Subject: {subject}
Concept: {concept}
Difficulty: beginner to intermediate
Already asked in this battle (do not repeat or paraphrase these):
{avoid_text}

Rules:
- Generate a NEW question that is meaningfully different from prior ones.
- Keep options plausible and distinct.
"""
        data = self._invoke_json(prompt)
        options = data.get("options", []) if isinstance(data, dict) else []
        if isinstance(options, list) and len(options) == 4 and isinstance(data.get("correct_option"), int):
            correct = data.get("correct_option")
            if 0 <= correct <= 3:
                return {
                    "question": str(data.get("question", f"Which statement best describes {concept}?")),
                    "options": [str(item) for item in options],
                    "correct_option": correct,
                    "explanation": str(data.get("explanation", "Review the concept summary and try again.")),
                }

        fallback_bank = [
            {
                "question": f"What is the best description of {concept}?",
                "options": [
                    "A core concept used to solve structured computing problems",
                    "A UI animation framework",
                    "A browser-only debugging tool",
                    "A hardware manufacturing protocol",
                ],
                "correct_option": 0,
                "explanation": f"{concept} is fundamental in {subject} and is used in practical problem solving.",
            },
            {
                "question": f"Which scenario most clearly uses {concept}?",
                "options": [
                    "Designing an approach to process and organize data efficiently",
                    "Changing monitor brightness settings",
                    "Installing device drivers only",
                    "Formatting a word document",
                ],
                "correct_option": 0,
                "explanation": f"{concept} is applied when solving structured data and logic problems.",
            },
            {
                "question": f"What is a common goal when applying {concept}?",
                "options": [
                    "Improve correctness and efficiency of solutions",
                    "Increase file size intentionally",
                    "Avoid all testing",
                    "Replace all backend systems with CSS",
                ],
                "correct_option": 0,
                "explanation": f"{concept} helps build solutions that are correct, scalable, and efficient.",
            },
            {
                "question": f"Why do engineers practice {concept} problems repeatedly?",
                "options": [
                    "To strengthen pattern recognition and decision-making",
                    "To avoid understanding fundamentals",
                    "To remove need for debugging forever",
                    "To make code slower but longer",
                ],
                "correct_option": 0,
                "explanation": f"Practice builds intuition for applying {concept} under different constraints.",
            },
            {
                "question": f"Which outcome indicates good understanding of {concept}?",
                "options": [
                    "Choosing and justifying an appropriate solution strategy",
                    "Memorizing terms without applying them",
                    "Ignoring complexity trade-offs",
                    "Skipping edge-case checks",
                ],
                "correct_option": 0,
                "explanation": f"Real understanding means selecting and defending good approaches using {concept}.",
            },
        ]

        offset = len(asked_questions) % len(fallback_bank) if fallback_bank else 0
        return fallback_bank[offset]
