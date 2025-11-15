'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  MessageSquare,
  Link as LinkIcon,
  Mail,
  Video,
  Hash,
  ExternalLink,
} from 'lucide-react';

type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type Severity = 'R0' | 'R1' | 'R2' | 'R3';
type BusinessSeverity = 'S1' | 'S2' | 'S3' | 'S4';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'status_change' | 'update' | 'comment' | 'component_added' | 'severity_change';
  title: string;
  description: string;
  author?: string;
}

interface Incident {
  id: number;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: string;
  severity: Severity;
  businessSeverity: BusinessSeverity;
  sourceComponents: Array<{
    name: string;
    contributionStartTime: string;
    contributionEndTime: string;
  }>;
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

const statusColors: Record<IncidentStatus, string> = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const severityColors: Record<Severity, string> = {
  R0: 'bg-red-100 text-red-800 border-red-200',
  R1: 'bg-orange-100 text-orange-800 border-orange-200',
  R2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  R3: 'bg-gray-100 text-gray-800 border-gray-200',
};

const businessSeverityColors: Record<BusinessSeverity, string> = {
  S1: 'bg-red-100 text-red-800 border-red-200',
  S2: 'bg-orange-100 text-orange-800 border-orange-200',
  S3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  S4: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabels: Record<IncidentStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const timelineIcons: Record<TimelineEvent['type'], React.ReactNode> = {
  status_change: <AlertCircle className="h-4 w-4" />,
  update: <MessageSquare className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  component_added: <AlertCircle className="h-4 w-4" />,
  severity_change: <AlertCircle className="h-4 w-4" />,
};

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchIncident(Number(params.id));
    }
  }, [params.id]);

  const fetchIncident = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/incidents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIncident(data.incident);
      } else {
        console.error('Incident not found');
      }
    } catch (error) {
      console.error('Error fetching incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (status: IncidentStatus) => {
    if (!incident) return;
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      setIncident(data.incident);
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Incident Not Found</h2>
        <Button onClick={() => router.push('/incidents')}>Back to Incidents</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8 md:p-12">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/incidents')}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Incidents
        </Button>

        {/* S1: Horizontal Card Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{incident.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status:
                    </span>
                    <Badge
                      className={statusColors[incident.status]}
                      variant="outline"
                    >
                      {statusLabels[incident.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Severity:
                    </span>
                    <Badge
                      className={severityColors[incident.severity]}
                      variant="outline"
                    >
                      {incident.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Business Severity:
                    </span>
                    <Badge
                      className={businessSeverityColors[incident.businessSeverity]}
                      variant="outline"
                    >
                      {incident.businessSeverity}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={incident.status}
                  onValueChange={(value: IncidentStatus) =>
                    updateIncidentStatus(value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* S2: Bottom Card Section with 3 Columns */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Section: Basic Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Description
                    </h3>
                    <p className="text-sm">{incident.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Priority
                    </h3>
                    <Badge variant="outline">{incident.priority}</Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Incident ID
                    </h3>
                    <p className="text-sm font-mono">#{incident.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Start Time
                    </h3>
                    <p className="text-sm">{formatDate(incident.incidentStartTime)}</p>
                  </div>
                  {incident.incidentEndTime && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        End Time
                      </h3>
                      <p className="text-sm">{formatDate(incident.incidentEndTime)}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Source Components
                    </h3>
                    <div className="space-y-2">
                      {incident.sourceComponents.map((comp, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{comp.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(comp.contributionStartTime)} -{' '}
                            {formatDate(comp.contributionEndTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section: Timeline */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Timeline</h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-4">
                    {incident.timeline
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((event, idx) => (
                        <div key={event.id} className="relative flex gap-4">
                          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {timelineIcons[event.type]}
                          </div>
                          <div className="flex-1 space-y-1 pb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold">
                                {event.title}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                            {event.author && (
                              <p className="text-xs text-muted-foreground">
                                by {event.author}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right Section: Accordion */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="communication">
                    <AccordionTrigger>Communication Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {incident.communicationDetails?.googleMeetLinks &&
                          incident.communicationDetails.googleMeetLinks.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Google Meet Links
                                </span>
                              </div>
                              <div className="space-y-1 ml-6">
                                {incident.communicationDetails.googleMeetLinks.map(
                                  (link, idx) => (
                                    <a
                                      key={idx}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      {link}
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {incident.communicationDetails?.slackChannels &&
                          incident.communicationDetails.slackChannels.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Slack Channels
                                </span>
                              </div>
                              <div className="space-y-1 ml-6">
                                {incident.communicationDetails.slackChannels.map(
                                  (channel, idx) => (
                                    <div key={idx} className="text-sm">
                                      {channel}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {incident.communicationDetails?.emailThreads &&
                          incident.communicationDetails.emailThreads.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Email Threads
                                </span>
                              </div>
                              <div className="space-y-1 ml-6">
                                {incident.communicationDetails.emailThreads.map(
                                  (email, idx) => (
                                    <a
                                      key={idx}
                                      href={`mailto:${email}`}
                                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                      <Mail className="h-3 w-3" />
                                      {email}
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {incident.communicationDetails?.otherLinks &&
                          incident.communicationDetails.otherLinks.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Other Links
                                </span>
                              </div>
                              <div className="space-y-1 ml-6">
                                {incident.communicationDetails.otherLinks.map(
                                  (link, idx) => (
                                    <a
                                      key={idx}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      {link}
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {(!incident.communicationDetails ||
                          Object.keys(incident.communicationDetails).length === 0) && (
                          <p className="text-sm text-muted-foreground">
                            No communication details available
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="metadata">
                    <AccordionTrigger>Metadata</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {formatDate(incident.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Last Updated:</span>{' '}
                          {formatDate(incident.updatedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>{' '}
                          {incident.incidentEndTime
                            ? `${Math.round(
                                (new Date(incident.incidentEndTime).getTime() -
                                  new Date(incident.incidentStartTime).getTime()) /
                                  3600000
                              )} hours`
                            : 'Ongoing'}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="source-components">
                    <AccordionTrigger>Source Components Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {incident.sourceComponents.map((comp, idx) => (
                          <div key={idx} className="border rounded-lg p-3">
                            <h4 className="font-medium mb-2">{comp.name}</h4>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              <div>
                                <span className="font-medium">Start:</span>{' '}
                                {formatDate(comp.contributionStartTime)}
                              </div>
                              <div>
                                <span className="font-medium">End:</span>{' '}
                                {formatDate(comp.contributionEndTime)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

