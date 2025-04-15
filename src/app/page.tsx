"use client";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <section className="w-full max-w-3xl text-center py-16">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          AI Task Planner
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl text-zinc-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
        >
          Open Source, AI-powered productivity. Plan, organize, and complete your tasks with voice, drag-and-drop, and more.
        </motion.p>
        <motion.div
          className="flex flex-col md:flex-row gap-4 justify-center mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        >
          <SignedOut>
            <Link href="/sign-in/" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow transition">Sign In</Link>
            <Link href="/sign-up/" className="px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-lg shadow transition">Sign Up</Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <Link href="/tasks" className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold text-lg shadow transition flex items-center gap-2 justify-center">
            <svg width="20" height="20" fill="currentColor" className="inline"><path d="M5 8h10v2H5zm0 4h10v2H5z"/></svg>
            Tasks
          </Link>
          <a href="https://github.com/gaddamanand/Ai-Task-Manager-1" target="_blank" rel="noopener" className="px-6 py-3 rounded-lg bg-white text-zinc-900 font-semibold text-lg shadow transition flex items-center gap-2 justify-center">
            <svg width="20" height="20" fill="currentColor" className="inline"><path d="M10 0C4.48 0 0 4.58 0 10.22c0 4.52 2.87 8.36 6.84 9.71.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.17-1.1-1.48-1.1-1.48-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 10 5.8c.85.004 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.58.69.48C17.13 18.58 20 14.74 20 10.22 20 4.58 15.52 0 10 0z"/></svg>
            GitHub
          </a>
        </motion.div>
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {features.map((f) => (
            <Feature key={f.title} {...f} />
          ))}
        </motion.div>
        <motion.div
          className="bg-zinc-900/80 rounded-xl p-6 text-left text-zinc-200 shadow-lg max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-2">How it works</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Sign up and log in securely.</li>
            <li>Add tasks by typing or speaking.</li>
            <li>Let AI suggest or illustrate tasks for you.</li>
            <li>Organize with drag-and-drop, bulk actions, and filters.</li>
            <li>Track your progress and stay productive!</li>
          </ol>
        </motion.div>
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="inline-block bg-green-700 text-white px-3 py-1 rounded-full text-xs font-semibold mr-2">Open Source</span>
          <span className="inline-block bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold">MIT Licensed</span>
        </motion.div>
        <footer className="text-zinc-500 text-xs mt-8">
          <a href="https://github.com/gaddamanand/Ai-Task-Manager-1" target="_blank" rel="noopener" className="underline">View on GitHub</a>
          {" • "}
          <Link href="/docs" className="underline">Docs</Link>
        </footer>
      </section>
    </main>
  );
}

const features = [
  { icon: "🤖", title: "AI Suggestions", desc: "Get smart, actionable tasks generated for you by GPT-4." },
  { icon: "🎤", title: "Voice Input", desc: "Add tasks with your voice for hands-free productivity." },
  { icon: "🖼️", title: "AI Images", desc: "Generate task illustrations with AI image tools." },
  { icon: "📦", title: "Bulk Actions", desc: "Select and manage multiple tasks at once." },
  { icon: "🔒", title: "Secure Auth", desc: "Clerk-powered authentication keeps your data safe." },
  { icon: "📱", title: "Mobile Ready", desc: "Beautiful, responsive design for any device." },
];

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <motion.div
      className="flex flex-col items-center w-36 bg-zinc-800/80 rounded-lg p-4 shadow text-center hover:scale-105 hover:bg-zinc-700/80 transition-transform duration-300"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className="font-semibold text-white mb-1">{title}</span>
      <span className="text-xs text-zinc-300">{desc}</span>
    </motion.div>
  );
}
