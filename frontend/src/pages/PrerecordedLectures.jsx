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
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-[#facc15]">Learning Section</h1>
      <p className="mt-2 text-slate-700">Watch section-wise learning videos and take a quiz for each selected topic.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <PixelCard className="lg:col-span-2">
          {embedUrl ? (
            <>
              <div className="aspect-video overflow-hidden border-[3px] border-[#22c55e]">
                <iframe
                  title={selectedVideo?.title || "Lecture Player"}
                  src={embedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <h2 className="mt-4 text-xl font-semibold">{selectedVideo?.title}</h2>
              <p className="mt-1 text-sm text-slate-600">Section: {selectedVideo?.category}</p>
              <a
                href={selectedVideo?.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-cyan-300 hover:text-cyan-200"
              >
                Open on YouTube
              </a>

              <div className="mt-4 flex flex-wrap gap-2">
                <PixelButton
                  onClick={handleExplain}
                  disabled={loadingExplain}
                  className="text-xs"
                >
                  {loadingExplain ? "Explaining..." : "AI Explain Concept"}
                </PixelButton>
                <PixelButton
                  onClick={() => handleSendStudyMessage("Help me study this topic in a conversation and test my previous knowledge first.")}
                  disabled={chatLoading}
                  className="text-xs bg-[#1f2937] text-white"
                >
                  {chatLoading ? "Starting Chat..." : "Start AI Chat"}
                </PixelButton>
                <PixelButton
                  onClick={handleGenerateQuiz}
                  className="text-xs bg-[#ef4444] text-white"
                >
                  Take Quiz for This Video
                </PixelButton>
                <PixelButton
                  onClick={handleSummarizeVideo}
                  disabled={loadingSummary}
                  className="text-xs bg-[#7c3aed] text-white"
                >
                  {loadingSummary ? "Summarizing..." : "AI Summarize Video"}
                </PixelButton>
              </div>

              {videoSummary && (
                <div className="pixel-card mt-4 text-sm border-[#7c3aed]">
                  <p className="font-semibold text-purple-400 mb-1">Claude AI Summary</p>
                  {videoSummary.error && !videoSummary.summary && (
                    <p className="text-red-400">{videoSummary.error}</p>
                  )}
                  {videoSummary.summary && (
                    <>
                      <p className="text-slate-300">{videoSummary.summary}</p>
                      {videoSummary.key_points?.length > 0 && (
                        <>
                          <p className="mt-3 font-semibold text-purple-400">Key Points</p>
                          <ul className="mt-1 list-disc list-inside space-y-1 text-slate-300">
                            {videoSummary.key_points.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {videoSummary.study_tip && (
                        <>
                          <p className="mt-3 font-semibold text-purple-400">Study Tip</p>
                          <p className="mt-1 text-slate-300">{videoSummary.study_tip}</p>
                        </>
                      )}
                      {videoSummary.error && (
                        <p className="mt-2 text-xs text-yellow-500">Note: {videoSummary.error}</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {explanation && (
                <div className="pixel-card mt-4 text-sm">
                  <p className="font-semibold text-cyan-200">Summary</p>
                  <p className="mt-1 text-slate-300">{explanation.concept_summary}</p>
                  <p className="mt-3 font-semibold text-cyan-200">Simple Explanation</p>
                  <p className="mt-1 text-slate-300">{explanation.simple_explanation}</p>
                </div>
              )}

              {messages.length > 0 && (
                <div className="pixel-card mt-4">
                  <p className="mb-2 font-semibold text-cyan-200">AI Chat</p>
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`max-w-[90%] rounded px-3 py-2 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "ml-auto border border-[#7dd3fc] bg-[#e0f2fe] text-[#0f172a]"
                            : "border border-[#1e293b] bg-[#0f172a] text-white"
                        }`}
                      >
                        {message.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  className="pixel-input w-full text-sm"
                  placeholder="Ask about this topic..."
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSendStudyMessage();
                    }
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
            <p className="text-slate-600">No videos available.</p>
          )}
        </PixelCard>

        <PixelCard>
          <h3 className="text-lg font-semibold">Lecture Sections</h3>
          <div className="mt-3 max-h-[32rem] space-y-4 overflow-y-auto pr-2">
            {lectureCatalog.map((section) => (
              <div key={section.category}>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-cyan-300">{section.category}</p>
                    <p className="text-slate-600">{sectionProgressMap[section.category]?.progress_percent || 0}%</p>
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
                      className={`w-full rounded-none border-[3px] px-3 py-2 text-left text-sm transition ${
                        selectedVideo?.title === topic.title
                          ? "border-[#22c55e] bg-[#38bdf8] text-[#0f172a]"
                          : "border-[#22c55e] bg-[#0b1224] text-[#dbeafe] hover:bg-[#1f2937] hover:text-[#ffffff]"
                      }`}
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
