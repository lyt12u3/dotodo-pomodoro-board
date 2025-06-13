import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { useTasks, Task } from '../contexts/TaskContext';
import { List, LayoutGrid, Check, Trash2, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Portal from '@radix-ui/react-portal';

type ViewMode = 'list' | 'board';
type TaskCategory = Task['category'];

const TaskForm: React.FC<{ 
  category: TaskCategory;
  onAddTask: (task: string, priority?: 'low' | 'medium' | 'high') => void;
}> = ({ category, onAddTask }) => {
  const [taskText, setTaskText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddTask(taskText.trim(), 'medium');
        setTaskText('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center mb-2">
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Add task..."
        className="w-full p-2 rounded-md bg-secondary text-white border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#403085]"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={!taskText.trim() || isSubmitting}
        className="ml-2 p-2 rounded-md bg-[#403085] hover:bg-[#403085]/90 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-[#403085]/25"
      >
        {isSubmitting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#9CA3AF] border-t-transparent" />
        ) : (
          <Plus className="h-5 w-5 stroke-[2.5] text-[#9CA3AF]" />
        )}
      </button>
    </form>
  );
};

const TaskItem: React.FC<{
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onChangePriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
}> = ({ task, onToggleComplete, onDelete, onChangePriority }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-priority-low';
      case 'medium': return 'bg-priority-medium';
      case 'high': return 'bg-priority-high';
      default: return 'bg-priority-low';
    }
  };

  const handleToggleComplete = async () => {
    if (!isUpdating) {
      setIsUpdating(true);
      try {
        await onToggleComplete(task.id);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
      }
    }
  };

  return (
    <>
      <div
        className={`flex items-center justify-between p-3 rounded-md bg-secondary mb-2 group animate-in fade-in slide-in-from-left-5 transition-all duration-300 ${task.completed ? 'opacity-60 scale-95' : 'opacity-100 scale-100'}`}
      >
        <div className="flex items-center gap-3 flex-grow">
          <button
            onClick={handleToggleComplete}
            disabled={isUpdating}
            className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
              task.completed ? 'bg-primary border-primary' : 'border-gray-500'
            } ${isUpdating ? 'opacity-50' : ''}`}
          >
            {task.completed && <Check className="h-3 w-3 text-white" />}
          </button>
          <span className={`transition-all duration-300 ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild disabled={task.completed}>
              <button 
                className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/30 focus:outline-none ${
                  task.completed ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={task.completed}
              >
                <div className={`h-3 w-3 rounded-full ${getPriorityClass(task.priority)}`}></div>
                <span className="text-xs text-gray-400">Priority</span>
                <svg width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </DropdownMenu.Trigger>
            {!task.completed && (
              <Portal.Root>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="bg-popover p-2 rounded shadow-lg min-w-[120px]"
                    sideOffset={5}
                    style={{
                      position: 'fixed',
                      zIndex: 9999,
                    }}
                  >
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <DropdownMenu.Item
                        key={p}
                        onSelect={() => onChangePriority(task.id, p)}
                        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-muted/40 ${task.priority === p ? 'font-bold' : ''}`}
                      >
                        <div className={`h-3 w-3 rounded-full ${getPriorityClass(p)}`}></div>
                        <span className="capitalize">{p}</span>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </Portal.Root>
            )}
          </DropdownMenu.Root>
          <button 
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const TaskCategory: React.FC<{
  title: string;
  tasks: Task[];
  category: TaskCategory;
  onAddTask: (task: string, category: TaskCategory, priority?: 'low' | 'medium' | 'high') => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onChangePriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
}> = ({ title, tasks, category, onAddTask, onToggleComplete, onDeleteTask, onChangePriority }) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <TaskForm 
        category={category}
        onAddTask={(text, priority) => onAddTask(text, category, priority)} 
      />
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDeleteTask}
          onChangePriority={onChangePriority}
        />
      ))}
      {tasks.length === 0 && (
        <div className="text-center py-4 text-gray-500 animate-in fade-in">No tasks</div>
      )}
    </div>
  );
};

const Tasks: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('taskViewMode');
    return (saved === 'list' || saved === 'board') ? saved : 'list';
  });
  const { tasks, addTask, toggleTaskCompleted, deleteTask, getTasksByCategory, updateTaskPriority } = useTasks();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('taskViewMode', viewMode);
  }, [viewMode]);

  const handleAddTask = async (text: string, category: TaskCategory, priority: 'low' | 'medium' | 'high' = 'medium') => {
    try {
      await addTask({
        title: text,
        completed: false,
        priority,
        category,
      });
      toast({
        title: "Task added",
        description: `"${text}" has been added to your tasks.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add task",
        description: error instanceof Error ? error.message : "An error occurred while adding the task.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      await toggleTaskCompleted(id);
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: error instanceof Error ? error.message : "An error occurred while updating the task.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      toast({
        title: "Task deleted",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Failed to delete task",
        description: error instanceof Error ? error.message : "An error occurred while deleting the task.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleChangePriority = async (id: string, priority: 'low' | 'medium' | 'high') => {
    try {
      await updateTaskPriority(id, priority);
      toast({
        title: 'Priority updated',
        description: `Priority set to ${priority}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update priority',
        description: error instanceof Error ? error.message : 'An error occurred while updating priority.',
        variant: 'destructive',
      });
    }
  };

  const todayTasks = getTasksByCategory('today');
  const tomorrowTasks = getTasksByCategory('tomorrow');
  const thisWeekTasks = getTasksByCategory('this-week');
  const nextWeekTasks = getTasksByCategory('next-week');
  const laterTasks = getTasksByCategory('later');

  return (
    <>
      <Header title="Tasks" />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-muted text-white' : 'text-gray-400 hover:text-white hover:bg-muted/50'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'board' ? 'bg-muted text-white' : 'text-gray-400 hover:text-white hover:bg-muted/50'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {viewMode === 'list' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <TaskCategory
              title="Today"
              tasks={todayTasks}
              category="today"
              onAddTask={handleAddTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onChangePriority={handleChangePriority}
            />
            <TaskCategory
              title="Tomorrow"
              tasks={tomorrowTasks}
              category="tomorrow"
              onAddTask={handleAddTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onChangePriority={handleChangePriority}
            />
            <TaskCategory
              title="On this week"
              tasks={thisWeekTasks}
              category="this-week"
              onAddTask={handleAddTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onChangePriority={handleChangePriority}
            />
            <TaskCategory
              title="On next week"
              tasks={nextWeekTasks}
              category="next-week"
              onAddTask={handleAddTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onChangePriority={handleChangePriority}
            />
            <TaskCategory
              title="Later"
              tasks={laterTasks}
              category="later"
              onAddTask={handleAddTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onChangePriority={handleChangePriority}
            />
          </div>
        )}
        
        {viewMode === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-3">Today</h3>
              <TaskForm 
                category="today"
                onAddTask={(text, priority) => handleAddTask(text, "today", priority)} 
              />
              {todayTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onChangePriority={handleChangePriority}
                />
              ))}
            </div>
            
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-3">Tomorrow</h3>
              <TaskForm 
                category="tomorrow"
                onAddTask={(text, priority) => handleAddTask(text, "tomorrow", priority)} 
              />
              {tomorrowTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onChangePriority={handleChangePriority}
                />
              ))}
            </div>
            
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-3">On this week</h3>
              <TaskForm 
                category="this-week"
                onAddTask={(text, priority) => handleAddTask(text, "this-week", priority)} 
              />
              {thisWeekTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onChangePriority={handleChangePriority}
                />
              ))}
            </div>
            
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-3">On next week</h3>
              <TaskForm 
                category="next-week"
                onAddTask={(text, priority) => handleAddTask(text, "next-week", priority)} 
              />
              {nextWeekTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onChangePriority={handleChangePriority}
                />
              ))}
            </div>
            
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium mb-3">Later</h3>
              <TaskForm 
                category="later"
                onAddTask={(text, priority) => handleAddTask(text, "later", priority)} 
              />
              {laterTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onChangePriority={handleChangePriority}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;
