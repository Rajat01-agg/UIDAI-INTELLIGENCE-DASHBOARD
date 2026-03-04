"use client"

import { Bell, Home, User, AlertCircle, TrendingUp, CheckCircle, AlertTriangle, RefreshCw, LogOut, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

type AlertType = "critical" | "warning"

interface Alert {
  id: string
  district: string
  type: AlertType
  metric: string
  deviation: number
  timestamp: string
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    district: "Bangalore Urban",
    type: "critical",
    metric: "Enrollment",
    deviation: 42.5,
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    district: "Mysuru",
    type: "warning",
    metric: "Biometric Update",
    deviation: 28.3,
    timestamp: "4 hours ago"
  },
  {
    id: "3",
    district: "Mandya",
    type: "critical",
    metric: "Demographic Update",
    deviation: 55.8,
    timestamp: "5 hours ago"
  },
  {
    id: "4",
    district: "Hassan",
    type: "warning",
    metric: "Enrollment",
    deviation: 18.2,
    timestamp: "7 hours ago"
  },
  {
    id: "5",
    district: "Tumakuru",
    type: "critical",
    metric: "Biometric Update",
    deviation: 67.4,
    timestamp: "9 hours ago"
  }
]

export default function AadhaarAlertSystem() {
  const [activeTab, setActiveTab] = useState("alerts")
  const [timeFilter, setTimeFilter] = useState("7")
  const [lastSync, setLastSync] = useState("10 mins ago")
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setLastSync("Just now")
    }, 2000)
  }

  const handleLogout = () => {
    // In a real app, this would clear authentication and redirect
    alert("Logout functionality - Would redirect to login page")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      {/* Top Bar */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <img 
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/da5bc330-691c-4b64-9b8b-cce3ed04f6f7.png" 
              alt="Government emblem of India circular logo with Ashoka pillar"
              className="w-12 h-12 bg-white rounded-full p-1"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight">UIDAI Alert System</h1>
              <p className="text-xs text-blue-100">Government of India</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">Rajesh Kumar</p>
              <p className="text-xs text-blue-100">Field Officer</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-blue-600 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "alerts" && (
          <div className="p-4 space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-semibold text-red-900">Critical</span>
                </div>
                <p className="text-2xl font-bold text-red-700">3</p>
                <p className="text-xs text-red-600">Requires immediate action</p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-900">Warning</span>
                </div>
                <p className="text-2xl font-bold text-yellow-700">2</p>
                <p className="text-xs text-yellow-600">Monitor closely</p>
              </div>
            </div>

            {/* Alert Cards */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-gray-800 px-1">Active Alerts</h2>
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base mb-1">
                        {alert.district}
                      </h3>
                      <p className="text-sm text-gray-600">{alert.metric}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        alert.type === "critical"
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      }`}
                    >
                      {alert.type}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Deviation from Baseline
                      </span>
                      <span
                        className={`text-xl font-bold ${
                          alert.type === "critical" ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {alert.deviation}%
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      {alert.timestamp}
                    </span>
                    <button 
                      onClick={() => router.push(`/alert-detail/${alert.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="p-4 space-y-4">
            {/* Filter and Sync Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full appearance-none bg-white border-2 border-gray-300 rounded-md px-3 py-2 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Now
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border-2 border-red-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Active Alerts</span>
                </div>
                <p className="text-3xl font-bold text-red-600 mb-1">5</p>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">3 Critical</span>
                </div>
              </div>

              <div className="bg-white border-2 border-blue-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Home className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Districts</span>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">8</p>
                <p className="text-xs text-gray-600">Monitored</p>
              </div>

              <div className="bg-white border-2 border-green-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Resolution Rate</span>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">87%</p>
                <p className="text-xs text-gray-600">This period</p>
              </div>

              <div className="bg-white border-2 border-orange-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Last Sync</span>
                </div>
                <p className="text-lg font-bold text-orange-600 mb-1">{lastSync}</p>
                <p className="text-xs text-gray-600">Auto-sync enabled</p>
              </div>
            </div>

            {/* District Status Table */}
            <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3">
                <h2 className="text-base font-bold text-white">District Status Overview</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">District</th>
                      <th className="text-center px-2 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Last Alert</th>
                      <th className="text-center px-2 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">Bangalore Urban</td>
                      <td className="px-2 py-3 text-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">2 hours ago</td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-red-600 font-bold">↑ 42%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">Mysuru</td>
                      <td className="px-2 py-3 text-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">4 hours ago</td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-yellow-600 font-bold">↑ 28%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">Mandya</td>
                      <td className="px-2 py-3 text-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">2 days ago</td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-green-600 font-bold">↓ 5%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">Hassan</td>
                      <td className="px-2 py-3 text-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">3 days ago</td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-green-600 font-bold">↓ 12%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">Tumakuru</td>
                      <td className="px-2 py-3 text-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">9 hours ago</td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-red-600 font-bold">↑ 67%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">Chikkamagaluru</td>
                      <td className="px-2 py-3 text-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">5 days ago</td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-green-600 font-bold">↓ 8%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">Chitradurga</td>
                      <td className="px-2 py-3 text-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">1 week ago</td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-green-600 font-bold">↓ 3%</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">Davanagere</td>
                      <td className="px-2 py-3 text-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">4 days ago</td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-green-600 font-bold">↓ 15%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-bold text-gray-700 mb-2">Status Indicators:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Normal Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-gray-600">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-gray-600">Critical</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="p-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Rajesh Kumar</h2>
                <p className="text-gray-600">Field Officer - Karnataka Region</p>
              </div>
              <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-semibold text-gray-700">Officer ID</span>
                  <span className="text-sm text-gray-600">FO-KA-2024-1247</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-semibold text-gray-700">Department</span>
                  <span className="text-sm text-gray-600">UIDAI Field Operations</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm font-semibold text-gray-700">Assigned Districts</span>
                  <span className="text-sm text-gray-600">8 Districts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-700">Contact</span>
                  <span className="text-sm text-gray-600">+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg max-w-md mx-auto">
        <div className="grid grid-cols-3 h-16">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "alerts"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-xs font-semibold">Alerts</span>
            {activeTab === "alerts" && (
              <div className="absolute bottom-0 h-1 w-20 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "dashboard"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-semibold">Dashboard</span>
            {activeTab === "dashboard" && (
              <div className="absolute bottom-0 h-1 w-20 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === "profile"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-semibold">Profile</span>
            {activeTab === "profile" && (
              <div className="absolute bottom-0 h-1 w-20 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}
