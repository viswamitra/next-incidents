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
    const { title, description, priority, sourceComponents, incidentStartTime, incidentEndTime } = await request.json();
    
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
    
    if (!sourceComponents || !Array.isArray(sourceComponents) || sourceComponents.length === 0) {
      return NextResponse.json(
        { error: 'At least one source component is required' },
        { status: 400 }
      );
    }
    
    if (!incidentStartTime || typeof incidentStartTime !== 'string') {
      return NextResponse.json(
        { error: 'Incident start time is required' },
        { status: 400 }
      );
    }
    
    // Validate source components
    for (const component of sourceComponents) {
      if (!component.name || typeof component.name !== 'string' || component.name.trim() === '') {
        return NextResponse.json(
          { error: 'Each source component must have a name' },
          { status: 400 }
        );
      }
      if (!component.contributionStartTime || typeof component.contributionStartTime !== 'string') {
        return NextResponse.json(
          { error: 'Each source component must have a contribution start time' },
          { status: 400 }
        );
      }
      if (!component.contributionEndTime || typeof component.contributionEndTime !== 'string') {
        return NextResponse.json(
          { error: 'Each source component must have a contribution end time' },
          { status: 400 }
        );
      }
    }
    
    const newIncident = addIncident(
      title.trim(),
      description.trim(),
      priority,
      sourceComponents,
      incidentStartTime,
      incidentEndTime || null
    );
    return NextResponse.json({ incident: newIncident }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

