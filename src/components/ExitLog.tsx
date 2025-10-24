import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, LogOut, Clock, User, Building2 } from 'lucide-react';

interface VisitLog {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  purpose: string;
  status: string;
  visitor: {
    full_name: string;
    phone: string;
    company: string | null;
  };
  employee: {
    full_name: string;
  };
}

export default function ExitLog() {
  const [activeVisits, setActiveVisits] = useState<VisitLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveVisits();
  }, []);

  const fetchActiveVisits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visit_logs')
        .select(`
          id,
          check_in_time,
          check_out_time,
          purpose,
          status,
          visitor:visitors(full_name, phone, company),
          employee:users!visit_logs_employee_id_fkey(full_name)
        `)
        .eq('status', 'checked_in')
        .is('check_out_time', null)
        .order('check_in_time', { ascending: false });

      if (error) throw error;
      setActiveVisits((data || []).map((item: any) => ({
        ...item,
        visitor: item.visitor[0],
        employee: item.employee[0]
      })));
    } catch (error) {
      console.error('Error fetching active visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (visitId: string) => {
    setProcessingId(visitId);
    try {
      const { error } = await supabase
        .from('visit_logs')
        .update({
          check_out_time: new Date().toISOString(),
          status: 'checked_out'
        })
        .eq('id', visitId);

      if (error) throw error;

      setActiveVisits(prev => prev.filter(visit => visit.id !== visitId));
      alert('Visitor checked out successfully!');
    } catch (error: any) {
      console.error('Error checking out visitor:', error);
      alert('Failed to check out visitor: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredVisits = activeVisits.filter(visit =>
    visit.visitor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.visitor.phone.includes(searchTerm) ||
    visit.employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (checkInTime: string) => {
    const start = new Date(checkInTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Exit Log</h2>
        <p className="text-slate-600">Check out visitors who are leaving</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by visitor name, phone, or employee..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading active visits...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <LogOut className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No active visitors to check out</p>
          <p className="text-slate-500 text-sm mt-2">All visitors have been checked out</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {visit.visitor.full_name}
                      </h3>
                      <p className="text-slate-600 text-sm">{visit.visitor.phone}</p>
                    </div>
                  </div>

                  {visit.visitor.company && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{visit.visitor.company}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      Visiting: <strong>{visit.employee.full_name}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Checked in: {formatTime(visit.check_in_time)}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium ml-2">
                      Duration: {getDuration(visit.check_in_time)}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <strong>Purpose:</strong> {visit.purpose}
                  </div>
                </div>

                <button
                  onClick={() => handleCheckOut(visit.id)}
                  disabled={processingId === visit.id}
                  className="ml-4 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {processingId === visit.id ? 'Processing...' : 'Check Out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
