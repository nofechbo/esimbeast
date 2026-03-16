import { useState } from "react";
import dynamic from "next/dynamic";

const ChatBot = dynamic(() => import("@/components/ChatBot"), { ssr: false });

export default function ChatLauncher() {
  const [activated, setActivated] = useState(false);

  if (activated) return <ChatBot defaultOpen />;

  return (
    <button
      onClick={() => setActivated(true)}
      aria-label="Open chat"
      style={{
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
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    </button>
  );
}
