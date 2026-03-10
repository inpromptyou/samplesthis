"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  sender: string;
  message: string;
  created_at: string;
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/testers/me").then(r => r.json()).then(d => {
      setAuthed(!!d.authenticated);
    }).catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (open && authed) {
      fetch("/api/support").then(r => r.json()).then(d => {
        setMessages(d.messages || []);
      }).catch(() => {});
    }
  }, [open, authed]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages when open
  useEffect(() => {
    if (!open || !authed) return;
    const interval = setInterval(() => {
      fetch("/api/support").then(r => r.json()).then(d => {
        if (d.messages) setMessages(d.messages);
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [open, authed]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });
      const d = await res.json();
      if (d.message) {
        setMessages(prev => [...prev, d.message]);
        setInput("");
      }
    } catch {}
    setSending(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #F97316, #EA580C)",
          color: "white", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s",
          transform: open ? "rotate(45deg)" : "none",
        }}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 92, right: 24, zIndex: 9998,
          width: 360, maxHeight: 500, borderRadius: 16,
          background: "white", border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px", background: "linear-gradient(135deg, #F97316, #EA580C)",
            color: "white",
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Support</p>
            <p style={{ fontSize: 12, opacity: 0.8, margin: "2px 0 0" }}>We typically reply within a few hours</p>
          </div>

          {authed === false ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Sign in to chat with support.</p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: 16, maxHeight: 320, minHeight: 200 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <p style={{ fontSize: 13, color: "#999" }}>No messages yet.</p>
                    <p style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>Ask us anything about Flinchify!</p>
                  </div>
                )}
                {messages.map(m => (
                  <div key={m.id} style={{
                    display: "flex",
                    justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
                    marginBottom: 8,
                  }}>
                    <div style={{
                      maxWidth: "80%", padding: "10px 14px", borderRadius: 12,
                      background: m.sender === "user" ? "#F97316" : "#F3F4F6",
                      color: m.sender === "user" ? "white" : "#111",
                      fontSize: 13, lineHeight: 1.5,
                      borderBottomRightRadius: m.sender === "user" ? 4 : 12,
                      borderBottomLeftRadius: m.sender === "admin" ? 4 : 12,
                    }}>
                      {m.sender === "admin" && (
                        <p style={{ fontSize: 10, fontWeight: 600, color: "#F97316", margin: "0 0 4px", textTransform: "uppercase" }}>Flinchify Team</p>
                      )}
                      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.message}</p>
                      <p style={{ fontSize: 10, opacity: 0.6, margin: "4px 0 0", textAlign: "right" }}>
                        {new Date(m.created_at).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") send(); }}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.08)", fontSize: 13,
                    outline: "none", color: "#111",
                  }}
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  style={{
                    padding: "10px 16px", borderRadius: 8, border: "none",
                    background: "#F97316", color: "white", fontSize: 13,
                    fontWeight: 600, cursor: "pointer",
                    opacity: (sending || !input.trim()) ? 0.5 : 1,
                  }}
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
