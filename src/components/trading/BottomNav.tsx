import { Home, Search, BarChart3, History, User } from 'lucide-react';

type Tab = 'home' | 'markets' | 'portfolio' | 'history';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Home' },
    { id: 'markets' as Tab, icon: Search, label: 'Markets' },
    { id: 'portfolio' as Tab, icon: BarChart3, label: 'Portfolio' },
    { id: 'history' as Tab, icon: History, label: 'History' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border px-2 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              activeTab === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
