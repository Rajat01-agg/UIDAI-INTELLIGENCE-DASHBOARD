import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  FileText, 
  Bell, 
  Lightbulb, 
  Activity, // Import Activity icon for Impact Tracker
  Settings 
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  // Design Specs
  const SIDEBAR_BG = '#0f2942'; 
  const ACTIVE_BG = '#f59e0b'; // Orange

  const mainNavItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: ViewState.HEATMAP, label: 'Heatmap', icon: <Map className="h-5 w-5" /> },
    { id: ViewState.CHARTS, label: 'Charts & Visuals', icon: <BarChart3 className="h-5 w-5" /> },
    { id: ViewState.REPORTS, label: 'Reports', icon: <FileText className="h-5 w-5" /> },
    { id: ViewState.ALERTS, label: 'Alerts', icon: <Bell className="h-5 w-5" /> },
    { id: ViewState.POLICY, label: 'Policy Suggestions', icon: <Lightbulb className="h-5 w-5" /> },
    { id: ViewState.IMPACT, label: 'Impact Tracker', icon: <Activity className="h-5 w-5" /> }, // Added Impact Tracker
  ];


  const renderItem = (item: any) => {
    const isActive = currentView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onChangeView(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 group
          ${isActive 
            ? 'text-white font-semibold shadow-md' 
            : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        style={isActive ? { backgroundColor: ACTIVE_BG } : {}}
      >
        <span className={isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}>
          {item.icon}
        </span>
        <span className="text-sm font-medium">{item.label}</span>
        {item.badge && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside 
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 overflow-y-auto custom-scrollbar"
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      <nav className="p-4 flex flex-col min-h-full">
        <div className="flex-1">
          {mainNavItems.map(renderItem)}
        </div>
        
        <div className="mt-8 px-4 text-center">
            <p className="text-xs text-gray-500">v2.4.1 Connected</p>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;