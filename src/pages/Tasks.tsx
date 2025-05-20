
import { useTasks } from "@/contexts/TaskContext";
import TaskItem from "@/components/tasks/TaskItem";
import AddTaskForm from "@/components/tasks/AddTaskForm";

const TaskList = () => {
  const { tasks } = useTasks();
  
  return (
    <div className="flex-1 p-6">
      <div className="bg-[#1a1a1a] rounded-md p-4">
        <h3 className="text-lg font-medium mb-3">Your tasks</h3>
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
          <AddTaskForm group="today" />
        </div>
      </div>
    </div>
  );
};

export default TaskList;
