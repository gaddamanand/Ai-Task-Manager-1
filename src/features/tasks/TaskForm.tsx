"use client";
import { useState } from "react";
import futuristicGradient from "@/assets/futuristic-gradient.module.css";
import VoiceInput from "./VoiceInput";

export default function TaskForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  // Spinner for loading states (shared component)
  function Spinner() {
    return (
      <span className="inline-block w-5 h-5 border-2 border-t-transparent border-white/10 rounded-full animate-spin align-middle mr-2" aria-label="Loading"></span>
    );
  }

  // Shared input style
  const inputClass = "input futuristic text-white px-2 py-1 placeholder-white bg-black/80 focus:bg-black/90 border border-white/10 rounded-xl";

  // Example prompts for productivity/task planner use case
  const examplePrompts = [
    "A futuristic digital planner interface, glowing neon colors",
    "A checklist with completed and pending tasks, vector art",
    "A robot organizing sticky notes on a wall, 3D render",
    "A calendar with important dates highlighted, minimal style",
    "A person using a voice assistant to add a task, illustration"
  ];

  const statusOptions = [
    { value: "To Do", label: "To Do" },
    { value: "In Progress", label: "In Progress" },
    { value: "Done", label: "Done" },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
          due_date: dueDate,
          image_url: imageUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      setTitle("");
      setDescription("");
      setPriority("");
      setStatus("");
      setDueDate("");
      setImagePrompt("");
      setImageUrl("");
      if (onCreated) onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageGen(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setImageLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fal-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <form className={`bg-gradient-to-br from-[#232526] via-[#414345] to-[#232526] ${futuristicGradient.glow} rounded-3xl shadow-2xl p-8 flex flex-col gap-5 mb-10 border border-white/10`} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="font-medium text-white tracking-wide text-lg">Title</label>
        <div className="flex gap-2 items-center">
          <input className={`${inputClass} flex-1`} required value={title} onChange={e => setTitle(e.target.value)} />
          <VoiceInput onTranscribed={setTitle} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-white">Description</label>
        <textarea className={inputClass} value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-white">Priority</label>
          <input className={inputClass} value={priority} onChange={e => setPriority(e.target.value)} placeholder="Low, Medium, High" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="block text-white mb-1 mt-4" htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            className={inputClass + " w-full"}
            required
          >
            <option value="" disabled>Select status…</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-white">Due Date</label>
          <input className={inputClass} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-white">Generate Task Image (Fal)</label>
        <div className="flex gap-2 items-center">
          <input className={`${inputClass} flex-1`} value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} placeholder="Describe image for this task..." />
          <button type="button" className="btn bg-gradient-to-r from-pink-500 to-yellow-500 text-white py-2 px-4 rounded-xl shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-50 flex items-center" disabled={imageLoading} onClick={handleImageGen}>{imageLoading ? (<><Spinner />Generating...</>) : "Generate"}</button>
        </div>
        {/* Example prompts UI */}
        <div className="flex flex-wrap gap-2 mt-2">
          {examplePrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm hover:bg-pink-600 hover:text-white border border-gray-600 transition"
              onClick={() => setImagePrompt(prompt)}
              aria-label={`Use example prompt: ${prompt}`}
            >
              {prompt}
            </button>
          ))}
        </div>
        {imageUrl && <img src={imageUrl} alt="Task visual" className="rounded-xl mt-2 max-h-40 object-cover border border-white/10" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; setError('Failed to load image'); }} />}
      </div>
      {error && <div className="text-red-400 text-sm font-semibold">{error}</div>}
      <button className="btn bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 pl-6 px-4 rounded-xl mt-2 text-lg shadow-lg hover:scale-[1.03] transition-transform duration-200 disabled:opacity-50 flex items-center" type="submit" disabled={loading}>{loading ? (<><Spinner />Creating...</>) : "Create Task"}</button>
    </form>
  );
}
