import { NextResponse } from 'next/server';
import { toggleTask, deleteTask } from '@/lib/tasks-store';

// PATCH /api/tasks/[id] - Toggle task completion
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const taskId = parseInt(id);
  
  if (isNaN(taskId)) {
    return NextResponse.json(
      { error: 'Invalid task ID' },
      { status: 400 }
    );
  }
  
  const task = toggleTask(taskId);
  
  if (!task) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ task });
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const taskId = parseInt(id);
  
  if (isNaN(taskId)) {
    return NextResponse.json(
      { error: 'Invalid task ID' },
      { status: 400 }
    );
  }
  
  const success = deleteTask(taskId);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true });
}

