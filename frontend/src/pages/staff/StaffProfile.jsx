import { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import { User, Save } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import { formatDate } from '../../utils/helpers';

const StaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    designation: '',
    aadhaarNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await staffAPI.getProfile();
      const data = response.data.data;
      setProfile(data);
      setFormData({
        fullName: data.fullName || '',
        designation: data.designation || '',
        aadhaarNumber: data.aadhaarNumber || '',
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await staffAPI.updateProfile(formData);
      setSuccess('Profile updated successfully');
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">
          View and update your personal information
        </p>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info Card */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <User size={32} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                {profile?.fullName}
              </h2>
              <p className="text-sm text-slate-500">
                {profile?.designation || 'Staff Member'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Entity
              </label>
              <p className="mt-1 font-medium text-slate-900">
                {profile?.entity?.name || 'KIAL Staff'}
              </p>
            </div>

            {profile?.aepNumber && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  AEP Number
                </label>
                <p className="mt-1 font-medium text-slate-900">
                  {profile.aepNumber}
                </p>
              </div>
            )}

            {profile?.aepValidFrom && profile?.aepValidTo && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  AEP Validity
                </label>
                <p className="mt-1 font-medium text-slate-900">
                  {formatDate(profile.aepValidFrom)} - {formatDate(profile.aepValidTo)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Update Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                className="glass-input w-full"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                className="glass-input w-full"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number</label>
              <input
                type="text"
                className="glass-input w-full"
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                maxLength="12"
                placeholder="12-digit Aadhaar number"
              />
            </div>

            <button
              type="submit"
              className="glass-button w-full flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
