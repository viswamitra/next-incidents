// Shared in-memory storage for incidents
// In production, replace this with a real database

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type Severity = 'R0' | 'R1' | 'R2' | 'R3';
export type BusinessSeverity = 'S1' | 'S2' | 'S3' | 'S4';

export interface SourceComponent {
  name: string;
  contributionStartTime: string;
  contributionEndTime: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'status_change' | 'update' | 'comment' | 'component_added' | 'severity_change';
  title: string;
  description: string;
  author?: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  severity: Severity;
  businessSeverity: BusinessSeverity;
  sourceComponents: SourceComponent[];
  incidentStartTime: string;
  incidentEndTime: string | null;
  timeline: TimelineEvent[];
  communicationDetails?: {
    googleMeetLinks?: string[];
    slackChannels?: string[];
    emailThreads?: string[];
    otherLinks?: string[];
  };
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
    severity: 'R0',
    businessSeverity: 'S1',
    sourceComponents: [
      {
        name: 'API Gateway',
        contributionStartTime: new Date(Date.now() - 7200000).toISOString(),
        contributionEndTime: new Date().toISOString(),
      },
    ],
    incidentStartTime: new Date(Date.now() - 7200000).toISOString(),
    incidentEndTime: null,
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'status_change',
        title: 'Incident Created',
        description: 'Incident reported and created',
        author: 'System',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'update',
        title: 'Initial Investigation',
        description: 'Started investigating the server outage',
        author: 'John Doe',
      },
    ],
    communicationDetails: {
      googleMeetLinks: ['https://meet.google.com/abc-defg-hij'],
      slackChannels: ['#incidents', '#engineering'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Database Connection Issue',
    description: 'Intermittent database connection failures',
    status: 'in_progress',
    priority: 'high',
    severity: 'R1',
    businessSeverity: 'S2',
    sourceComponents: [
      {
        name: 'Database Server',
        contributionStartTime: new Date(Date.now() - 3600000).toISOString(),
        contributionEndTime: new Date().toISOString(),
      },
    ],
    incidentStartTime: new Date(Date.now() - 3600000).toISOString(),
    incidentEndTime: null,
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'status_change',
        title: 'Incident Created',
        description: 'Database connection issues reported',
        author: 'System',
      },
    ],
    communicationDetails: {
      googleMeetLinks: ['https://meet.google.com/xyz-uvwx-rst'],
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 3,
    title: 'UI Responsiveness',
    description: 'Dashboard loading slowly for some users',
    status: 'resolved',
    priority: 'medium',
    severity: 'R2',
    businessSeverity: 'S3',
    sourceComponents: [
      {
        name: 'Frontend Service',
        contributionStartTime: new Date(Date.now() - 7200000).toISOString(),
        contributionEndTime: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    incidentStartTime: new Date(Date.now() - 7200000).toISOString(),
    incidentEndTime: new Date(Date.now() - 3600000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'status_change',
        title: 'Incident Created',
        description: 'UI responsiveness issue reported',
        author: 'System',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        type: 'update',
        title: 'Root Cause Identified',
        description: 'Identified slow API response as root cause',
        author: 'Jane Smith',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'status_change',
        title: 'Incident Resolved',
        description: 'Issue fixed and verified',
        author: 'Jane Smith',
      },
    ],
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
  incidentEndTime: string | null = null,
  severity: Severity = 'R3',
  businessSeverity: BusinessSeverity = 'S4'
): Incident {
  const newIncident: Incident = {
    id: nextId++,
    title,
    description,
    status: 'open',
    priority,
    severity,
    businessSeverity,
    sourceComponents,
    incidentStartTime,
    incidentEndTime,
    timeline: [
      {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'status_change',
        title: 'Incident Created',
        description: 'New incident created',
        author: 'System',
      },
    ],
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

