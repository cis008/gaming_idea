import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PixelButton from "../components/PixelButton";
import PixelCard from "../components/PixelCard";
import { explainTopic, fetchPrerecordedLectures, fetchTopicProgress, generateQuiz, studyChat, summarizeVideo } from "../services/api";

function toEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get("v");
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return url;
  }
}

function PrerecordedLectures() {
  const navigate = useNavigate();
  const [lectureCatalog, setLectureCatalog] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [topicProgress, setTopicProgress] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [videoSummary, setVideoSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [quizError, setQuizError] = useState("");

  const loadTopicProgress = async () => {
    try {
      const progressResponse = await fetchTopicProgress();
      setTopicProgress(progressResponse.data.sections || []);
    } catch {
      setTopicProgress([]);
    }
  };

  useEffect(() => {
    const loadLectures = async () => {
      try {
        const response = await fetchPrerecordedLectures();
        const lectures = response.data.lectures || [];
        setLectureCatalog(lectures);

        const firstVideoTopic = lectures[0]?.topics?.[0] || null;
        const firstVideo = firstVideoTopic
          ? { ...firstVideoTopic, category: lectures[0]?.category || "" }
          : null;
        setSelectedVideo(firstVideo);
        await loadTopicProgress();
      } catch {
        setLectureCatalog([]);
        setSelectedVideo(null);
      }
    };

    loadLectures();
  }, []);

  const embedUrl = useMemo(() => (selectedVideo?.url ? toEmbedUrl(selectedVideo.url) : null), [selectedVideo]);

  const sectionProgressMap = useMemo(() => {
    const map = {};
    for (const section of topicProgress) {
      map[section.category] = section;
    }
    return map;
  }, [topicProgress]);

  const handleSelectTopic = (category, topic) => {
    setSelectedVideo({ ...topic, category });
    setExplanation(null);
    setMessages([]);
    setChatInput("");
    setVideoSummary(null);
    setQuizError("");
  };

  const handleSummarizeVideo = async () => {
    if (!selectedVideo?.url) return;
    setLoadingSummary(true);
    setVideoSummary(null);
    try {
      const response = await summarizeVideo({
        video_url: selectedVideo.url,
        video_title: selectedVideo.title || "",
      });
      setVideoSummary(response.data);
    } catch {
      setVideoSummary({ error: "Failed to summarize video. Please try again." });
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleExplain = async () => {
    if (!selectedVideo?.title) return;
    setLoadingExplain(true);
    try {
      const response = await explainTopic({
        topic: selectedVideo.title,
        category: selectedVideo.category,
      });
      setExplanation(response.data.explanation);
      await loadTopicProgress();
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleSendStudyMessage = async (seedMessage) => {
    const messageToSend = (seedMessage || chatInput).trim();
    if (!selectedVideo?.title || !messageToSend) return;

    const nextMessages = [...messages, { role: "user", content: messageToSend }];
    setMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await studyChat({
        topic: selectedVideo.title,
        category: selectedVideo.category,
        message: messageToSend,
        history: nextMessages,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.data.assistant_message }]);
      await loadTopicProgress();
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedVideo?.title) return;
    setQuizError("");
    try {
      const response = await generateQuiz({
        topic: selectedVideo.title,
        category: selectedVideo.category,
        explanation: explanation || {},
      });

      sessionStorage.setItem(
        "quizPayload",
        JSON.stringify({
          topic: selectedVideo.title,
          category: selectedVideo.category,
          explanation: explanation || {},
          questions: response.data.questions,
        })
      );
      navigate("/quiz");
    } catch (error) {
      if (error.response?.status === 401) {
        setQuizError("Your session expired. Please login again.");
      } else {
        setQuizError(error.response?.data?.detail || "Could not generate quiz. Please try again.");
      }
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-4 sm:py-8" style={{ color: "#1f2937" }}>

      <div className="flex items-center gap-3">
        <span className="text-2xl">📺</span>
        <h1 className="retro-title text-3xl font-bold">Learning Section</h1>
      </div>
      <p className="mt-2" style={{ color: "#6b7280" }}>
        Watch section-wise learning videos and take a quiz for each selected topic.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Video player + AI tools */}
        <PixelCard className="lg:col-span-2">
          {embedUrl ? (
            <>
              <div className="aspect-video overflow-hidden rounded-lg border-[3px]" style={{ borderColor: "#2ecc71" }}>
                <iframe
                  title={selectedVideo?.title || "Lecture Player"}
                  src={embedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <h2 className="mt-4 text-xl font-semibold" style={{ color: "#1f2937" }}>{selectedVideo?.title}</h2>
              <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>Section: {selectedVideo?.category}</p>
              <a
                href={selectedVideo?.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-semibold transition hover:opacity-75"
                style={{ color: "#3498db" }}
              >
                ↗ Open on YouTube
              </a>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <PixelButton onClick={handleExplain} disabled={loadingExplain} className="text-xs">
                  {loadingExplain ? "Explaining..." : "🧠 AI Explain"}
                </PixelButton>
                <PixelButton
                  onClick={() => handleSendStudyMessage("Help me study this topic in a conversation and test my previous knowledge first.")}
                  disabled={chatLoading}
                  className="text-xs"
                >
                  {chatLoading ? "Starting Chat..." : "💬 AI Chat"}
                </PixelButton>
                <PixelButton onClick={handleGenerateQuiz} className="text-xs">
                  📝 Take Quiz
                </PixelButton>
                <PixelButton onClick={handleSummarizeVideo} disabled={loadingSummary} className="text-xs">
                  {loadingSummary ? "Summarizing..." : "✨ Summarize"}
                </PixelButton>
              </div>

              {quizError && (
                <p className="mt-3 text-sm font-semibold" style={{ color: "#e74c3c" }}>{quizError}</p>
              )}

              {/* Video summary — dialogue box */}
              {videoSummary && (
                <div className="dialogue-box mt-4 text-sm">
                  <p className="pokemon-label mb-2">✨ AI Summary</p>
                  {videoSummary.error && !videoSummary.summary && (
                    <p style={{ color: "#e74c3c" }}>{videoSummary.error}</p>
                  )}
                  {videoSummary.summary && (
                    <>
                      <p style={{ color: "#1f2937" }}>{videoSummary.summary}</p>
                      {videoSummary.key_points?.length > 0 && (
                        <>
                          <p className="mt-3 font-bold" style={{ color: "#27ae60" }}>Key Points</p>
                          <ul className="mt-1 list-disc list-inside space-y-1" style={{ color: "#1f2937" }}>
                            {videoSummary.key_points.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {videoSummary.study_tip && (
                        <>
                          <p className="mt-3 font-bold" style={{ color: "#3498db" }}>Study Tip</p>
                          <p className="mt-1" style={{ color: "#1f2937" }}>{videoSummary.study_tip}</p>
                        </>
                      )}
                      {videoSummary.error && (
                        <p className="mt-2 text-xs" style={{ color: "#e67e22" }}>Note: {videoSummary.error}</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* AI explanation — dialogue box */}
              {explanation && (
                <div className="dialogue-box mt-4 text-sm">
                  <p className="pokemon-label mb-2">🧠 AI Explanation</p>
                  <p className="font-bold" style={{ color: "#27ae60" }}>Summary</p>
                  <p className="mt-1" style={{ color: "#1f2937" }}>{explanation.concept_summary}</p>
                  <p className="mt-3 font-bold" style={{ color: "#3498db" }}>Simple Explanation</p>
                  <p className="mt-1" style={{ color: "#1f2937" }}>{explanation.simple_explanation}</p>
                </div>
              )}

              {/* AI Chat messages */}
              {messages.length > 0 && (
                <div className="pixel-card mt-4">
                  <p className="pokemon-label mb-2">💬 AI Chat</p>
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`max-w-[90%] px-3 py-2 text-sm leading-relaxed ${message.role === "user" ? "chat-user ml-auto" : "chat-ai"
                          }`}
                      >
                        {message.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat input */}
              <div className="mt-3 flex gap-2">
                <input
                  className="pixel-input w-full text-sm"
                  placeholder="Ask about this topic..."
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSendStudyMessage();
                  }}
                />
                <PixelButton
                  onClick={() => handleSendStudyMessage()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="text-xs"
                >
                  Send
                </PixelButton>
              </div>
            </>
          ) : (
            <p style={{ color: "#6b7280" }}>No videos available.</p>
          )}
        </PixelCard>

        {/* Lecture sidebar */}
        <PixelCard>
          <h3 className="retro-title text-base font-semibold">📚 Lecture Sections</h3>
          <div className="mt-3 max-h-[32rem] space-y-4 overflow-y-auto pr-2">
            {lectureCatalog.map((section) => (
              <div key={section.category}>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold" style={{ color: "#27ae60" }}>{section.category}</p>
                    <p style={{ color: "#6b7280" }}>
                      {sectionProgressMap[section.category]?.progress_percent || 0}%
                    </p>
                  </div>
                  <div className="xp-shell mt-1">
                    <div
                      className="xp-fill"
                      style={{ width: `${sectionProgressMap[section.category]?.progress_percent || 0}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {(section.topics || []).map((topic) => (
                    <button
                      key={topic.title}
                      onClick={() => handleSelectTopic(section.category, topic)}
                      className="w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-semibold transition"
                      style={
                        selectedVideo?.title === topic.title
                          ? { borderColor: "#2ecc71", background: "#d4edda", color: "#1f2937" }
                          : { borderColor: "#2d3436", background: "#f9fafb", color: "#1f2937" }
                      }
                      onMouseEnter={e => {
                        if (selectedVideo?.title !== topic.title) {
                          e.currentTarget.style.borderColor = "#2ecc71";
                          e.currentTarget.style.background = "#f0fff4";
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedVideo?.title !== topic.title) {
                          e.currentTarget.style.borderColor = "#2d3436";
                          e.currentTarget.style.background = "#f9fafb";
                        }
                      }}
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PixelCard>
      </div>
    </main>
  );
}

export default PrerecordedLectures;
