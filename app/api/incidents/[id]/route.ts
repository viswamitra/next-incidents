import { NextResponse } from 'next/server';
import { updateIncidentStatus, updateIncident, deleteIncident, getIncident } from '@/lib/incidents-store';

// GET /api/incidents/[id] - Get a single incident
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const incidentId = parseInt(id);
  
  if (isNaN(incidentId)) {
    return NextResponse.json(
      { error: 'Invalid incident ID' },
      { status: 400 }
    );
  }
  
  const incident = getIncident(incidentId);
  
  if (!incident) {
    return NextResponse.json(
      { error: 'Incident not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ incident });
}

// PATCH /api/incidents/[id] - Update incident status or other fields
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const incidentId = parseInt(id);
  
  if (isNaN(incidentId)) {
    return NextResponse.json(
      { error: 'Invalid incident ID' },
      { status: 400 }
    );
  }
  
  try {
    const body = await request.json();
    
    // If only status is provided, use the status update function
    if (body.status && Object.keys(body).length === 1) {
      const incident = updateIncidentStatus(incidentId, body.status);
      if (!incident) {
        return NextResponse.json(
          { error: 'Incident not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ incident });
    }
    
    // Otherwise, use the general update function
    const incident = updateIncident(incidentId, body);
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ incident });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// DELETE /api/incidents/[id] - Delete an incident
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const incidentId = parseInt(id);
  
  if (isNaN(incidentId)) {
    return NextResponse.json(
      { error: 'Invalid incident ID' },
      { status: 400 }
    );
  }
  
  const success = deleteIncident(incidentId);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Incident not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true });
}

