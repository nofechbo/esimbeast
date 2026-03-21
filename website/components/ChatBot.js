import { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import ReactMarkdown from "react-markdown";
import { SITE_NAME } from "@/config";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: `Hi! I'm the ${SITE_NAME} assistant. How can I help you today?`,
};

export default function ChatBot({ defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isLoading) inputRef.current?.focus();
  }, [isOpen, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Send only user/assistant messages (not the initial greeting)
      const apiMessages = updatedMessages
        .filter((m) => m !== INITIAL_MESSAGE)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        const errorMsg = data.error || "Sorry, something went wrong. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't connect. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isConversationCapped = messages.length >= 21; // 1 initial + 20 user/assistant

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <HeaderTitle>{SITE_NAME} Support</HeaderTitle>
            <CloseButton onClick={() => setIsOpen(false)} aria-label="Close chat">
              &times;
            </CloseButton>
          </ChatHeader>

          <MessagesContainer>
            {messages.map((msg, i) => (
              <MessageBubble key={i} $isUser={msg.role === "user"}>
                {msg.role === "assistant" ? (
                  <MarkdownContent>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </MarkdownContent>
                ) : (
                  msg.content
                )}
              </MessageBubble>
            ))}
            {isLoading && (
              <MessageBubble $isUser={false}>
                <TypingDots>
                  <span />
                  <span />
                  <span />
                </TypingDots>
              </MessageBubble>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputContainer>
            {isConversationCapped ? (
              <NewChatButton onClick={resetChat}>Start a new chat</NewChatButton>
            ) : (
              <>
                <ChatInput
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  maxLength={500}
                  disabled={isLoading}
                />
                <SendButton onClick={sendMessage} disabled={isLoading || !input.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </SendButton>
              </>
            )}
          </InputContainer>
        </ChatWindow>
      )}

      {/* Floating Button */}
      <FloatingButton onClick={() => setIsOpen(!isOpen)} aria-label="Open chat">
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18" />
            <path d="M6 6L18 18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </FloatingButton>
    </>
  );
}

// Styled Components

const FloatingButton = styled("button")({
  position: "fixed",
  bottom: "24px",
  right: "24px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "#112B3C",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
  zIndex: 1000,
  transition: "transform 0.2s, background 0.2s",
  "&:hover": {
    transform: "scale(1.08)",
    background: "#1a3f57",
  },
});

const ChatWindow = styled("div")({
  position: "fixed",
  bottom: "92px",
  right: "24px",
  width: "380px",
  height: "520px",
  borderRadius: "16px",
  background: "#fff",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.18)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  zIndex: 1000,
  fontFamily: "var(--font-kanit), Kanit, sans-serif",

  "@media (max-width: 480px)": {
    width: "calc(100vw - 16px)",
    height: "calc(100vh - 120px)",
    right: "8px",
    bottom: "88px",
    borderRadius: "12px",
  },
});

const ChatHeader = styled("div")({
  background: "#112B3C",
  color: "#fff",
  padding: "16px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
});

const HeaderTitle = styled("span")({
  fontWeight: 600,
  fontSize: "15px",
  letterSpacing: "0.3px",
});

const CloseButton = styled("button")({
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: "22px",
  cursor: "pointer",
  lineHeight: 1,
  padding: "0 4px",
  opacity: 0.8,
  "&:hover": { opacity: 1 },
});

const MessagesContainer = styled("div")({
  flex: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  background: "#f7f8fa",
});

const MessageBubble = styled("div")(({ $isUser }) => ({
  maxWidth: "80%",
  padding: "10px 14px",
  borderRadius: $isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
  background: $isUser ? "#ec4899" : "#fff",
  color: $isUser ? "#fff" : "#1a1a1a",
  alignSelf: $isUser ? "flex-end" : "flex-start",
  fontSize: "14px",
  lineHeight: "1.5",
  boxShadow: $isUser ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
  wordBreak: "break-word",
}));

const MarkdownContent = styled("div")({
  "& p": { margin: "0 0 8px 0" },
  "& p:last-child": { marginBottom: 0 },
  "& strong": { fontWeight: 600 },
  "& ul, & ol": { margin: "4px 0", paddingLeft: "18px" },
  "& li": { marginBottom: "2px" },
  "& a": { color: "#ec4899", textDecoration: "underline" },
  "& code": {
    background: "rgba(0,0,0,0.06)",
    borderRadius: "3px",
    padding: "1px 4px",
    fontSize: "13px",
  },
});

const InputContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  borderTop: "1px solid #e8e8e8",
  background: "#fff",
  gap: "8px",
  flexShrink: 0,
});

const ChatInput = styled("input")({
  flex: 1,
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  "&:focus": { borderColor: "#112B3C" },
  "&:disabled": { opacity: 0.6 },
});

const NewChatButton = styled("button")({
  flex: 1,
  background: "#112B3C",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
  "&:hover": { opacity: 0.85 },
});

const SendButton = styled("button")({
  background: "#112B3C",
  border: "none",
  borderRadius: "8px",
  width: "38px",
  height: "38px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#fff",
  flexShrink: 0,
  transition: "opacity 0.2s",
  "&:disabled": { opacity: 0.4, cursor: "default" },
  "&:hover:not(:disabled)": { opacity: 0.85 },
});

const TypingDots = styled("div")({
  display: "flex",
  gap: "4px",
  padding: "4px 0",
  "& span": {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#999",
    animation: "typing 1.2s infinite ease-in-out",
  },
  "& span:nth-of-type(2)": { animationDelay: "0.2s" },
  "& span:nth-of-type(3)": { animationDelay: "0.4s" },
  "@keyframes typing": {
    "0%, 80%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
    "40%": { opacity: 1, transform: "scale(1)" },
  },
});
