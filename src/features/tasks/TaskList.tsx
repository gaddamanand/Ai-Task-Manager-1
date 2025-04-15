"use client";
import { useEffect, useState, useOptimistic, startTransition, useCallback } from "react";
import TaskCard from "./TaskCard";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  image_url?: string;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});

  // Optimistic state for tasks
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(tasks);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        startTransition(() => {
          setOptimisticTasks(data);
        });
      })
      .finally(() => setLoading(false));
  }, [setOptimisticTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleDelete(id: string) {
    // Optimistically remove from UI
    startTransition(() => {
      setOptimisticTasks((prev: Task[]) => prev.filter((t) => t.id !== id));
    });
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditData(task);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    // Optimistically update task in UI
    startTransition(() => {
      setOptimisticTasks((prev: Task[]) => prev.map((t) => t.id === editingId ? { ...t, ...editData } as Task : t));
    });
    await fetch(`/api/tasks/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditingId(null);
    setEditData({});
    fetchTasks();
  }

  // Search/filter state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tasks by search term
  const filteredTasks = optimisticTasks.filter((task) => {
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term) ||
      task.status.toLowerCase().includes(term)
    );
  });

  // Group filtered tasks by status
  const groupedTasks = filteredTasks.reduce((groups: Record<string, Task[]>, task) => {
    if (!groups[task.status]) groups[task.status] = [];
    groups[task.status].push(task);
    return groups;
  }, {});

  // Track expanded task
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  // Handle drag end
  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    // Find the task
    const task = filteredTasks.find(t => t.id === draggableId);
    if (!task) return;
    // Optimistically update status
    startTransition(() => {
      setOptimisticTasks((prev: Task[]) => prev.map(t => t.id === task.id ? { ...t, status: destination.droppableId } : t));
    });
    // Update on server
    fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: destination.droppableId }),
    });
  }

  // Bulk selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function selectAll(status: string) {
    const ids = groupedTasks[status]?.map(t => t.id) || [];
    setSelected(prev => {
      const next = new Set(prev);
      const allSelected = ids.every(id => next.has(id));
      ids.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  }
  function clearSelection() { setSelected(new Set()); }

  // Bulk actions
  async function bulkDelete() {
    const ids = Array.from(selected);
    startTransition(() => setOptimisticTasks((prev: Task[]) => prev.filter(t => !selected.has(t.id))));
    await Promise.all(ids.map(id => fetch(`/api/tasks/${id}`, { method: "DELETE" })));
    clearSelection();
    fetchTasks();
  }
  async function bulkMarkStatus(newStatus: string) {
    const ids = Array.from(selected);
    startTransition(() => setOptimisticTasks((prev: Task[]) => prev.map(t => selected.has(t.id) ? { ...t, status: newStatus } : t)));
    await Promise.all(ids.map(id => {
      const task = optimisticTasks.find(t => t.id === id);
      return fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: newStatus }),
      });
    }));
    clearSelection();
    fetchTasks();
  }

  if (loading) return <div className="text-white text-center py-8">Loading tasks...</div>;

  // Bulk action bar
  const showBulkBar = selected.size > 0;

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Bulk action bar */}
      {showBulkBar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 shadow-xl rounded-full flex gap-4 px-6 py-3 border border-zinc-700 items-center animate-fade-in">
          <span className="text-white text-sm">{selected.size} selected</span>
          <button onClick={() => bulkMarkStatus("Done")} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs">Mark as Done</button>
          <button onClick={() => bulkMarkStatus("In Progress")} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs">Move to In Progress</button>
          <button onClick={bulkDelete} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs">Delete</button>
          <button onClick={clearSelection} className="ml-2 text-zinc-400 hover:text-white text-xs">Clear</button>
        </div>
      )}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search tasks..."
          className="w-full md:w-1/2 px-4 py-2 rounded-lg bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col gap-8">
          {Object.keys(groupedTasks).length === 0 && (
            <div className="text-center text-white/80 py-10">No tasks found.</div>
          )}
          {Object.keys(groupedTasks).map(status => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`mb-8 rounded-lg pb-2 ${snapshot.isDraggingOver ? 'bg-blue-900/30' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={groupedTasks[status].every(t => selected.has(t.id)) && groupedTasks[status].length > 0}
                      onChange={() => selectAll(status)}
                      className="accent-blue-500 w-4 h-4"
                    />
                    <h2 className="text-xl font-bold text-white capitalize sticky top-16 z-10 bg-zinc-900/80 py-2 px-2 rounded-t-lg border-b border-zinc-700 flex-1">{status}</h2>
                  </div>
                  <div className="flex flex-col gap-2">
                    {groupedTasks[status].map((task, idx) => (
                      <Draggable draggableId={task.id} index={idx} key={task.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer rounded-lg px-4 py-3 bg-zinc-800/80 border border-zinc-700 flex items-center justify-between transition hover:bg-zinc-700/80 ${expandedId === task.id ? 'ring-2 ring-blue-500' : ''} ${snapshot.isDragging ? 'shadow-lg bg-blue-900/40' : ''}`}
                            onClick={() => toggleExpand(task.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selected.has(task.id)}
                              onChange={e => { e.stopPropagation(); toggleSelect(task.id); }}
                              className="accent-blue-500 w-4 h-4 mr-2"
                              onClick={e => e.stopPropagation()}
                            />
                            <span className="font-medium text-white truncate mr-2">{task.title}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-400/20 text-blue-200 mr-2">{task.priority}</span>
                            {task.due_date && <span className="text-xs px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-200">{task.due_date.slice(0,10)}</span>}
                            <span className="ml-4 text-zinc-400 text-xs">{expandedId === task.id ? '▲' : '▼'}</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  {groupedTasks[status].map(task => (
                    expandedId === task.id && (
                      <div className="mt-2 ml-4" key={task.id + "-expanded"}>
                        <TaskCard
                          task={task}
                          isEditing={editingId === task.id}
                          editData={editData}
                          setEditData={setEditData}
                          handleEditSubmit={handleEditSubmit}
                          cancelEdit={cancelEdit}
                          onEdit={startEdit}
                          onDelete={handleDelete}
                        />
                      </div>
                    )
                  ))}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
