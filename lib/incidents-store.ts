// Shared in-memory storage for incidents
// In production, replace this with a real database

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SourceComponent {
  name: string;
  contributionStartTime: string;
  contributionEndTime: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  sourceComponents: SourceComponent[];
  incidentStartTime: string;
  incidentEndTime: string | null;
  createdAt: string;
  updatedAt: string;
}

let incidents: Incident[] = [
  {
    id: 1,
    title: 'Server Outage',
    description: 'Main server is down, affecting all users',
    status: 'open',
    priority: 'critical',
    sourceComponents: [
      {
        name: 'API Gateway',
        contributionStartTime: new Date(Date.now() - 7200000).toISOString(),
        contributionEndTime: new Date().toISOString(),
      },
    ],
    incidentStartTime: new Date(Date.now() - 7200000).toISOString(),
    incidentEndTime: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Database Connection Issue',
    description: 'Intermittent database connection failures',
    status: 'in_progress',
    priority: 'high',
    sourceComponents: [
      {
        name: 'Database Server',
        contributionStartTime: new Date(Date.now() - 3600000).toISOString(),
        contributionEndTime: new Date().toISOString(),
      },
    ],
    incidentStartTime: new Date(Date.now() - 3600000).toISOString(),
    incidentEndTime: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 3,
    title: 'UI Responsiveness',
    description: 'Dashboard loading slowly for some users',
    status: 'resolved',
    priority: 'medium',
    sourceComponents: [
      {
        name: 'Frontend Service',
        contributionStartTime: new Date(Date.now() - 7200000).toISOString(),
        contributionEndTime: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    incidentStartTime: new Date(Date.now() - 7200000).toISOString(),
    incidentEndTime: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

let nextId = 4;

export function getIncidents(): Incident[] {
  return incidents;
}

export function getIncident(id: number): Incident | null {
  return incidents.find(i => i.id === id) || null;
}

export function addIncident(
  title: string,
  description: string,
  priority: IncidentPriority,
  sourceComponents: SourceComponent[],
  incidentStartTime: string,
  incidentEndTime: string | null = null
): Incident {
  const newIncident: Incident = {
    id: nextId++,
    title,
    description,
    status: 'open',
    priority,
    sourceComponents,
    incidentStartTime,
    incidentEndTime,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  incidents.push(newIncident);
  return newIncident;
}

export function updateIncidentStatus(
  id: number,
  status: IncidentStatus
): Incident | null {
  const incident = incidents.find(i => i.id === id);
  if (!incident) return null;
  incident.status = status;
  incident.updatedAt = new Date().toISOString();
  return incident;
}

export function updateIncident(
  id: number,
  updates: Partial<Pick<Incident, 'title' | 'description' | 'status' | 'priority' | 'sourceComponents' | 'incidentStartTime' | 'incidentEndTime'>>
): Incident | null {
  const incident = incidents.find(i => i.id === id);
  if (!incident) return null;
  Object.assign(incident, updates);
  incident.updatedAt = new Date().toISOString();
  return incident;
}

export function deleteIncident(id: number): boolean {
  const incidentIndex = incidents.findIndex(i => i.id === id);
  if (incidentIndex === -1) return false;
  incidents.splice(incidentIndex, 1);
  return true;
}

