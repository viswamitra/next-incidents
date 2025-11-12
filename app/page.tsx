'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';

type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

interface Incident {
  id: number;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<IncidentStatus, string> = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const priorityColors: Record<IncidentPriority, string> = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<IncidentStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const priorityLabels: Record<IncidentPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as IncidentPriority,
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/incidents');
      const data = await response.json();
      setIncidents(data.incidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setIncidents([...incidents, data.incident]);
      setFormData({ title: '', description: '', priority: 'medium' });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding incident:', error);
    }
  };

  const updateIncidentStatus = async (id: number, status: IncidentStatus) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      setIncidents(
        incidents.map((incident) =>
          incident.id === id ? data.incident : incident
        )
      );
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  const deleteIncident = async (id: number) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      await fetch(`/api/incidents/${id}`, {
        method: 'DELETE',
      });

      setIncidents(incidents.filter((incident) => incident.id !== id));
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const openCount = incidents.filter((i) => i.status === 'open').length;
  const inProgressCount = incidents.filter(
    (i) => i.status === 'in_progress'
  ).length;
  const criticalCount = incidents.filter(
    (i) => i.priority === 'critical'
  ).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="flex min-h-screen flex-col p-8 md:p-24">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Incident Management</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage system incidents
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Open Incidents</CardDescription>
              <CardTitle className="text-3xl">{openCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl">{inProgressCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical Priority</CardDescription>
              <CardTitle className="text-3xl">{criticalCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Incident</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addIncident} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter incident title..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the incident..."
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Priority
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: IncidentPriority) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Incident</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        title: '',
                        description: '',
                        priority: 'medium',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>All Incidents</CardTitle>
            <CardDescription>
              {loading
                ? 'Loading incidents...'
                : `${incidents.length} total incident${incidents.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No incidents yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {incident.title}
                          </h3>
                          <Badge
                            className={statusColors[incident.status]}
                            variant="outline"
                          >
                            {statusLabels[incident.status]}
                          </Badge>
                          <Badge
                            className={priorityColors[incident.priority]}
                            variant="outline"
                          >
                            {priorityLabels[incident.priority]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {incident.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {formatDate(incident.createdAt)}</span>
                          {incident.updatedAt !== incident.createdAt && (
                            <span>
                              Updated: {formatDate(incident.updatedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={incident.status}
                          onValueChange={(value: IncidentStatus) =>
                            updateIncidentStatus(incident.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteIncident(incident.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
