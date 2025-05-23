
import { useState } from "react";
import { Task, useTasks, Priority } from "@/contexts/TaskContext";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { X, Edit, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type TaskItemProps = {
  task: Task;
};

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-500 text-white",
  medium: "bg-orange-500 text-white",
  high: "bg-red-500 text-white"
};

const TaskItem = ({ task }: TaskItemProps) => {
  const { updateTask, deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleCheckboxChange = () => {
    updateTask(task.id, { completed: !task.completed });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedTitle(task.title);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim()) {
      updateTask(task.id, { title: editedTitle });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 py-2 px-1 hover:bg-gray-800/50 rounded group",
      task.completed && "opacity-70",
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleCheckboxChange}
        className="h-5 w-5 rounded-sm border-gray-600"
      />

      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-gray-900 border-gray-700"
          />
          <button onClick={handleSaveEdit} className="p-1 text-green-500 hover:text-green-400">
            <Check size={18} />
          </button>
        </div>
      ) : (
        <>
          <span className={cn(
            "flex-1", 
            task.completed && "line-through text-gray-500"
          )}>
            {task.title}
          </span>

          {task.priority && (
            <Badge className={priorityColors[task.priority]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          )}

          {task.dueDate && (
            <span className="text-xs text-gray-400">
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </span>
          )}

          <button 
            className="opacity-0 group-hover:opacity-100 p-1 text-blue-500 hover:text-blue-400"
            onClick={handleEditClick}
          >
            <Edit size={16} />
          </button>

          <button 
            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-400"
            onClick={() => deleteTask(task.id)}
          >
            <X size={16} />
          </button>
        </>
      )}
    </div>
  );
};

export default TaskItem;
