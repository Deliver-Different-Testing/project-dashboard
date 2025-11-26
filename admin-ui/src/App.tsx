import { useState, type ReactNode } from 'react';
import { TerritoryPage } from './modules/territory';
import { ClientsPage } from './modules/clients';
import { NotificationsPage } from './modules/notifications';

type Module = 'territory' | 'clients' | 'notifications';

const MODULES: { id: Module; label: string; icon: ReactNode }[] = [
  {
    id: 'territory',
    label: 'Territory & Locations',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'clients',
    label: 'Clients & Customers',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notification Center',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

function App() {
  const [activeModule, setActiveModule] = useState<Module>('territory');

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Top Navigation Bar */}
      <nav className="bg-brand-dark border-b border-white/10 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-cyan flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                <circle cx="6.5" cy="16.5" r="2.5" />
                <circle cx="16.5" cy="16.5" r="2.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Deliver Different</h1>
              <p className="text-xs text-white/50">Admin Settings</p>
            </div>
          </div>

          {/* Module Navigation */}
          <div className="flex items-center gap-2">
            {MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeModule === module.id
                    ? 'bg-brand-cyan text-brand-dark'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {module.icon}
                <span className="text-sm font-medium">{module.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button className="p-2 text-white/70 hover:text-white transition-colors relative">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-cyan rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary-purple flex items-center justify-center text-white text-sm font-medium">
              AD
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {activeModule === 'territory' && <TerritoryPage />}
        {activeModule === 'clients' && <ClientsPage />}
        {activeModule === 'notifications' && <NotificationsPage />}
      </main>
    </div>
  );
}

export default App;
