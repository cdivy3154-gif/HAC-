"use client";

import { useState, useRef } from "react";
import styles from "./ChatInput.module.css";

/**
 * ChatInput — Terminal-style text input for chat
 *
 * @param {Object} props
 * @param {function} props.onSend — callback when message is sent
 * @param {boolean} props.disabled — disables input
 */
export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || disabled) return;

    onSend(value);
    setValue("");
    
    // Focus back on input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  return (
    <form className={styles.inputForm} onSubmit={handleSubmit}>
      <div className={styles.inputContainer}>
        {/* Terminal prompt symbol */}
        <span className={styles.promptSymbol} onClick={() => inputRef.current?.focus()}>
          &gt;_
        </span>

        <input
          ref={inputRef}
          type="text"
          className={styles.textInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="type your response..."
          disabled={disabled}
          maxLength={500}
          autoComplete="off"
        />

        {/* Floating Custom Blinking Cursor block inside placeholder */}
        {value === "" && (
          <span className={styles.blinkingBlock} onClick={() => inputRef.current?.focus()}>
            █
          </span>
        )}
      </div>

      <button 
        type="submit" 
        className={styles.sendButton} 
        disabled={disabled || !value.trim()}
      >
        [EXECUTE]
      </button>
    </form>
  );
}
