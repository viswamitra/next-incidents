// Shared in-memory storage for tasks
// In production, replace this with a real database

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

let tasks: Task[] = [
  { id: 1, title: 'Learn Next.js', completed: false },
  { id: 2, title: 'Build an API', completed: true },
];

let nextId = 3;

export function getTasks(): Task[] {
  return tasks;
}

export function addTask(title: string): Task {
  const newTask: Task = {
    id: nextId++,
    title,
    completed: false,
  };
  tasks.push(newTask);
  return newTask;
}

export function toggleTask(id: number): Task | null {
  const task = tasks.find(t => t.id === id);
  if (!task) return null;
  task.completed = !task.completed;
  return task;
}

export function deleteTask(id: number): boolean {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return false;
  tasks.splice(taskIndex, 1);
  return true;
}

