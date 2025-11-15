'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Loader2, AlertCircle, Search, X } from 'lucide-react';

type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

interface SourceComponent {
  name: string;
  contributionStartTime: string;
  contributionEndTime: string;
}

interface Incident {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as IncidentPriority,
    sourceComponents: [
      { name: '', contributionStartTime: '', contributionEndTime: '' },
    ] as SourceComponent[],
    incidentStartTime: '',
    incidentEndTime: '',
  });

  const totalSteps = 4;

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

  const filteredIncidents = useMemo(() => {
    if (!searchQuery.trim()) return incidents;
    const query = searchQuery.toLowerCase();
    return incidents.filter(
      (incident) =>
        incident.title.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query) ||
        incident.sourceComponents.some((comp) =>
          comp.name.toLowerCase().includes(query)
        )
    );
  }, [incidents, searchQuery]);

  const addIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    // Validate source components
    const validComponents = formData.sourceComponents.filter(
      (comp) =>
        comp.name.trim() &&
        comp.contributionStartTime &&
        comp.contributionEndTime
    );

    if (validComponents.length === 0) {
      alert('Please add at least one valid source component');
      return;
    }

    if (!formData.incidentStartTime) {
      alert('Please provide an incident start time');
      return;
    }

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          sourceComponents: validComponents,
          incidentStartTime: formData.incidentStartTime,
          incidentEndTime: formData.incidentEndTime || null,
        }),
      });

      const data = await response.json();
      setIncidents([...incidents, data.incident]);
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding incident:', error);
      alert('Failed to create incident. Please check all fields.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      sourceComponents: [
        { name: '', contributionStartTime: '', contributionEndTime: '' },
      ],
      incidentStartTime: '',
      incidentEndTime: '',
    });
    setCurrentStep(1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.incidentStartTime !== '';
      case 3:
        const validComponents = formData.sourceComponents.filter(
          (comp) =>
            comp.name.trim() &&
            comp.contributionStartTime &&
            comp.contributionEndTime
        );
        return validComponents.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSourceComponent = () => {
    setFormData({
      ...formData,
      sourceComponents: [
        ...formData.sourceComponents,
        { name: '', contributionStartTime: '', contributionEndTime: '' },
      ],
    });
  };

  const removeSourceComponent = (index: number) => {
    setFormData({
      ...formData,
      sourceComponents: formData.sourceComponents.filter((_, i) => i !== index),
    });
  };

  const updateSourceComponent = (
    index: number,
    field: keyof SourceComponent,
    value: string
  ) => {
    const updated = [...formData.sourceComponents];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, sourceComponents: updated });
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
    <div className="flex flex-col p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Incident Management</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage system incidents
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
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

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search incidents by title, description, or source component..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Incident Dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
              <DialogDescription>
                Step {currentStep} of {totalSteps}:{' '}
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Incident Times'}
                {currentStep === 3 && 'Source Components'}
                {currentStep === 4 && 'Review & Submit'}
              </DialogDescription>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        step <= currentStep
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-muted text-muted-foreground'
                      }`}
                    >
                      {step < currentStep ? '✓' : step}
                    </div>
                    <div className="text-xs mt-1 text-center text-muted-foreground">
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Times'}
                      {step === 3 && 'Components'}
                      {step === 4 && 'Review'}
                    </div>
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        step < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={addIncident} className="space-y-4">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
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
                    <label className="text-sm font-medium mb-2 block">Priority</label>
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
                </div>
              )}

              {/* Step 2: Incident Times */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Start Time
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.incidentStartTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            incidentStartTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        End Time (Optional)
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.incidentEndTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            incidentEndTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Source Components */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Source Components
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSourceComponent}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Component
                    </Button>
                  </div>
                  {formData.sourceComponents.map((component, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Component {index + 1}
                          </span>
                          {formData.sourceComponents.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSourceComponent(index)}
                              className="h-6 w-6 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="Component name..."
                          value={component.name}
                          onChange={(e) =>
                            updateSourceComponent(index, 'name', e.target.value)
                          }
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Contribution Start
                            </label>
                            <Input
                              type="datetime-local"
                              value={component.contributionStartTime}
                              onChange={(e) =>
                                updateSourceComponent(
                                  index,
                                  'contributionStartTime',
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Contribution End
                            </label>
                            <Input
                              type="datetime-local"
                              value={component.contributionEndTime}
                              onChange={(e) =>
                                updateSourceComponent(
                                  index,
                                  'contributionEndTime',
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Review Incident Details</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Title:</span>{' '}
                        {formData.title || 'Not provided'}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span>{' '}
                        {formData.description || 'Not provided'}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>{' '}
                        {priorityLabels[formData.priority]}
                      </div>
                      <div>
                        <span className="font-medium">Incident Start Time:</span>{' '}
                        {formData.incidentStartTime
                          ? new Date(formData.incidentStartTime).toLocaleString()
                          : 'Not provided'}
                      </div>
                      {formData.incidentEndTime && (
                        <div>
                          <span className="font-medium">Incident End Time:</span>{' '}
                          {new Date(formData.incidentEndTime).toLocaleString()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Source Components:</span>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          {formData.sourceComponents
                            .filter((c) => c.name.trim())
                            .map((comp, idx) => (
                              <li key={idx}>
                                {comp.name} (
                                {new Date(comp.contributionStartTime).toLocaleString()} -{' '}
                                {new Date(comp.contributionEndTime).toLocaleString()})
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit">Create Incident</Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>All Incidents</CardTitle>
            <CardDescription>
              {loading
                ? 'Loading incidents...'
                : `${filteredIncidents.length} of ${incidents.length} incident${incidents.length !== 1 ? 's' : ''}${searchQuery ? ' (filtered)' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {searchQuery
                    ? 'No incidents match your search.'
                    : 'No incidents yet. Create one to get started!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
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
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            <strong>Source Components:</strong>{' '}
                            {incident.sourceComponents
                              .map((c) => c.name)
                              .join(', ') || 'None'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <strong>Incident Time:</strong>{' '}
                            {formatDate(incident.incidentStartTime)}
                            {incident.incidentEndTime &&
                              ` - ${formatDate(incident.incidentEndTime)}`}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Created: {formatDate(incident.createdAt)}
                            </span>
                            {incident.updatedAt !== incident.createdAt && (
                              <span>
                                Updated: {formatDate(incident.updatedAt)}
                              </span>
                            )}
                          </div>
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
    </div>
  );
}
