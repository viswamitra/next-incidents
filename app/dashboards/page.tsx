'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface Incident {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

const COLORS = {
  open: '#3b82f6',
  in_progress: '#eab308',
  resolved: '#22c55e',
  closed: '#6b7280',
  critical: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#6b7280',
};

export default function DashboardsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Process data for charts
  const incidentsByDate = useMemo(() => {
    const dateMap = new Map<string, number>();
    
    incidents.forEach((incident) => {
      const date = new Date(incident.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [incidents]);

  const incidentsByStatus = useMemo(() => {
    const statusCounts = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    incidents.forEach((incident) => {
      if (incident.status in statusCounts) {
        statusCounts[incident.status as keyof typeof statusCounts]++;
      }
    });

    return [
      { name: 'Open', value: statusCounts.open, color: COLORS.open },
      {
        name: 'In Progress',
        value: statusCounts.in_progress,
        color: COLORS.in_progress,
      },
      {
        name: 'Resolved',
        value: statusCounts.resolved,
        color: COLORS.resolved,
      },
      { name: 'Closed', value: statusCounts.closed, color: COLORS.closed },
    ];
  }, [incidents]);

  const incidentsByPriority = useMemo(() => {
    const priorityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    incidents.forEach((incident) => {
      if (incident.priority in priorityCounts) {
        priorityCounts[incident.priority as keyof typeof priorityCounts]++;
      }
    });

    return [
      {
        name: 'Critical',
        value: priorityCounts.critical,
        color: COLORS.critical,
      },
      { name: 'High', value: priorityCounts.high, color: COLORS.high },
      { name: 'Medium', value: priorityCounts.medium, color: COLORS.medium },
      { name: 'Low', value: priorityCounts.low, color: COLORS.low },
    ];
  }, [incidents]);

  const statusTrendData = useMemo(() => {
    const dateMap = new Map<
      string,
      { open: number; in_progress: number; resolved: number; closed: number }
    >();

    incidents.forEach((incident) => {
      const date = new Date(incident.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { open: 0, in_progress: 0, resolved: 0, closed: 0 });
      }
      
      const dayData = dateMap.get(date)!;
      const status = incident.status as 'open' | 'in_progress' | 'resolved' | 'closed';
      if (status in dayData) {
        dayData[status] = (dayData[status] || 0) + 1;
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, statuses]) => ({ date, ...statuses }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [incidents]);

  const resolutionTimeData = useMemo(() => {
    const resolvedIncidents = incidents.filter(
      (i) => i.status === 'resolved' || i.status === 'closed'
    );

    return resolvedIncidents.map((incident) => {
      const created = new Date(incident.createdAt).getTime();
      const updated = new Date(incident.updatedAt).getTime();
      const hours = Math.round((updated - created) / (1000 * 60 * 60));
      
      return {
        title: incident.title.substring(0, 20) + '...',
        hours,
        priority: incident.priority,
      };
    });
  }, [incidents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8 md:p-12">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <div>
          <h1 className="text-4xl font-bold">Dashboards</h1>
          <p className="text-muted-foreground mt-2">
            Visual analytics and insights for incident management
          </p>
        </div>

        {/* Incidents Created Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents Created Over Time</CardTitle>
            <CardDescription>
              Track the number of incidents created each day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incidentsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Incidents"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incidents by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Incidents by Status</CardTitle>
              <CardDescription>Distribution of incidents by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incidentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incidentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Incidents by Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Incidents by Priority</CardTitle>
              <CardDescription>Distribution of incidents by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incidentsByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incidentsByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status Trends Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Status Trends Over Time</CardTitle>
            <CardDescription>
              Track how incident statuses change over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={statusTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="open"
                  stroke={COLORS.open}
                  strokeWidth={2}
                  name="Open"
                />
                <Line
                  type="monotone"
                  dataKey="in_progress"
                  stroke={COLORS.in_progress}
                  strokeWidth={2}
                  name="In Progress"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke={COLORS.resolved}
                  strokeWidth={2}
                  name="Resolved"
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  stroke={COLORS.closed}
                  strokeWidth={2}
                  name="Closed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>
              Number of incidents by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentsByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6">
                  {incidentsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Time by Priority */}
        {resolutionTimeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time by Incident</CardTitle>
              <CardDescription>
                Time taken to resolve incidents (in hours)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={resolutionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#22c55e" name="Hours to Resolve" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

