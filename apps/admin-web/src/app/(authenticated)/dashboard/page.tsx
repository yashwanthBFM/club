'use client';

import api from '@/lib/api';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/dashboard-stats');
        const data = res.data;
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.userCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Games</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.activeGames ?? 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">${stats?.totalRevenue ?? 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.activeSessions ?? 0}</p>
        </div>
      </div>
    </div>
  );
} 