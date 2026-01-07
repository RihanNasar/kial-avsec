import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { CheckCircle, X, Clock, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';

const ApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchApprovals();
  }, [activeTab]);

  const fetchApprovals = async () => {
    try {
      const response = activeTab === 'pending'
        ? await adminAPI.getPendingApprovals()
        : await adminAPI.getApprovalHistory();
      setApprovals(response.data.data || []);
    } catch (err) {
      setError('Failed to load approvals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, approve) => {
    try {
      const status = approve ? 'APPROVED' : 'REJECTED';
      await adminAPI.approveCertificate(id, { status });
      setSuccess(`Certificate ${approve ? 'approved' : 'rejected'} successfully`);
      setIsModalOpen(false);
      fetchApprovals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process approval');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openModal = (approval) => {
    setSelectedApproval(approval);
    setIsModalOpen(true);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Certificate Approvals</h1>
        <p className="text-slate-500 mt-1">Review and approve certificate renewal requests</p>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'pending' 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Pending Approvals
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'history' 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          History
        </button>
      </div>

      {/* Approvals Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificate Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Proposed Valid From</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Proposed Valid To</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {approvals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Clock size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">
                      {activeTab === 'pending' ? 'No pending approvals' : 'No approval history'}
                    </p>
                  </td>
                </tr>
              ) : (
                approvals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {approval.staff?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {approval.staff?.entity?.name || 'KIAL'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {approval.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(approval.proposedValidFrom)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(approval.proposedValidTo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={approval.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(approval)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {approval.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(approval.id, true)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleApprove(approval.id, false)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedApproval && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Certificate Details"
          footer={
            selectedApproval.status === 'PENDING' && (
              <div className="flex gap-3 justify-end w-full">
                <button
                  onClick={() => handleApprove(selectedApproval.id, false)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedApproval.id, true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
              </div>
            )
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Staff Member
                </label>
                <p className="text-sm font-medium text-slate-900">
                  {selectedApproval.staff?.fullName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Entity
                </label>
                <p className="text-sm font-medium text-slate-900">
                  {selectedApproval.staff?.entity?.name || 'KIAL Staff'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Certificate Type
                </label>
                <p className="text-sm font-medium text-slate-900">
                  {selectedApproval.type}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <div>
                  <StatusBadge status={selectedApproval.status} />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Current Validity
                  </label>
                  <p className="text-sm text-slate-600">
                    {formatDate(selectedApproval.validFrom)} - {formatDate(selectedApproval.validTo)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Proposed Validity
                  </label>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(selectedApproval.proposedValidFrom)} - {formatDate(selectedApproval.proposedValidTo)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApprovalsPage;
