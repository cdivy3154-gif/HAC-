"use client";

import { useState } from "react";
import { MOCK_HACKATHONS } from "@/lib/mockData";
import styles from "./TeamForm.module.css";

const SKILL_SUGGESTIONS = [
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Python", "Java",
  "Flutter", "Swift", "Kotlin", "Go", "Rust", "TypeScript", "PostgreSQL",
  "MongoDB", "Firebase", "AWS", "Docker", "Kubernetes", "TensorFlow",
  "PyTorch", "NLP", "Computer Vision", "Blockchain", "Solidity",
  "UI/UX Design", "Figma", "Data Science", "DevOps", "Cybersecurity",
];

/**
 * TeamForm — Create team form with green-styled inputs
 */
export default function TeamForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    hackathon_id: "",
    description: "",
    max_members: 4,
    looking_for: [],
  });
  const [skillInput, setSkillInput] = useState("");

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSkill(skill) {
    if (skill && !form.looking_for.includes(skill)) {
      updateField("looking_for", [...form.looking_for, skill]);
    }
    setSkillInput("");
  }

  function removeSkill(skill) {
    updateField("looking_for", form.looking_for.filter((s) => s !== skill));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.hackathon_id) return;
    onSubmit?.(form);
  }

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (s) =>
      !form.looking_for.includes(s) &&
      s.toLowerCase().includes(skillInput.toLowerCase())
  ).slice(0, 6);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>🚀 Create a Team</h2>
      <p className={styles.formSubtitle}>Find your dream team for the next hackathon</p>

      {/* Team Name */}
      <div className={styles.field}>
        <label className={styles.label}>TEAM NAME</label>
        <input
          type="text"
          className={styles.input}
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="e.g. Neural Knights, Byte Bandits..."
          required
          maxLength={40}
        />
      </div>

      {/* Hackathon */}
      <div className={styles.field}>
        <label className={styles.label}>HACKATHON</label>
        <select
          className={styles.select}
          value={form.hackathon_id}
          onChange={(e) => updateField("hackathon_id", e.target.value)}
          required
        >
          <option value="">Select a hackathon...</option>
          {MOCK_HACKATHONS.map((h) => (
            <option key={h.id} value={h.id}>
              {h.title} — {h.organizer}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className={styles.field}>
        <label className={styles.label}>DESCRIPTION</label>
        <textarea
          className={styles.textarea}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="What are you building? What kind of teammates do you need?"
          rows={3}
          maxLength={300}
        />
        <span className={styles.charCount}>{form.description.length}/300</span>
      </div>

      {/* Max Members */}
      <div className={styles.field}>
        <label className={styles.label}>MAX TEAM SIZE</label>
        <div className={styles.sizeSelector}>
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.sizeBtn} ${form.max_members === n ? styles.sizeBtnActive : ""}`}
              onClick={() => updateField("max_members", n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Looking For Skills */}
      <div className={styles.field}>
        <label className={styles.label}>LOOKING FOR (SKILLS)</label>
        <div className={styles.skillInputWrapper}>
          <input
            type="text"
            className={styles.input}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput.trim());
              }
            }}
            placeholder="Type a skill and press Enter..."
          />
        </div>
        {skillInput && filteredSuggestions.length > 0 && (
          <div className={styles.suggestions}>
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                className={styles.suggestionBtn}
                onClick={() => addSkill(s)}
              >
                + {s}
              </button>
            ))}
          </div>
        )}
        {form.looking_for.length > 0 && (
          <div className={styles.selectedSkills}>
            {form.looking_for.map((skill) => (
              <span key={skill} className={styles.selectedSkill}>
                {skill}
                <button
                  type="button"
                  className={styles.removeSkill}
                  onClick={() => removeSkill(skill)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!form.name.trim() || !form.hackathon_id}
        >
          Create Team →
        </button>
      </div>
    </form>
  );
}
