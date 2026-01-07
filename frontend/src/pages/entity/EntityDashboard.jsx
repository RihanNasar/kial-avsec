import { useState, useEffect } from 'react';
import { entityAPI } from '../../services/api';
import { 
  Users, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EntityDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await entityAPI.getDashboard();
      setDashboard(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  const totalStaff = dashboard?.entity?.staffMembers?.length || 0;
  const totalCerts = dashboard?.entity?.staffMembers?.reduce((acc, staff) => acc + (staff.certificates?.length || 0), 0) || 0;
  const expiringSoon = dashboard?.compliance?.expiringSoon || 0;
  const expired = dashboard?.compliance?.expired || 0;
  const valid = totalCerts - expiringSoon - expired;

  const statCards = [
    {
      title: 'Total Staff',
      value: totalStaff,
      icon: Users,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      title: 'Total Certificates',
      value: totalCerts,
      icon: FileText,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      title: 'Valid Certificates',
      value: valid,
      icon: CheckCircle,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      title: 'Expiring Soon',
      value: expiringSoon,
      icon: Clock,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      title: 'Expired',
      value: expired,
      icon: AlertTriangle,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
  ];

  // Certificate Status Chart Data
  const certificateStatusData = {
    labels: ['Valid', 'Expiring Soon', 'Expired'],
    datasets: [
      {
        data: [valid, expiringSoon, expired],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(220, 38, 38, 0.8)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(220, 38, 38)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Staff Certificates Bar Chart
  const staffCertificatesData = {
    labels: dashboard?.entity?.staffMembers?.slice(0, 5).map(s => s.name.split(' ')[0]) || [],
    datasets: [
      {
        label: 'Certificates',
        data: dashboard?.entity?.staffMembers?.slice(0, 5).map(s => s.certificates?.length || 0) || [],
        backgroundColor: 'rgba(220, 38, 38, 0.8)',
        borderColor: 'rgb(220, 38, 38)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Entity Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Overview of your entity's compliance status
        </p>
      </div>

      {/* Entity Info */}
      {dashboard?.entity && (
        <div className="glass-panel p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {dashboard.entity.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500">Category</p>
              <p className="font-medium text-slate-900">{dashboard.entity.category || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Security Status</p>
              <p className="font-medium text-slate-900">{dashboard.entity.securityClearanceStatus || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">ASCO</p>
              <p className="font-medium text-slate-900">{dashboard.entity.ascoName || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-panel p-6 flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.bgColor }}
              >
                <Icon size={24} color={stat.color} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Certificate Status Chart */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={20} className="text-red-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Certificate Status
            </h3>
          </div>
          <div className="h-[300px] flex justify-center">
            <Doughnut data={certificateStatusData} options={chartOptions} />
          </div>
        </div>

        {/* Staff Certificates Chart */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Top Staff by Certificates
            </h3>
          </div>
          <div className="h-[300px]">
            <Bar 
              data={staffCertificatesData} 
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Compliance Progress */}
      <div className="glass-panel p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          Compliance Overview
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">Valid Certificates</span>
              <span className="text-sm font-semibold text-emerald-600">
                {totalCerts > 0 ? Math.round((valid / totalCerts) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${totalCerts > 0 ? Math.round((valid / totalCerts) * 100) : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">Staff with Certificates</span>
              <span className="text-sm font-semibold text-blue-600">
                {totalStaff > 0 && totalCerts > 0 ? Math.round((totalStaff / totalCerts) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${totalStaff > 0 && totalCerts > 0 ? Math.round((totalStaff / totalCerts) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle size={24} className="text-red-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Compliance Alerts
          </h2>
        </div>

        <div className="space-y-4">
          {expiringSoon > 0 && (
            <Alert type="warning">
              <strong>{expiringSoon} certificate(s)</strong> expiring within 30 days.
            </Alert>
          )}
          
          {expired > 0 && (
            <Alert type="error">
              <strong>{expired} certificate(s)</strong> have expired.
            </Alert>
          )}

          {expiringSoon === 0 && expired === 0 && (
            <Alert type="success">
              All certificates are in good standing.
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityDashboard;
