import { useState } from "react";
import { studyChat } from "../services/api";

function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I’m your AI helper. Ask anything about topics, learning strategy, or quiz prep.",
    },
  ]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await studyChat({
        topic: "General Help",
        message: text,
        history: nextMessages,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.assistant_message || "I can help with learning plans, explanations, and quiz strategy.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Please login to use AI chat, then try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="chatbot-panel fixed bottom-28 right-6 z-50 w-[24rem] pixel-card">
          <div className="flex items-center justify-between border-b-2 border-[rgba(0,245,255,0.3)] px-1 pb-2">
            <p className="text-xs font-semibold text-[var(--retro-accent-blue)]">AI Help Chat</p>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200" aria-label="Close chat">
              ✕
            </button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[90%] rounded px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "chat-user ml-auto"
                    : "chat-ai"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2 border-t-2 border-[rgba(0,245,255,0.3)] pt-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Ask for help..."
              className="pixel-input w-full text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="pixel-button px-3 py-2 text-[10px] disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="chatbot-fab"
        title="Open AI Chat"
        aria-label="Open AI Chat"
      >
        🤖
      </button>
    </>
  );
}

export default FloatingChatbot;
