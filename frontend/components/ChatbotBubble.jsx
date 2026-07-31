import { useEffect, useState } from "react";
import { FaComments, FaPaperPlane, FaTimes } from "react-icons/fa";
import { askChatbot } from "../services/chatbotService.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function ChatbotBubble() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      setMessages([]);
      setDraft("");
    }
  }, [user]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim() || !user) return;

    const question = draft.trim();
    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setDraft("");
    setIsLoading(true);

    try {
      const response = await askChatbot(question);
      setMessages([
        ...nextMessages,
        { role: "assistant", content: response.answerText || "I’m not sure how to answer that right now." }
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: error.message || "Sorry, I could not answer that." }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="w-[92vw] max-w-sm rounded-2xl border border-sky-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between bg-sky-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Aquarius Assistant</p>
              <p className="text-xs text-sky-100">Course-related questions only</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-sky-500">
              <FaTimes />
            </button>
          </div>

          <div className="h-80 overflow-y-auto bg-slate-50 p-3 space-y-2">
            {messages.length === 0 && (
              <div className="rounded-lg bg-white p-3 text-sm text-slate-600 shadow-sm">
                Ask me about your course materials and I will help explain them.
              </div>
            )}

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "bg-sky-600 text-white" : "bg-white text-slate-700 shadow-sm"}`}>
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}

          </div>

          <form onSubmit={handleSend} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about your course"
                className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <button type="submit" className="rounded-full bg-sky-600 p-2 text-white hover:bg-sky-700 disabled:opacity-60" disabled={isLoading || !draft.trim()}>
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-white shadow-lg hover:bg-sky-700"
      >
        <FaComments />
        <span className="font-medium">Ask AI</span>
      </button>
    </div>
  );
}

export default ChatbotBubble;
