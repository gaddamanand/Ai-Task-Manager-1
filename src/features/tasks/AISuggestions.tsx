"use client";
import { useState } from "react";
import futuristicGradient from "@/assets/futuristic-gradient.module.css";

export default function AISuggestions({ onTaskCreated }: { onTaskCreated?: () => void }) {
  const [context, setContext] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingIdx, setAddingIdx] = useState<number | null>(null);

  async function handleSuggest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuggestions(null);
    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get suggestions");
      // Split suggestions into lines or bullets
      const parsed = (data.suggestions as string)
        .split(/\n|\r/)
        .map((line: string) => line.replace(/^\d+\.|^- /, "").trim())
        .filter((line: string) => line.length > 0);
      setSuggestions(parsed);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(idx: number, text: string) {
    setAddingIdx(idx);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: text }),
      });
      if (onTaskCreated) onTaskCreated();
    } finally {
      setAddingIdx(null);
    }
  }

  return (
    <section className={`mb-10 p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-[#232526] via-[#414345] to-[#232526] border border-white/10 ${futuristicGradient.glow}`}
      aria-labelledby="ai-suggestions-heading"
    >
      <h2 id="ai-suggestions-heading" className="text-xl font-bold text-white mb-4 tracking-wide">AI Task Suggestions</h2>
      <form onSubmit={handleSuggest} className="flex gap-2 mt-4">
        <input
          className="flex-1 bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white focus:bg-black/90 focus:outline-none"
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="Describe your context or goal (optional)"
        />
        <button
          className="btn bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Suggesting..." : "Suggest Tasks"}
        </button>
      </form>
      {error && <div className="text-red-400 text-sm font-semibold mt-2">{error}</div>}
      {suggestions && suggestions.length > 0 && (
        <ul className="mt-6 grid gap-4">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 text-white border border-white/10 shadow-inner">
              <span className="flex-1 whitespace-pre-line">{s}</span>
              <button
                className="btn bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                disabled={!!addingIdx || addingIdx === i}
                aria-label={`Add suggestion ${i + 1} as a task`}
                onClick={() => handleAdd(i, s)}
              >
                {addingIdx === i ? "Adding..." : "Add to Tasks"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
