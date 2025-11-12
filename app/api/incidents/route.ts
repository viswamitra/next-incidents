import { NextResponse } from 'next/server';
import { getIncidents, addIncident } from '@/lib/incidents-store';

// GET /api/incidents - Fetch all incidents
export async function GET() {
  const incidents = getIncidents();
  return NextResponse.json({ incidents });
}

// POST /api/incidents - Create a new incident
export async function POST(request: Request) {
  try {
    const { title, description, priority } = await request.json();
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }
    
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!priority || !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Valid priority is required (low, medium, high, critical)' },
        { status: 400 }
      );
    }
    
    const newIncident = addIncident(title.trim(), description.trim(), priority);
    return NextResponse.json({ incident: newIncident }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

