// Server Component: TaskCard
import futuristicGradient from "@/assets/futuristic-gradient.module.css";
import Image from "next/image";
import { Task } from "./TaskList";

// Props: task (Task), onEdit (function), onDelete (function), editingId, editData, setEditData, handleEditSubmit, cancelEdit
export default function TaskCard({
  task,
  isEditing,
  editData,
  setEditData,
  handleEditSubmit,
  cancelEdit,
  onEdit,
  onDelete,
}: {
  task: Task;
  isEditing: boolean;
  editData: Partial<Task>;
  setEditData: (data: Partial<Task>) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  cancelEdit: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative bg-white/10 dark:bg-zinc-900/80 rounded-2xl shadow-lg p-6 md:p-8 lg:p-10 flex flex-col gap-3 border border-white/10 backdrop-blur-md hover:scale-[1.03] transition-transform duration-200">
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
          <input className="input futuristic text-white/90 placeholder-gray-400/90" value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })} />
          <textarea className="input futuristic text-white/90 placeholder-gray-400/90" value={editData.description || ""} onChange={e => setEditData({ ...editData, description: e.target.value })} />
          <div className="flex gap-2">
            <input className="input futuristic flex-1 text-white/90 placeholder-gray-400/90" value={editData.priority || ""} onChange={e => setEditData({ ...editData, priority: e.target.value })} placeholder="Priority" />
            <input className="input futuristic flex-1 text-white/90 placeholder-gray-400/90" value={editData.status || ""} onChange={e => setEditData({ ...editData, status: e.target.value })} placeholder="Status" />
            <input className="input futuristic flex-1 text-white/90 placeholder-gray-400/90" type="date" value={editData.due_date?.slice(0,10) || ""} onChange={e => setEditData({ ...editData, due_date: e.target.value })} />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="btn bg-gradient-to-r from-blue-500 to-purple-600 text-white/90 px-4 py-2 rounded-lg" type="submit">Save</button>
            <button className="btn bg-gray-700 text-white/90 px-4 py-2 rounded-lg" type="button" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="font-bold text-lg tracking-wide text-white drop-shadow mb-1">{task.title}</div>
          <div className="text-sm text-zinc-200 mb-2">{task.description}</div>
          <div className="flex gap-2 text-xs mt-1 mb-2">
            <span className="px-2 py-1 bg-blue-400/30 text-blue-100 rounded-full">{task.priority}</span>
            <span className="px-2 py-1 bg-green-400/30 text-green-100 rounded-full">{task.status}</span>
            {task.due_date && <span className="px-2 py-1 bg-yellow-400/30 text-yellow-100 rounded-full">Due: {task.due_date.slice(0,10)}</span>}
          </div>
          {task.image_url && (
            <Image src={task.image_url} alt="Task visual" className="rounded-xl mt-2 max-h-40 object-cover border border-white/10" width={400} height={160} style={{objectFit: 'cover', maxHeight: '160px'}} />
          )}
          <div className="flex gap-3 mt-4">
            <button className="btn bg-gradient-to-r from-purple-500 to-pink-500 text-white/90 px-3 py-1 rounded-full text-xs" onClick={() => onEdit(task)}>Edit</button>
            <button className="btn bg-gradient-to-r from-red-500 to-orange-500 text-white/90 px-3 py-1 rounded-full text-xs" onClick={() => onDelete(task.id)}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}
