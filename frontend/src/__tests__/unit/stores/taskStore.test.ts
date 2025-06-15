import { renderHook, act } from '@testing-library/react';
import { useTaskStore } from '../../../stores/taskStore';
import { Task } from '../../../types';

describe('Task Store', () => {
  beforeEach(() => {
    // Clear the store before each test
    act(() => {
      useTaskStore.setState({ tasks: [] });
    });
  });

  it('should add a task to the list', () => {
    const newTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      estimatedPomodoros: 3,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    act(() => {
      useTaskStore.getState().addTask(newTask);
    });

    const tasks = useTaskStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toEqual(newTask);
  });

  it('should update a task', () => {
    const task: Task = {
      id: '1',
      title: 'Original Title',
      description: 'Original Description',
      estimatedPomodoros: 3,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    act(() => {
      useTaskStore.getState().addTask(task);
    });

    const updatedTask = {
      ...task,
      title: 'Updated Title',
      description: 'Updated Description',
    };

    act(() => {
      useTaskStore.getState().updateTask(updatedTask);
    });

    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].title).toBe('Updated Title');
    expect(tasks[0].description).toBe('Updated Description');
  });

  it('should delete a task', () => {
    const task: Task = {
      id: '1',
      title: 'Task to Delete',
      description: 'Will be deleted',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    act(() => {
      useTaskStore.getState().addTask(task);
    });

    expect(useTaskStore.getState().tasks).toHaveLength(1);

    act(() => {
      useTaskStore.getState().deleteTask(task.id);
    });

    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });

  it('should increment completed pomodoros', () => {
    const task: Task = {
      id: '1',
      title: 'Task with Pomodoros',
      description: 'Testing pomodoro completion',
      estimatedPomodoros: 3,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    act(() => {
      useTaskStore.getState().addTask(task);
    });

    act(() => {
      useTaskStore.getState().incrementPomodoro(task.id);
    });

    const updatedTask = useTaskStore.getState().tasks[0];
    expect(updatedTask.completedPomodoros).toBe(1);
  });

  it('should filter tasks by status', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Todo Task',
        description: 'Not started',
        estimatedPomodoros: 2,
        completedPomodoros: 0,
        status: 'todo',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'In Progress Task',
        description: 'Working on it',
        estimatedPomodoros: 3,
        completedPomodoros: 1,
        status: 'in-progress',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Done Task',
        description: 'Completed',
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        status: 'done',
        createdAt: new Date().toISOString(),
      },
    ];

    act(() => {
      tasks.forEach(task => useTaskStore.getState().addTask(task));
    });

    const todoTasks = useTaskStore.getState().getTasksByStatus('todo');
    const inProgressTasks = useTaskStore.getState().getTasksByStatus('in-progress');
    const doneTasks = useTaskStore.getState().getTasksByStatus('done');

    expect(todoTasks).toHaveLength(1);
    expect(inProgressTasks).toHaveLength(1);
    expect(doneTasks).toHaveLength(1);

    expect(todoTasks[0].title).toBe('Todo Task');
    expect(inProgressTasks[0].title).toBe('In Progress Task');
    expect(doneTasks[0].title).toBe('Done Task');
  });
}); 