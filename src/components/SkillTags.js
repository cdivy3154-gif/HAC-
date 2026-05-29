"use client";

import { useState } from "react";
import styles from "./SkillTags.module.css";

const SUGGESTIONS = [
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Python", "Java",
  "Flutter", "Swift", "Kotlin", "Go", "Rust", "TypeScript", "PostgreSQL",
  "MongoDB", "Firebase", "AWS", "Docker", "Kubernetes", "TensorFlow",
  "PyTorch", "NLP", "Computer Vision", "Blockchain", "Solidity",
  "UI/UX Design", "Figma", "Data Science", "DevOps", "Cybersecurity",
  "Machine Learning", "GraphQL", "Redis", "C++", "Assembly",
];

/**
 * SkillTags — Editable skill tag list with green pills
 */
export default function SkillTags({ skills = [], onChange, readOnly = false, maxSkills = 10 }) {
  const [input, setInput] = useState("");

  function addSkill(skill) {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed) || skills.length >= maxSkills) return;
    onChange?.([...skills, trimmed]);
    setInput("");
  }

  function removeSkill(skill) {
    onChange?.(skills.filter((s) => s !== skill));
  }

  const filtered = input
    ? SUGGESTIONS.filter(
        (s) =>
          !skills.includes(s) &&
          s.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5)
    : [];

  if (readOnly) {
    return (
      <div className={styles.tagsRow}>
        {skills.map((s) => (
          <span key={s} className={styles.tag}>{s}</span>
        ))}
        {skills.length === 0 && (
          <span className={styles.empty}>No skills added yet</span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tagsRow}>
        {skills.map((s) => (
          <span key={s} className={`${styles.tag} ${styles.editable}`}>
            {s}
            <button className={styles.removeBtn} onClick={() => removeSkill(s)}>✕</button>
          </span>
        ))}
      </div>

      {skills.length < maxSkills && (
        <div className={styles.inputArea}>
          <input
            type="text"
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(input);
              }
            }}
            placeholder={`Add skill (${skills.length}/${maxSkills})...`}
          />
          {filtered.length > 0 && (
            <div className={styles.suggestions}>
              {filtered.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.suggestBtn}
                  onClick={() => addSkill(s)}
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
