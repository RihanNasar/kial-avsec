import { useState, useEffect } from 'react';
import { entityAPI } from '../../services/api';
import { Users, Plus, Edit2, Search, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';
import { formatDate } from '../../utils/helpers';

const EntityStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    designation: '',
    aadhaarNumber: '',
    department: '',
    aepNumber: '',
    aepValidFrom: '',
    aepValidTo: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await entityAPI.getStaff();
      setStaff(response.data.data || []);
    } catch (err) {
      setError('Failed to load staff');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        fullName: staffMember.fullName || '',
        designation: staffMember.designation || '',
        aadhaarNumber: staffMember.aadhaarNumber || '',
        department: staffMember.department || '',
        aepNumber: staffMember.aepNumber || '',
        aepValidFrom: staffMember.aepValidFrom ? staffMember.aepValidFrom.split('T')[0] : '',
        aepValidTo: staffMember.aepValidTo ? staffMember.aepValidTo.split('T')[0] : '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        fullName: '',
        designation: '',
        aadhaarNumber: '',
        department: '',
        aepNumber: '',
        aepValidFrom: '',
        aepValidTo: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingStaff) {
        await entityAPI.updateStaff(editingStaff.id, formData);
        setSuccess('Staff updated successfully');
      } else {
        await entityAPI.createStaff(formData);
        setSuccess('Staff created successfully');
      }
      setIsModalOpen(false);
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save staff');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredStaff = staff.filter(s =>
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.aadhaarNumber?.includes(searchTerm)
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Staff</h1>
          <p className="text-slate-500 mt-1">Manage your staff members and their details</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="glass-button flex items-center gap-2"
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      {success && <Alert type="success" className="mb-4">{success}</Alert>}

      {/* Search Bar */}
      <div className="glass-panel p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search staff by name, designation, or Aadhaar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-12"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="glass-panel overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">
              {searchTerm ? 'No staff members match your search' : 'No staff members yet. Add your first staff member.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="p-4 text-left font-semibold text-slate-700">Name</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Designation</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Department</th>
                  <th className="p-4 text-left font-semibold text-slate-700">AEP Number</th>
                  <th className="p-4 text-left font-semibold text-slate-700">AEP Valid To</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Certificates</th>
                  <th className="p-4 text-center font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staffMember) => (
                  <tr
                    key={staffMember.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-900">{staffMember.fullName}</td>
                    <td className="p-4 text-slate-600">{staffMember.designation || '-'}</td>
                    <td className="p-4 text-slate-600">{staffMember.department || '-'}</td>
                    <td className="p-4 text-slate-600">{staffMember.aepNumber || '-'}</td>
                    <td className="p-4 text-slate-600">
                      {staffMember.aepValidTo ? formatDate(staffMember.aepValidTo) : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText size={16} className="text-slate-400" />
                        {staffMember.certificates?.length || 0}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenModal(staffMember)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff' : 'Add New Staff'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="glass-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Aadhaar Number *
              </label>
              <input
                type="text"
                required
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="glass-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                AEP Number
              </label>
              <input
                type="text"
                value={formData.aepNumber}
                onChange={(e) => setFormData({ ...formData, aepNumber: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                AEP Valid From
              </label>
              <input
                type="date"
                value={formData.aepValidFrom}
                onChange={(e) => setFormData({ ...formData, aepValidFrom: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                AEP Valid To
              </label>
              <input
                type="date"
                value={formData.aepValidTo}
                onChange={(e) => setFormData({ ...formData, aepValidTo: e.target.value })}
                className="glass-input w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-button"
            >
              {editingStaff ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EntityStaffPage;
