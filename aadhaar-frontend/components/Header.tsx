import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  ChevronDown, 
  Bell, 
  LogOut, 
  User,
  MapPin,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { ViewState, SearchResult, Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { search, fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../services/aadhaarApi';
import { CANONICAL_STATES_UTS } from '../data/states';
import { DISTRICT_NAMES } from '../data/districts';

interface HeaderProps {
  onViewChange?: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ onViewChange }) => {
  const { user, logout } = useAuth();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // User dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const response = await search(debouncedQuery);
        setSearchResults(response.results);
        setShowSearchResults(true);
      } catch (err) {
        console.warn('Search API failed, using local state/district data:', err);
        // Client-side search across canonical states & districts
        const q = debouncedQuery.toLowerCase();
        const localResults: SearchResult[] = [];
        for (const s of CANONICAL_STATES_UTS) {
          if (s.name.toLowerCase().includes(q) || s.abbreviation.toLowerCase().includes(q)) {
            localResults.push({ id: String(s.id), type: 'state', title: s.name, subtitle: `${s.abbreviation} • ${s.districtCount} districts` });
          }
          // Search districts for this state
          const districts = DISTRICT_NAMES[s.abbreviation] || [];
          for (const d of districts) {
            if (d.toLowerCase().includes(q)) {
              localResults.push({ id: `${s.abbreviation}-${d}`, type: 'district', title: d, subtitle: s.name });
            }
          }
          if (localResults.length >= 15) break;
        }
        setSearchResults(localResults.slice(0, 15));
        setShowSearchResults(true);
      } finally {
        setIsSearching(false);
      }
    };
    
    performSearch();
  }, [debouncedQuery]);
  
  // Load notifications from backend alerts
  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetchNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds for new alerts
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search result click
  const handleSearchResultClick = useCallback((result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    // Navigate based on result type
    if (result.type === 'state' || result.type === 'district') {
      onViewChange?.(ViewState.DASHBOARD);
    } else if (result.type === 'alert') {
      onViewChange?.(ViewState.ALERTS);
    }
  }, [onViewChange]);
  
  // Mark all notifications as read (calls per-alert PATCH)
  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    // Fire backend calls in parallel
    await Promise.allSettled(unread.map(n => markNotificationRead(n.id)));
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
  };
  
  // Get result icon based on type
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'state':
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'district':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };
  
  // Get notification icon color
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'emergency': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-500 bg-green-50';
      default: return 'text-blue-500 bg-blue-50';
    }
  };
  
  // User initials
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AA';

  return (
    <header className="fixed top-0 w-full h-16 bg-white shadow-sm z-50 flex flex-col justify-center border-b border-gray-200">
      <div className="flex items-center justify-between px-6 w-full">
        
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-navy-900 rounded-full flex items-center justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_of_India_logo.svg/1200px-Government_of_India_logo.svg.png" alt="Emblem" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-base leading-tight">
              Aadhaar Intelligence Dashboard
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">
              Unique Identification Authority of India
            </p>
          </div>
        </div>
        
        {/* Center: Global Search */}
        <div className="flex-1 max-w-lg mx-8 hidden md:block" ref={searchRef}>
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              placeholder="Search states, districts, alerts..."
              autoComplete="off"
              className="w-full px-5 py-2.5 pl-11 rounded-full bg-white 
                         border border-gray-300 text-gray-700 text-sm
                         placeholder-gray-400 focus:outline-none 
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm"
            />
            {isSearching ? (
              <Loader2 className="absolute left-4 top-2.5 h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-400" />
            )}
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="max-h-80 overflow-y-auto">
                  {/* Group by type */}
                  {['state', 'district', 'alert'].map(type => {
                    const typeResults = searchResults.filter(r => r.type === type);
                    if (typeResults.length === 0) return null;
                    
                    return (
                      <div key={type}>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                          {type === 'state' ? 'States' : type === 'district' ? 'Districts' : 'Alerts'}
                        </div>
                        {typeResults.map(result => (
                          <button
                            key={result.id}
                            onClick={() => handleSearchResultClick(result)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            {getResultIcon(result.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                              )}
                            </div>
                            {result.status && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                result.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                result.status === 'WATCH' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {result.status}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* No results */}
            {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right: Notifications + User Profile */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-full ${getNotificationColor(notification.type)}`}>
                            <Bell className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => { setShowNotifications(false); onViewChange?.(ViewState.ALERTS); }}
                  className="w-full px-4 py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-100"
                >
                  View all alerts
                </button>
              </div>
            )}
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="h-9 w-9 bg-[#0f2942] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left max-w-[140px]">
                <p className="font-bold text-sm text-gray-900 leading-none truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 leading-none mt-1 truncate">
                  {user?.role || 'Central Officer'}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 hidden sm:block transition-transform ${
                showUserMenu ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@uidai.gov.in'}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setShowUserMenu(false); onViewChange?.(ViewState.PROFILE); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
