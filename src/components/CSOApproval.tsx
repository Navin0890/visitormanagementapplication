import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Clock, User, Building2, FileText } from 'lucide-react';

interface PendingVisit {
  id: string;
  created_at: string;
  purpose: string;
  visitor: {
    full_name: string;
    phone: string;
    email: string | null;
    company: string | null;
    id_type: string;
    id_number: string;
  };
  employee: {
    full_name: string;
    email: string;
  };
}

export default function CSOApproval() {
  const { user } = useAuth();
  const [pendingVisits, setPendingVisits] = useState<PendingVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingVisits();
  }, []);

  const fetchPendingVisits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visit_logs')
        .select(`
          id,
          created_at,
          purpose,
          visitor:visitors(full_name, phone, email, company, id_type, id_number),
          employee:users!visit_logs_employee_id_fkey(full_name, email)
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingVisits(data || []);
    } catch (error) {
      console.error('Error fetching pending visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (visitId: string) => {
    if (!user) return;

    setProcessingId(visitId);
    try {
      const { error } = await supabase
        .from('visit_logs')
        .update({
          status: 'checked_in',
          cso_approved_by: user.id,
          cso_approved_at: new Date().toISOString(),
          check_in_time: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) throw error;

      setPendingVisits(prev => prev.filter(visit => visit.id !== visitId));
      alert('Visitor approved and checked in successfully!');
    } catch (error: any) {
      console.error('Error approving visitor:', error);
      alert('Failed to approve visitor: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (visitId: string) => {
    if (!user || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessingId(visitId);
    try {
      const { error } = await supabase
        .from('visit_logs')
        .update({
          status: 'rejected',
          cso_approved_by: user.id,
          cso_approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', visitId);

      if (error) throw error;

      setPendingVisits(prev => prev.filter(visit => visit.id !== visitId));
      setRejectingId(null);
      setRejectionReason('');
      alert('Visit request rejected successfully!');
    } catch (error: any) {
      console.error('Error rejecting visitor:', error);
      alert('Failed to reject visitor: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatIdType = (idType: string) => {
    const types: Record<string, string> = {
      aadhar: 'Aadhar Card',
      pan: 'PAN Card',
      driving_license: 'Driving License',
      passport: 'Passport',
      voter_id: 'Voter ID'
    };
    return types[idType] || idType;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">CSO Approval</h2>
        <p className="text-slate-600">Review and approve pending visitor requests</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading pending requests...</p>
        </div>
      ) : pendingVisits.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No pending approvals</p>
          <p className="text-slate-500 text-sm mt-2">All visitor requests have been processed</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingVisits.map((visit) => (
            <div
              key={visit.id}
              className="border-2 border-orange-200 bg-orange-50 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Requested: {formatTime(visit.created_at)}
                  </span>
                </div>
                <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-semibold">
                  PENDING APPROVAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Visitor Information
                  </h3>

                  <div className="bg-white p-4 rounded-lg space-y-2">
                    <p className="text-slate-900">
                      <strong>Name:</strong> {visit.visitor.full_name}
                    </p>
                    <p className="text-slate-700">
                      <strong>Phone:</strong> {visit.visitor.phone}
                    </p>
                    {visit.visitor.email && (
                      <p className="text-slate-700">
                        <strong>Email:</strong> {visit.visitor.email}
                      </p>
                    )}
                    {visit.visitor.company && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Building2 className="w-4 h-4" />
                        <span><strong>Company:</strong> {visit.visitor.company}</span>
                      </div>
                    )}
                    <p className="text-slate-700">
                      <strong>ID:</strong> {formatIdType(visit.visitor.id_type)} - {visit.visitor.id_number}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Visit Details
                  </h3>

                  <div className="bg-white p-4 rounded-lg space-y-2">
                    <p className="text-slate-900">
                      <strong>Visiting:</strong> {visit.employee.full_name}
                    </p>
                    <p className="text-slate-700 text-sm">
                      {visit.employee.email}
                    </p>
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-slate-700">
                        <strong>Purpose:</strong>
                      </p>
                      <p className="text-slate-600 mt-1">{visit.purpose}</p>
                    </div>
                  </div>
                </div>
              </div>

              {rejectingId === visit.id ? (
                <div className="bg-white p-4 rounded-lg mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Enter the reason for rejecting this visit request"
                  />
                </div>
              ) : null}

              <div className="flex gap-3 justify-end">
                {rejectingId === visit.id ? (
                  <>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason('');
                      }}
                      className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(visit.id)}
                      disabled={processingId === visit.id || !rejectionReason.trim()}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {processingId === visit.id ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setRejectingId(visit.id)}
                      disabled={processingId === visit.id}
                      className="px-6 py-2.5 border-2 border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(visit.id)}
                      disabled={processingId === visit.id}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processingId === visit.id ? 'Processing...' : 'Approve & Check In'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
