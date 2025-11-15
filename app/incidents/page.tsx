'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Search,
  Filter,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  Calendar,
} from 'lucide-react';

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

interface FilterState {
  status: IncidentStatus | 'all';
  priority: IncidentPriority | 'all';
  dateFrom: string;
  dateTo: string;
  sourceComponent: string;
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

export default function IncidentsListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    dateFrom: '',
    dateTo: '',
    sourceComponent: '',
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

  const filteredIncidents = useMemo(() => {
    let filtered = [...incidents];

    // Search filter (name/incidentId)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (incident) =>
          incident.title.toLowerCase().includes(query) ||
          incident.id.toString().includes(query) ||
          incident.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((incident) => incident.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(
        (incident) => incident.priority === filters.priority
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (incident) => new Date(incident.incidentStartTime) >= fromDate
      );
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(
        (incident) => new Date(incident.incidentStartTime) <= toDate
      );
    }

    // Source component filter
    if (filters.sourceComponent.trim()) {
      const componentQuery = filters.sourceComponent.toLowerCase();
      filtered = filtered.filter((incident) =>
        incident.sourceComponents.some((comp) =>
          comp.name.toLowerCase().includes(componentQuery)
        )
      );
    }

    return filtered;
  }, [incidents, searchQuery, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.sourceComponent.trim()) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      dateFrom: '',
      dateTo: '',
      sourceComponent: '',
    });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div>
          <h1 className="text-4xl font-bold">Incident List</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all incidents
          </p>
        </div>

        {/* Filter Component */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Search and filter incidents by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by incident name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
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

            {/* Filter Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setFilterDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="default"
                    className="ml-2 bg-primary text-primary-foreground"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {filters.status !== 'all' && (
                  <Badge variant="outline" className={statusColors[filters.status]}>
                    Status: {statusLabels[filters.status]}
                    <button
                      onClick={() => setFilters({ ...filters, status: 'all' })}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.priority !== 'all' && (
                  <Badge
                    variant="outline"
                    className={priorityColors[filters.priority]}
                  >
                    Priority: {priorityLabels[filters.priority]}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, priority: 'all' })
                      }
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="outline">
                    From: {new Date(filters.dateFrom).toLocaleDateString()}
                    <button
                      onClick={() => setFilters({ ...filters, dateFrom: '' })}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="outline">
                    To: {new Date(filters.dateTo).toLocaleDateString()}
                    <button
                      onClick={() => setFilters({ ...filters, dateTo: '' })}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.sourceComponent.trim() && (
                  <Badge variant="outline">
                    Component: {filters.sourceComponent}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, sourceComponent: '' })
                      }
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter Dialog */}
        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Filter Incidents</DialogTitle>
              <DialogDescription>
                Apply filters to narrow down your search results
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value: IncidentStatus | 'all') =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={filters.priority}
                  onValueChange={(value: IncidentPriority | 'all') =>
                    setFilters({ ...filters, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date To</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Source Component
                </label>
                <Input
                  type="text"
                  placeholder="Filter by source component name..."
                  value={filters.sourceComponent}
                  onChange={(e) =>
                    setFilters({ ...filters, sourceComponent: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
              <Button onClick={() => setFilterDialogOpen(false)}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents</CardTitle>
            <CardDescription>
              {loading
                ? 'Loading incidents...'
                : `${filteredIncidents.length} of ${incidents.length} incident${incidents.length !== 1 ? 's' : ''}${searchQuery || activeFilterCount > 0 ? ' (filtered)' : ''}`}
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
                  {searchQuery || activeFilterCount > 0
                    ? 'No incidents match your search or filters.'
                    : 'No incidents found.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/incidents/${incident.id}`}
                    className="block"
                  >
                  <div
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            #{incident.id} - {incident.title}
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
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteIncident(incident.id);
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

