'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import TaskForm from "@/features/tasks/TaskForm";
import TaskList from "@/features/tasks/TaskList";
import AISuggestions from "@/features/tasks/AISuggestions";

export default function TasksPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isLoaded && !userId) router.push("/sign-in");
  }, [userId, isLoaded]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  if (!isLoaded) return <div className="text-center text-lg text-white py-16">Loading...</div>;

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white drop-shadow tracking-tight">Your Tasks</h1>
      <AISuggestions onTaskCreated={handleRefresh} />
      <TaskForm onCreated={handleRefresh} />
      <TaskList key={refreshKey} />
    </main>
  );
}
