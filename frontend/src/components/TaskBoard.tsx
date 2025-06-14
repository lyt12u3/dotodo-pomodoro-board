import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'TODO',
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const getTasksByStatus = (status: TaskStatus) => 
    tasks.filter(task => task.status === status);

  return (
    <div className="p-6">
      <form onSubmit={addTask} className="mb-6 flex gap-2">
        <Input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter task title"
          data-testid="task-input"
        />
        <Button type="submit" data-testid="add-task-button">
          Add Task
        </Button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(status => (
          <div
            key={status}
            data-testid={`column-${status}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            className="border rounded p-4"
          >
            <h2 className="text-xl font-bold mb-4">{status}</h2>
            {getTasksByStatus(status).map(task => (
              <Card
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                data-testid="task-item"
                className="p-3 mb-2 cursor-move"
              >
                {task.title}
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}; 