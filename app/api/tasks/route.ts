import { NextResponse } from 'next/server';
import { getTasks, addTask } from '@/lib/tasks-store';

// GET /api/tasks - Fetch all tasks
export async function GET() {
  const tasks = getTasks();
  return NextResponse.json({ tasks });
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const newTask = addTask(title.trim());
    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

