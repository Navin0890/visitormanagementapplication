import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserCircle2, Phone, Mail, Building2, CreditCard, User } from 'lucide-react';

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface FormData {
  full_name: string;
  phone: string;
  email: string;
  company: string;
  id_type: string;
  id_number: string;
  employee_id: string;
  purpose: string;
}

export default function VisitorRegistration() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    email: '',
    company: '',
    id_type: 'aadhar',
    id_number: '',
    employee_id: '',
    purpose: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('is_active', true)
      .order('full_name');

    if (error) {
      console.error('Error fetching employees:', error);
    } else {
      setEmployees(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { data: visitor, error: visitorError } = await supabase
        .from('visitors')
        .insert({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email || null,
          company: formData.company || null,
          id_type: formData.id_type,
          id_number: formData.id_number
        })
        .select()
        .single();

      if (visitorError) throw visitorError;

      const { error: visitError } = await supabase
        .from('visit_logs')
        .insert({
          visitor_id: visitor.id,
          employee_id: formData.employee_id,
          purpose: formData.purpose,
          status: 'pending_approval'
        });

      if (visitError) throw visitError;

      setSuccess(true);
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        company: '',
        id_type: 'aadhar',
        id_number: '',
        employee_id: '',
        purpose: ''
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error registering visitor:', error);
      alert('Failed to register visitor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Visitor Registration</h2>
        <p className="text-slate-600">Register a new visitor and create visit entry</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          Visitor registered successfully! Request sent for CSO approval.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <UserCircle2 className="w-4 h-4" />
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter visitor's full name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Mail className="w-4 h-4" />
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Building2 className="w-4 h-4" />
              Company (Optional)
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <CreditCard className="w-4 h-4" />
              ID Type *
            </label>
            <select
              name="id_type"
              value={formData.id_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="aadhar">Aadhar Card</option>
              <option value="pan">PAN Card</option>
              <option value="driving_license">Driving License</option>
              <option value="passport">Passport</option>
              <option value="voter_id">Voter ID</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <CreditCard className="w-4 h-4" />
              ID Number *
            </label>
            <input
              type="text"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter ID number"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <User className="w-4 h-4" />
              Employee to Visit *
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Purpose of Visit *
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter the purpose of visit"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Registering...' : 'Register Visitor'}
          </button>
        </div>
      </form>
    </div>
  );
}
