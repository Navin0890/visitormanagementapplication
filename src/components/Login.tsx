import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('Admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email address first.');
      } else {
        setError('Unable to sign in. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-slate-900 p-4 rounded-full">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Visitor Management
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Sign in to access the system
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email / Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
              placeholder="Enter email or username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
              <div className="mt-2 text-xs">
                Need to create an account? Visit <a href="/setup.html" className="underline font-medium">Setup Page</a>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 text-center mb-3">
            Quick Login:
          </p>
          <div className="space-y-2">
            <button
              onClick={() => quickLogin('admin@company.com', 'Admin123')}
              className="w-full px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition text-slate-700"
            >
              Admin Account
            </button>
            <button
              onClick={() => quickLogin('reception@company.com', 'reception123')}
              className="w-full px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition text-slate-700"
            >
              Reception Account
            </button>
            <button
              onClick={() => quickLogin('cso@company.com', 'cso123')}
              className="w-full px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition text-slate-700"
            >
              CSO Account
            </button>
          </div>
          <div className="mt-4 text-center">
            <a href="/setup.html" className="text-sm text-slate-600 hover:text-slate-900 underline">
              Create New Accounts
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
