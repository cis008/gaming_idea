import { useState } from "react";
import { studyChat } from "../services/api";

function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI helper. Ask anything about topics, learning strategy, or quiz prep.",
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
        <div
          className="chatbot-panel fixed bottom-28 right-4 z-50 w-[calc(100vw-2rem)] sm:w-96 pixel-card"
          style={{ border: "3px solid #2d3436" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between rounded-t-lg px-3 pb-3 pt-2"
            style={{
              background: "linear-gradient(90deg, #2ecc71, #27ae60)",
              borderBottom: "2px solid #2d3436",
              margin: "-1.25rem -1.25rem 0.75rem -1.25rem",
              borderRadius: "0.6rem 0.6rem 0 0",
            }}
          >
            <p
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "0.6rem",
                color: "#f1c40f",
                textShadow: "1px 1px 0 #2d3436",
              }}
            >
              🤖 AI Help Chat
            </p>
            <button
              onClick={() => setOpen(false)}
              className="font-bold hover:opacity-70 transition"
              style={{ color: "#ffffff", fontSize: "1.1rem" }}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="max-h-72 space-y-2 overflow-y-auto p-1">
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

          {/* Input */}
          <div
            className="mt-3 flex gap-2 pt-3"
            style={{ borderTop: "2px solid rgba(46, 204, 113, 0.3)" }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
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
