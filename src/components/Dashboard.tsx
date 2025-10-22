import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserCheck, UserX, Clock, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  totalVisitors: number;
  activeVisits: number;
  pendingApprovals: number;
  todayVisits: number;
  checkedOut: number;
  rejected: number;
}

interface RecentVisit {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  visitor: {
    full_name: string;
    company: string | null;
  };
  employee: {
    full_name: string;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalVisitors: 0,
    activeVisits: 0,
    pendingApprovals: 0,
    todayVisits: 0,
    checkedOut: 0,
    rejected: 0
  });
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [visitorsRes, activeRes, pendingRes, todayRes, checkedOutRes, rejectedRes, recentRes] = await Promise.all([
        supabase.from('visitors').select('id', { count: 'exact', head: true }),
        supabase.from('visit_logs').select('id', { count: 'exact', head: true }).eq('status', 'checked_in'),
        supabase.from('visit_logs').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        supabase.from('visit_logs').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('visit_logs').select('id', { count: 'exact', head: true }).eq('status', 'checked_out'),
        supabase.from('visit_logs').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase
          .from('visit_logs')
          .select(`
            id,
            check_in_time,
            check_out_time,
            status,
            visitor:visitors(full_name, company),
            employee:users!visit_logs_employee_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      setStats({
        totalVisitors: visitorsRes.count || 0,
        activeVisits: activeRes.count || 0,
        pendingApprovals: pendingRes.count || 0,
        todayVisits: todayRes.count || 0,
        checkedOut: checkedOutRes.count || 0,
        rejected: rejectedRes.count || 0
      });

      setRecentVisits(recentRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      pending_approval: { color: 'bg-orange-100 text-orange-800', text: 'Pending' },
      checked_in: { color: 'bg-green-100 text-green-800', text: 'Checked In' },
      checked_out: { color: 'bg-slate-100 text-slate-800', text: 'Checked Out' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h2>
        <p className="text-slate-600">Overview of visitor management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              Total
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">{stats.totalVisitors}</div>
          <div className="text-blue-100">Registered Visitors</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">{stats.activeVisits}</div>
          <div className="text-green-100">Currently Inside</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              Pending
            </div>
          </div>
          <div className="text-4xl font-bold mb-1">{stats.pendingApprovals}</div>
          <div className="text-orange-100">Awaiting Approval</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-slate-600 font-medium">Today's Visits</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.todayVisits}</div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-slate-600 font-medium">Checked Out</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.checkedOut}</div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-2">
            <UserX className="w-5 h-5 text-red-600" />
            <span className="text-slate-600 font-medium">Rejected</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.rejected}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Visitor Activity</h3>

        {recentVisits.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No visitor activity yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Visitor</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Company</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Visiting</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Check In</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Check Out</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900">{visit.visitor.full_name}</td>
                    <td className="py-3 px-4 text-slate-600">{visit.visitor.company || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{visit.employee.full_name}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">
                      {visit.check_in_time ? formatTime(visit.check_in_time) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-sm">
                      {visit.check_out_time ? formatTime(visit.check_out_time) : '-'}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(visit.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
