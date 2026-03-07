"use client";

import { useState, useEffect, useRef } from "react";

const WORDS = ["users", "customers", "managers", "agents", "testers", "clients", "investors", "developers"];
const TYPE_SPEED = 90;
const DELETE_SPEED = 50;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 350;

type Phase = "typing" | "pausing" | "deleting" | "waiting";

export default function TypingRotate() {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const phaseRef = useRef<Phase>("typing");
  const indexRef = useRef(0);
  const charRef = useRef(0);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function step() {
      const word = WORDS[indexRef.current];
      const phase = phaseRef.current;

      if (phase === "typing") {
        charRef.current++;
        setDisplayed(word.slice(0, charRef.current));
        if (charRef.current >= word.length) {
          phaseRef.current = "pausing";
          timeout = setTimeout(step, PAUSE_AFTER_TYPE);
        } else {
          timeout = setTimeout(step, TYPE_SPEED + Math.random() * 40);
        }
      } else if (phase === "pausing") {
        phaseRef.current = "deleting";
        timeout = setTimeout(step, 0);
      } else if (phase === "deleting") {
        charRef.current--;
        setDisplayed(word.slice(0, charRef.current));
        if (charRef.current <= 0) {
          phaseRef.current = "waiting";
          timeout = setTimeout(step, PAUSE_AFTER_DELETE);
        } else {
          timeout = setTimeout(step, DELETE_SPEED);
        }
      } else if (phase === "waiting") {
        indexRef.current = (indexRef.current + 1) % WORDS.length;
        phaseRef.current = "typing";
        timeout = setTimeout(step, 0);
      }
    }

    // Start after initial delay
    timeout = setTimeout(step, 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <span className="typing-rotate-wrapper">
      <span className="typing-word">{displayed}</span>
      <span className="typing-cursor" style={{ opacity: showCursor ? 1 : 0 }}>|</span>
    </span>
  );
}
