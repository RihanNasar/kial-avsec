import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  ExternalLink,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import Alert from "./Alert";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import {
  formatDate,
  getCertificateStatus,
  getDaysUntilExpiry,
} from "../utils/helpers";

const CertificatesPage = ({
  title,
  description,
  fetchCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  staffList = null,
  showStaffColumn = false,
}) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [formData, setFormData] = useState({
    type: "AVSEC",
    validFrom: "",
    validTo: "",
    docUrl: "",
    staffId: "",
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const response = await fetchCertificates();
      setCertificates(response.data.data || []);
    } catch (err) {
      setError("Failed to load certificates");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleOpenModal = (cert = null) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        type: cert.type || "AVSEC",
        validFrom: cert.validFrom?.split("T")[0] || "",
        validTo: cert.validTo?.split("T")[0] || "",
        docUrl: cert.docUrl || "",
        staffId: cert.staffId || "",
      });
    } else {
      setEditingCert(null);
      setFormData({
        type: "AVSEC",
        validFrom: "",
        validTo: "",
        docUrl: "",
        staffId: staffList && staffList.length > 0 ? staffList[0].id : "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const submitData = { ...formData };
      if (staffList) {
        submitData.staffId = parseInt(formData.staffId);
      }

      if (editingCert) {
        await updateCertificate(editingCert.id, submitData);
        setSuccess("Certificate updated successfully");
      } else {
        await createCertificate(submitData);
        setSuccess("Certificate created successfully");
      }
      handleCloseModal();
      loadCertificates();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save certificate");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      await deleteCertificate(id);
      setSuccess("Certificate deleted successfully");
      loadCertificates();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete certificate");
    }
  };

  // --- Filtering ---
  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.staff?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate quick stats for header
  const totalCerts = certificates.length;
  const expiringCerts = certificates.filter((c) => {
    const days = getDaysUntilExpiry(c.validTo);
    return days !== null && days <= 30 && days >= 0;
  }).length;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="font-['Poppins'] text-slate-900 space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Stat: Expiring */}
          {expiringCerts > 0 && (
            <div className="bg-red-50 px-4 py-2.5 rounded-2xl border border-red-100 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-xs font-bold text-red-700">
                {expiringCerts} Expiring
              </span>
            </div>
          )}

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Add Certificate
          </button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert type="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* 2. Search Bar */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
        <div className="relative max-w-lg">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            className="w-full bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 pl-12 pr-4 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-red-100 focus:ring-2 focus:ring-red-50 outline-none transition-all"
            placeholder="Search by certificate type or staff name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Certificates Table */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[400px]">
        {filteredCertificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No certificates found
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Get started by adding a new certificate."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {showStaffColumn && (
                    <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-6">
                      Staff Member
                    </th>
                  )}
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Validity Period
                  </th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCertificates.map((cert) => {
                  const status = getCertificateStatus(
                    cert.validFrom,
                    cert.validTo
                  );
                  const daysLeft = getDaysUntilExpiry(cert.validTo);

                  return (
                    <tr
                      key={cert.id}
                      className="group hover:bg-red-50/30 transition-colors"
                    >
                      {/* Staff Column */}
                      {showStaffColumn && (
                        <td className="px-4 py-4 whitespace-nowrap pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200">
                              {cert.staff?.fullName?.charAt(0) || (
                                <User size={14} />
                              )}
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                              {cert.staff?.fullName || "N/A"}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Type Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm text-red-600">
                            <FileText size={14} />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {cert.type}
                          </span>
                        </div>
                      </td>

                      {/* Validity Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            <Calendar size={12} className="text-slate-400" />
                            {formatDate(cert.validFrom)} -{" "}
                            {formatDate(cert.validTo)}
                          </div>
                          {daysLeft !== null &&
                            daysLeft <= 30 &&
                            daysLeft >= 0 && (
                              <span className="text-[10px] font-bold text-red-500 mt-0.5">
                                Expires in {daysLeft} days
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-4 whitespace-nowrap text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {cert.docUrl && (
                            <a
                              href={cert.docUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="View Document"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenModal(cert)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cert.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        {filteredCertificates.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Showing {filteredCertificates.length} certificates</span>
            <span>Total: {totalCerts}</span>
          </div>
        )}
      </div>

      {/* 4. Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCert ? "Edit Certificate" : "Add New Certificate"}
      >
        <form onSubmit={handleSubmit} className="space-y-5 font-['Poppins']">
          {/* Staff Select (If applicable) */}
          {staffList && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Staff Member *
              </label>
              <select
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-red-100 focus:ring-2 focus:ring-red-50 outline-none transition-all"
                value={formData.staffId}
                onChange={(e) =>
                  setFormData({ ...formData, staffId: e.target.value })
                }
                required
              >
                <option value="">Select Staff</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Certificate Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Certificate Type *
            </label>
            <select
              className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-red-100 focus:ring-2 focus:ring-red-50 outline-none transition-all"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              required
            >
              <option value="AVSEC">AVSEC Training</option>
              <option value="PCC">Police Clearance Certificate</option>
              <option value="BCAS">BCAS Clearance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Valid From *
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-red-100 focus:ring-2 focus:ring-red-50 outline-none transition-all"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Valid To *
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-red-100 focus:ring-2 focus:ring-red-50 outline-none transition-all"
                value={formData.validTo}
                onChange={(e) =>
                  setFormData({ ...formData, validTo: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Document URL */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Document URL
            </label>
            <input
              type="url"
              className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-red-100 focus:ring-2 focus:ring-red-50 outline-none transition-all"
              value={formData.docUrl}
              onChange={(e) =>
                setFormData({ ...formData, docUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
            >
              {editingCert ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CertificatesPage;
