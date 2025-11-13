'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, AlertCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Incident {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
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

  // Calculate statistics
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((i) => i.status === 'open').length;
  const inProgressIncidents = incidents.filter(
    (i) => i.status === 'in_progress'
  ).length;
  const resolvedIncidents = incidents.filter(
    (i) => i.status === 'resolved'
  ).length;
  const closedIncidents = incidents.filter((i) => i.status === 'closed').length;

  const criticalIncidents = incidents.filter(
    (i) => i.priority === 'critical'
  ).length;
  const highIncidents = incidents.filter((i) => i.priority === 'high').length;
  const mediumIncidents = incidents.filter(
    (i) => i.priority === 'medium'
  ).length;
  const lowIncidents = incidents.filter((i) => i.priority === 'low').length;

  // Calculate average resolution time (mock calculation)
  const resolvedIncidentsWithTime = incidents.filter(
    (i) => i.status === 'resolved' || i.status === 'closed'
  );
  const avgResolutionTime = resolvedIncidentsWithTime.length > 0
    ? Math.round(
        resolvedIncidentsWithTime.reduce((acc, incident) => {
          const created = new Date(incident.createdAt).getTime();
          const updated = new Date(incident.updatedAt).getTime();
          return acc + (updated - created);
        }, 0) / resolvedIncidentsWithTime.length / (1000 * 60 * 60)
      )
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8 md:p-24">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Incident statistics and analytics
          </p>
        </div>

        {/* Status Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIncidents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openIncidents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressIncidents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedIncidents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Breakdown of incidents by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Critical
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {criticalIncidents}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  High
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {highIncidents}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Medium
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {mediumIncidents}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Low
                </div>
                <div className="text-3xl font-bold text-gray-600">
                  {lowIncidents}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Current status of all incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Open</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${totalIncidents > 0 ? (openIncidents / totalIncidents) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {openIncidents}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-secondary rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${totalIncidents > 0 ? (inProgressIncidents / totalIncidents) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {inProgressIncidents}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Resolved</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {resolvedIncidents}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Closed</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-secondary rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{
                        width: `${totalIncidents > 0 ? (closedIncidents / totalIncidents) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {closedIncidents}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Average Resolution Time
              </span>
              <span className="text-sm font-semibold">
                {avgResolutionTime} hours
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Resolution Rate
              </span>
              <span className="text-sm font-semibold">
                {totalIncidents > 0
                  ? Math.round(
                      ((resolvedIncidents + closedIncidents) / totalIncidents) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

