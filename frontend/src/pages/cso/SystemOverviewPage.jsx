import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";

const SystemOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data.data);
    } catch (err) {
      setError("Failed to load system overview data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <Alert type="error">{error}</Alert>;

  // --- Data Preparation for Recharts ---

  const totalCerts =
    (stats?.compliance?.expired || 0) +
    (stats?.compliance?.expiringSoon || 0) +
    (stats?.compliance?.valid || 0);

  // 1. Compliance Trend Data (Mocked based on input)
  // In a real app, map this from stats.history
  const complianceTrendData = [
    { name: "Jan", rate: 85, expired: 10 },
    { name: "Feb", rate: 88, expired: 8 },
    { name: "Mar", rate: 86, expired: 8 },
    { name: "Apr", rate: 90, expired: 6 },
    { name: "May", rate: 92, expired: 5 },
    {
      name: "Jun",
      rate: stats?.compliance?.complianceRate || 95,
      expired: stats?.compliance?.expired || 0,
    },
  ];

  // 2. Entity Distribution Data
  const entityData = [
    { name: "Airlines", value: 12, color: "#ef4444" },
    { name: "Ground", value: 8, color: "#f97316" },
    { name: "Cargo", value: 5, color: "#f59e0b" },
    { name: "Catering", value: 3, color: "#10b981" },
    { name: "Others", value: 4, color: "#6366f1" },
  ];

  // 3. Certificate Status (Pie)
  const pieData = [
    { name: "Valid", value: stats?.compliance?.valid || 0, color: "#10b981" },
    {
      name: "Expiring",
      value: stats?.compliance?.expiringSoon || 0,
      color: "#f59e0b",
    },
    {
      name: "Expired",
      value: stats?.compliance?.expired || 0,
      color: "#ef4444",
    },
  ];

  // 4. Staff Distribution (Doughnut)
  const staffData = [
    { name: "Entity A", value: 150, color: "#3b82f6" },
    { name: "Entity B", value: 120, color: "#8b5cf6" },
    { name: "Entity C", value: 90, color: "#ec4899" },
    { name: "Others", value: 140, color: "#cbd5e1" },
  ];

  // Key Metrics Config
  const keyMetrics = [
    {
      title: "System Health",
      value: "98.5%",
      change: "+2.5%",
      trend: "up",
      icon: Activity,
      colorClass: "text-emerald-500 bg-emerald-50",
    },
    {
      title: "Compliance Rate",
      value: `${stats?.compliance?.complianceRate || 95}%`,
      change: "+5%",
      trend: "up",
      icon: CheckCircle,
      colorClass: "text-blue-500 bg-blue-50",
    },
    {
      title: "Response Time",
      value: "1.2s",
      change: "-0.3s",
      trend: "up", // 'down' in value is 'good' here, so we use up/green
      icon: Clock,
      colorClass: "text-orange-500 bg-orange-50",
    },
    {
      title: "Active Users",
      value: stats?.totals?.staff || 0,
      change: "+12",
      trend: "up",
      icon: Users,
      colorClass: "text-purple-500 bg-purple-50",
    },
  ];

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl">
          <p className="text-xs font-bold text-slate-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-xs font-medium"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="font-['Poppins'] text-slate-900 space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Analytics and insights
          </p>
        </div>

        {/* Time Range Pills */}
        <div className="bg-white p-1 rounded-2xl border border-slate-100 flex items-center shadow-sm">
          {["Week", "Month", "Year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range.toLowerCase())}
              className={`
                px-4 py-2 text-xs font-bold rounded-xl transition-all
                ${
                  timeRange === range.toLowerCase()
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }
              `}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${metric.colorClass} transition-transform group-hover:scale-110`}
              >
                <metric.icon size={22} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> {metric.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {metric.value}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{metric.title}</p>
          </div>
        ))}
      </div>

      {/* 3. Main Charts Row (Trends & Entity Dist) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Trend (Line/Area) - Spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Compliance Trends
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                6 Month performance history
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <Filter size={18} className="text-slate-400" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complianceTrendData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
                {/* Secondary line for Expired items */}
                <Area
                  type="monotone"
                  dataKey="expired"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entity Distribution (Bar) - Spans 1 col */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Entities</h3>
            <MoreHorizontal className="text-slate-300 cursor-pointer" />
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entityData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                  width={60}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {entityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Circular Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Status (Pie) */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-900 w-full mb-4">
            Certificate Status
          </h3>
          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-slate-900">{totalCerts}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-slate-500">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Distribution (Doughnut) */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-900 w-full mb-4">
            Staff Distribution
          </h3>
          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={staffData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {staffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {stats?.totals?.staff || 0}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Staff
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {staffData.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-slate-500">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Warnings Panel */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-amber-500" size={20} />
            <h3 className="text-lg font-bold text-slate-900">System Alerts</h3>
          </div>

          <div className="space-y-4">
            {/* Alert 1 */}
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                  Critical
                </span>
                <span className="text-[10px] font-bold text-red-400">
                  {stats?.compliance?.expired || 0} items
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                Expired Certificates
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Requires immediate attention.
              </p>
            </div>

            {/* Alert 2 */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                  Warning
                </span>
                <span className="text-[10px] font-bold text-amber-400">
                  {stats?.compliance?.expiringSoon || 0} items
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">Expiring Soon</p>
              <p className="text-xs text-slate-500 mt-1">
                Action needed within 30 days.
              </p>
            </div>

            {/* Status */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600">
                System Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Quick Stats (Progress Bars) */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Metric 1 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">
                Compliance Rate
              </span>
              <span className="text-xs font-bold text-slate-900">
                {stats?.compliance?.complianceRate || 95}%
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${stats?.compliance?.complianceRate || 95}%` }}
              />
            </div>
          </div>

          {/* Metric 2 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">
                Staff Certification
              </span>
              <span className="text-xs font-bold text-slate-900">
                {totalCerts > 0
                  ? Math.round(((stats?.totals?.staff || 0) / totalCerts) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${
                    totalCerts > 0
                      ? Math.round(
                          ((stats?.totals?.staff || 0) / totalCerts) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Metric 3 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">
                Entity Coverage
              </span>
              <span className="text-xs font-bold text-slate-900">100%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverviewPage;
