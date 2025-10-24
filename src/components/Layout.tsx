import { ReactNode } from 'react';
import { LogOut, Users, ShieldCheck, LayoutDashboard, UserPlus, DoorOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'register', label: 'Register', icon: UserPlus, roles: ['reception', 'admin'] },
    { id: 'exit', label: 'Exit Log', icon: DoorOpen, roles: ['reception', 'admin'] },
    { id: 'approval', label: 'Approvals', icon: ShieldCheck, roles: ['cso', 'admin'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  ];

  const visibleNavItems = navItems.filter(item =>
    userRole && item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Visitor Management</h1>
                <p className="text-xs text-slate-500 capitalize">{userRole} Portal</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                  currentView === item.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
}
