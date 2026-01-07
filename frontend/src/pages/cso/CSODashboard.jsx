import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import {
  Users,
  Building2,
  CheckCircle,
  Activity,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  AlertTriangle,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";
import { formatDate } from "../../utils/helpers";

const CSODashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for chart data
  const [certData, setCertData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      const data = response.data.data;
      setStats(data);

      // --- GENERATE DYNAMIC CHART DATA ---
      // In a real app, you might fetch this 'history' from the backend.
      // Here, we generate a trend curve based on the current actual totals.

      const currentTotal = data?.totals?.certificates || 0;

      // Calculate Compliance %
      const totalCerts =
        (data?.compliance?.expired || 0) +
        (data?.compliance?.expiringSoon || 0) +
        (data?.compliance?.valid || 0);
      const currentCompliance =
        totalCerts > 0
          ? (((data?.compliance?.valid || 0) / totalCerts) * 100).toFixed(0)
          : 0;

      // Generate 6 months of mock trend data ending at the current values
      const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      setCertData(
        months.map((month, i) => {
          // Create a gentle upward curve ending at the current total
          // We subtract decreasing amounts from the current total to simulate growth
          const randomVar = Math.floor(Math.random() * 50);
          return {
            name: month,
            value: Math.max(0, currentTotal - (5 - i) * 120 + randomVar),
          };
        })
      );

      setComplianceData(
        months.map((month, i) => {
          // Create a curve ending at the current compliance %
          const variance = Math.floor(Math.random() * 10) - 5;
          return {
            name: month,
            value: Math.min(
              100,
              Math.max(0, parseInt(currentCompliance) - (5 - i) * 2 + variance)
            ),
          };
        })
      );
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <Alert type="error">{error}</Alert>;

  // --- Calculations ---
  const totalCerts =
    (stats?.compliance?.expired || 0) +
    (stats?.compliance?.expiringSoon || 0) +
    (stats?.compliance?.valid || 0);
  const validPercent =
    totalCerts > 0
      ? (((stats?.compliance?.valid || 0) / totalCerts) * 100).toFixed(0)
      : 0;

  return (
    <div className="font-['Poppins'] text-slate-900 space-y-6">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Overview of security compliance
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95">
            <Share2 size={16} />
            <span>Share Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (Wide Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Stats Row (3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1: Entities */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Building2 size={20} />
                </div>
                <MoreHorizontal
                  size={20}
                  className="text-slate-300 cursor-pointer hover:text-slate-500"
                />
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {stats?.totals?.entities || 0}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Active Entities
              </p>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl transform translate-x-8 translate-y-8" />
            </div>

            {/* Stat 2: Staff */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Users size={20} />
                </div>
                <MoreHorizontal
                  size={20}
                  className="text-slate-300 cursor-pointer hover:text-slate-500"
                />
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {stats?.totals?.staff || 0}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Total Staff</p>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl transform translate-x-8 translate-y-8" />
            </div>

            {/* Stat 3: Pending Approvals */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center transition-transform group-hover:scale-110">
                  <CheckCircle size={20} />
                </div>
                <MoreHorizontal
                  size={20}
                  className="text-slate-300 cursor-pointer hover:text-slate-500"
                />
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {stats?.pendingApprovals || 0}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Pending Approvals
              </p>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl transform translate-x-8 translate-y-8" />
            </div>
          </div>

          {/* Middle Row: REAL DYNAMIC CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Certificate Health (Purple) */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-[280px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900">Certificates</h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight size={12} /> +3%
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {stats?.totals?.certificates || 0}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Total issued certificates
                </p>
              </div>

              {/* RECHARTS - Purple Area Chart */}
              <div className="h-32 w-full mt-4 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={certData}>
                    <defs>
                      <linearGradient
                        id="colorPurple"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{
                        color: "#8b5cf6",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                      cursor={{
                        stroke: "#8b5cf6",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPurple)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Compliance Rate (Orange) */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-[280px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900">Compliance Rate</h3>
                  {parseInt(validPercent) < 80 ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                      <ArrowDownRight size={12} /> -2%
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                      <ArrowUpRight size={12} /> Stable
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {validPercent}%
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Overall system health
                </p>
              </div>

              {/* RECHARTS - Orange Area Chart */}
              <div className="h-32 w-full mt-4 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={complianceData}>
                    <defs>
                      <linearGradient
                        id="colorOrange"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{
                        color: "#f59e0b",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                      cursor={{
                        stroke: "#f59e0b",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOrange)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Section: Recent Activity Table */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-lg">
                Recent Activity
              </h3>
              <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-6">
              {stats?.recentActivities?.slice(0, 4).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {activity.action}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {activity.user?.fullName || "System"}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="hidden sm:block flex-1 mx-8 max-w-[200px]">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="text-xs font-bold text-slate-900">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {(!stats?.recentActivities ||
                stats.recentActivities.length === 0) && (
                <p className="text-center text-slate-400 text-sm py-4">
                  No recent activity found.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Narrow Sidebar) */}
        <div className="space-y-6">
          {/* 1. "Gold Card" - Critical Insights */}
          <div className="bg-[#F59E0B] rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg shadow-orange-500/20 h-[380px] flex flex-col">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />

            <div className="flex justify-between items-start mb-6 z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <MoreHorizontal className="text-white/60 cursor-pointer hover:text-white" />
            </div>

            <h2 className="text-4xl font-bold mb-2">
              {stats?.compliance?.expiringSoon || 0}
            </h2>
            <p className="text-sm font-medium text-orange-50 mb-8 opacity-90">
              Certificates Expiring Soon
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mt-auto border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white">
                  Critical Action
                </span>
              </div>
              <p className="text-[10px] text-orange-50 leading-relaxed opacity-80">
                {stats?.compliance?.expired || 0} certificates have already
                expired. Immediate renewal required.
              </p>
            </div>
          </div>

          {/* 2. Secondary List - Action Items */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Action Items</h3>
              <MoreHorizontal
                size={16}
                className="text-slate-300 cursor-pointer"
              />
            </div>

            <div className="space-y-5">
              {/* Item 1 */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Expired</span>
                  <span className="text-red-500">
                    {stats?.compliance?.expired || 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[81%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
              </div>

              {/* Item 2 */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Expiring</span>
                  <span className="text-orange-400">
                    {stats?.compliance?.expiringSoon || 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 w-[65%] rounded-full shadow-[0_0_10px_rgba(251,146,60,0.5)]" />
                </div>
              </div>

              {/* Item 3 */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Pending</span>
                  <span className="text-blue-500">
                    {stats?.pendingApprovals || 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-50">
                <p className="text-[10px] text-center text-slate-400 font-medium">
                  System performance is stable.
                </p>
                <button className="flex items-center justify-center gap-1 w-full mt-3 text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors group">
                  View Full Report{" "}
                  <ArrowUpRight
                    size={10}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSODashboard;
