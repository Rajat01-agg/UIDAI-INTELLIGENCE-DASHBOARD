"use client"

import { ArrowLeft, AlertCircle, TrendingUp, CheckCircle2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"

// Mock data for trend chart (last 6 months)
const trendData = [
  { month: "Sep", value: 2340 },
  { month: "Oct", value: 2450 },
  { month: "Nov", value: 2380 },
  { month: "Dec", value: 2280 },
  { month: "Jan", value: 2150 },
  { month: "Feb", value: 1650 }
]

// Mock age group data
const ageGroups = [
  { range: "0-18 years", percentage: 12, count: 245 },
  { range: "19-35 years", percentage: 38, count: 780 },
  { range: "36-60 years", percentage: 35, count: 720 },
  { range: "60+ years", percentage: 15, count: 308 }
]

const mockAlertDetails = {
  "1": {
    district: "Bangalore Urban",
    type: "critical" as const,
    metric: "Enrollment",
    deviation: 42.5,
    timestamp: "2 hours ago",
    currentCount: 1650,
    baselineCount: 2380,
    probableCauses: [
      "Significant reduction in enrollment center operational hours (3 out of 8 centers operating part-time)",
      "Staff shortage reported in 2 major centers due to medical leave",
      "System downtime recorded for 6 hours on Feb 12, 2025 affecting online bookings"
    ],
    recommendedActions: [
      "Verify enrollment center operations",
      "Check staff availability",
      "Review pending applications",
      "Inspect biometric device functionality",
      "Coordinate with center supervisors"
    ]
  },
  "2": {
    district: "Mysuru",
    type: "warning" as const,
    metric: "Biometric Update",
    deviation: 28.3,
    timestamp: "4 hours ago",
    currentCount: 1850,
    baselineCount: 2580,
    probableCauses: [
      "Increase in biometric mismatch errors at primary enrollment center",
      "Aging biometric capture devices requiring calibration",
      "Network connectivity issues in rural enrollment stations"
    ],
    recommendedActions: [
      "Verify enrollment center operations",
      "Check staff availability",
      "Review pending applications",
      "Inspect biometric device functionality"
    ]
  }
}

export default function AlertDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({})
  const [comment, setComment] = useState("")
  
  const alertId = params.id
  const alert = mockAlertDetails[alertId as keyof typeof mockAlertDetails] || mockAlertDetails["1"]
  
  const toggleAction = (index: number) => {
    setCheckedActions(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const handleMarkResolved = () => {
    alert("Alert marked as resolved. This will be logged in the system.")
    router.push("/")
  }

  const handleEscalate = () => {
    alert("Alert escalated to State Officer. Notification sent.")
    router.push("/")
  }

  const handleFalseAlert = () => {
    alert("Marked as false alert. This will be reviewed by the system.")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-4 shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.push("/")}
            className="p-1 hover:bg-blue-600/50 rounded-md transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{alert.district}</h1>
            <p className="text-xs text-blue-100">Alert Details</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              alert.type === "critical"
                ? "bg-red-100 text-red-800 border-2 border-red-300"
                : "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
            }`}
          >
            {alert.type}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-32 space-y-4">
        {/* Key Metrics */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Key Metrics
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Current Count */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-800 mb-1">Current Count</p>
              <p className="text-2xl font-bold text-red-700">{alert.currentCount.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-1">{alert.metric}</p>
            </div>
            
            {/* Baseline */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800 mb-1">Baseline</p>
              <p className="text-2xl font-bold text-blue-700">{alert.baselineCount.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">Monthly Average</p>
            </div>
          </div>

          {/* Deviation Card */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Deviation from Baseline</span>
              <span className={`text-2xl font-bold ${
                alert.type === "critical" ? "text-red-600" : "text-yellow-600"
              }`}>
                -{alert.deviation}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  alert.type === "critical" ? "bg-red-600" : "bg-yellow-600"
                }`}
                style={{ width: `${alert.deviation}%` }}
              />
            </div>
          </div>

          {/* Trend Graph */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">6-Month Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0B5ED7"
                  strokeWidth={3}
                  dot={{ fill: "#0B5ED7", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Affected Age Groups */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Affected Age Groups
          </h2>
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
            {ageGroups.map((group, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">{group.range}</span>
                  <span className="text-gray-600">{group.count} ({group.percentage}%)</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Probable Causes */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Probable Causes
          </h2>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <ul className="space-y-3">
              {alert.probableCauses.map((cause, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-orange-600 font-bold mt-0.5">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Recommended Actions */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Recommended Actions
          </h2>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
            {alert.recommendedActions.map((action, index) => (
              <label
                key={index}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={checkedActions[index] || false}
                  onChange={() => toggleAction(index)}
                  className="mt-0.5 w-5 h-5 rounded border-2 border-green-400 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className={`text-sm flex-1 transition-all ${
                  checkedActions[index] 
                    ? "line-through text-gray-500" 
                    : "text-gray-700 group-hover:text-gray-900"
                }`}>
                  {action}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Officer Notes */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">Officer Notes</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your observations, actions taken, or additional notes here..."
            className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            These notes will be attached to the alert record for future reference.
          </p>
        </section>
      </main>

      {/* Action Buttons - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 p-4 shadow-lg max-w-md mx-auto space-y-2">
        <button
          onClick={handleMarkResolved}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Mark as Resolved
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleEscalate}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            Escalate to State
          </button>
          <button
            onClick={handleFalseAlert}
            className="bg-gray-400 hover:bg-gray-500 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            False Alert
          </button>
        </div>
      </div>
    </div>
  )
}
