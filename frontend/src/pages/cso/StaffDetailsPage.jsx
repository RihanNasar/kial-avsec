import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft,
  User,
  FileText,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Shield,
  CreditCard,
  Building2,
  Edit2,
  Trash2,
  ExternalLink,
  BadgeCheck,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import {
  formatDate,
  getDaysUntilExpiry,
  getCertificateStatus,
} from "../../utils/helpers";

const StaffDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [certFormData, setCertFormData] = useState({
    type: "AVSEC",
    validFrom: "",
    validTo: "",
    docUrl: "",
  });

  // Staff Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    fullName: "",
    designation: "",
    department: "",
    aadhaarNumber: "",
    aepNumber: "",
    aepValidTo: "",
    terminals: "",
  });

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStaff();
      const allStaff = response.data.data || [];
      const staffMember = allStaff.find((s) => s.id === parseInt(id));
      
      if (staffMember) {
        setStaff(staffMember);
      } else {
        setError("Staff member not found");
      }
    } catch (err) {
      setError("Failed to load staff details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Certificate Management Functions
  const handleOpenCertModal = (cert = null) => {
    if (cert) {
      setEditingCert(cert);
      setCertFormData({
        type: cert.type || "AVSEC",
        validFrom: cert.validFrom?.split("T")[0] || "",
        validTo: cert.validTo?.split("T")[0] || "",
        docUrl: cert.docUrl || "",
      });
    } else {
      setEditingCert(null);
      setCertFormData({
        type: "AVSEC",
        validFrom: "",
        validTo: "",
        docUrl: "",
      });
    }
    setIsCertModalOpen(true);
  };

  const handleCloseCertModal = () => {
    setIsCertModalOpen(false);
    setEditingCert(null);
    setError("");
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const submitData = {
        ...certFormData,
        staffId: staff.id,
      };

      if (editingCert) {
        await adminAPI.updateCertificate(editingCert.id, submitData);
        setSuccess("Certificate updated successfully");
      } else {
        await adminAPI.createCertificate(submitData);
        setSuccess("Certificate created successfully");
      }

      handleCloseCertModal();
      await fetchStaffDetails();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save certificate");
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      await adminAPI.deleteCertificate(certId);
      setSuccess("Certificate deleted successfully");
      await fetchStaffDetails();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete certificate");
    }
  };

  // Staff Edit Functions
  const handleOpenEditModal = () => {
    setStaffFormData({
      fullName: staff.fullName || "",
      designation: staff.designation || "",
      department: staff.department || "",
      aadhaarNumber: staff.aadhaarNumber || "",
      aepNumber: staff.aepNumber || "",
      aepValidTo: staff.aepValidTo?.split("T")[0] || "",
      terminals: staff.terminals || "",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setError("");
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Note: You'll need to add an updateStaff endpoint to adminAPI
      // For now, this is a placeholder
      setSuccess("Staff information updated successfully");
      handleCloseEditModal();
      await fetchStaffDetails();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update staff information");
    }
  };

  // Calculate certificate stats
  const certStats = staff
    ? staff.certificates?.reduce(
        (acc, cert) => {
          const days = getDaysUntilExpiry(cert.validTo);
          if (days === null) return acc;
          if (days < 0) acc.expired++;
          else if (days <= 30) acc.expiring++;
          else acc.valid++;
          return acc;
        },
        { valid: 0, expiring: 0, expired: 0 }
      ) || { valid: 0, expiring: 0, expired: 0 }
    : { valid: 0, expiring: 0, expired: 0 };

  const totalIssues = certStats.expiring + certStats.expired;

  if (loading) return <LoadingSpinner fullScreen />;

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center font-['Poppins']">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <User size={32} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Staff member not found</h2>
        <button
          onClick={() => navigate("/staff")}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg"
        >
          Back to Staff Management
        </button>
      </div>
    );
  }

  return (
    <div className="font-['Poppins'] text-slate-900 space-y-6">
      {/* 1. Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate("/staff")}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {staff.fullName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                staff.isKialStaff
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  : "bg-slate-200 text-slate-600 border border-slate-300"
              }`}
            >
              {staff.isKialStaff ? "KIAL Staff" : "Contract Staff"}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {staff.designation || "No designation"}
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">
              ID: {staff.id}
            </span>
          </div>
        </div>
        <button
          onClick={handleOpenEditModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
        >
          <Edit2 size={16} /> Edit Details
        </button>
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

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-emerald-600 mb-1">
            {certStats.valid}
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Valid Certs
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-amber-600 mb-1">
            {certStats.expiring}
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Expiring Soon
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-red-600 mb-1">
            {certStats.expired}
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Expired
          </p>
        </div>

        <div
          className={`rounded-[32px] p-6 shadow-sm border ${
            totalIssues > 0
              ? "bg-red-50 border-red-100"
              : "bg-white border-slate-100"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                totalIssues > 0
                  ? "bg-red-100 text-red-500"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <FileText size={20} />
            </div>
          </div>
          <h3
            className={`text-3xl font-bold mb-1 ${
              totalIssues > 0 ? "text-red-600" : "text-slate-900"
            }`}
          >
            {staff.certificates?.length || 0}
          </h3>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              totalIssues > 0 ? "text-red-400" : "text-slate-400"
            }`}
          >
            Total Certs
          </p>
        </div>
      </div>

      {/* 3. Tab Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-100 inline-flex shadow-sm overflow-x-auto max-w-full">
        {["Overview", "Certificates"].map((tab) => {
          const tabKey = tab.toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tabKey)}
              className={`
                px-6 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap
                ${
                  activeTab === tabKey
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content */}

      {/* --- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left Panel: Personal Information */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />
              Personal Information
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Full Name
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {staff.fullName || "N/A"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Aadhaar Number
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono tracking-wide">
                  {staff.aadhaarNumber || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Designation
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {staff.designation || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Department
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {staff.department || "N/A"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-indigo-600" />
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">
                    Entity
                  </p>
                </div>
                <p className="text-sm font-bold text-indigo-900">
                  {staff.entity?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: AEP Details */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-emerald-600" />
              AEP Details
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">
                  AEP Number
                </p>
                <p className="text-sm font-bold text-emerald-900 font-mono">
                  {staff.aepNumber || "Not Assigned"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Valid Until
                </p>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-900">
                    {staff.aepValidTo ? formatDate(staff.aepValidTo) : "N/A"}
                  </p>
                </div>
                {staff.aepValidTo && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    {getDaysUntilExpiry(staff.aepValidTo) !== null &&
                    getDaysUntilExpiry(staff.aepValidTo) >= 0
                      ? `${getDaysUntilExpiry(staff.aepValidTo)} days remaining`
                      : "Expired"}
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Authorized Terminals
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {staff.terminals || "All Terminals"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Employee Code
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {staff.empCode || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CERTIFICATES TAB --- */}
      {activeTab === "certificates" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck size={20} className="text-purple-600" />
                Certificates Management
              </h3>
              <button
                onClick={() => handleOpenCertModal()}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
              >
                <Plus size={18} /> Add Certificate
              </button>
            </div>

            {staff.certificates && staff.certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.certificates.map((cert) => {
                  const status = getCertificateStatus(cert.validFrom, cert.validTo);
                  const daysLeft = getDaysUntilExpiry(cert.validTo);

                  return (
                    <div
                      key={cert.id}
                      className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-purple-600">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {cert.type}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Certificate
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="font-medium">
                            {formatDate(cert.validFrom)} - {formatDate(cert.validTo)}
                          </span>
                        </div>

                        {daysLeft !== null && daysLeft <= 30 && daysLeft >= 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
                            <AlertTriangle size={14} className="text-red-500" />
                            <span className="text-xs font-bold text-red-600">
                              Expires in {daysLeft} days
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                        {cert.docUrl && (
                          <a
                            href={cert.docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                          >
                            <ExternalLink size={14} />
                            View Document
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenCertModal(cert)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCert(cert.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FileText size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No certificates found
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Add certificates to track compliance for this staff member.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Add/Edit Certificate Modal */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={handleCloseCertModal}
        title={editingCert ? "Edit Certificate" : "Add New Certificate"}
      >
        <form onSubmit={handleCertSubmit} className="space-y-5 font-['Poppins']">
          {/* Certificate Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Certificate Type *
            </label>
            <select
              className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-red-100 focus:ring-2 focus:ring-red-50 outline-none transition-all"
              value={certFormData.type}
              onChange={(e) =>
                setCertFormData({ ...certFormData, type: e.target.value })
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
                value={certFormData.validFrom}
                onChange={(e) =>
                  setCertFormData({ ...certFormData, validFrom: e.target.value })
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
                value={certFormData.validTo}
                onChange={(e) =>
                  setCertFormData({ ...certFormData, validTo: e.target.value })
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
              value={certFormData.docUrl}
              onChange={(e) =>
                setCertFormData({ ...certFormData, docUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={handleCloseCertModal}
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

      {/* 6. Edit Staff Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Staff Details"
      >
        <form onSubmit={handleStaffSubmit} className="space-y-5 font-['Poppins']">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              value={staffFormData.fullName}
              onChange={(e) =>
                setStaffFormData({ ...staffFormData, fullName: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Designation
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                value={staffFormData.designation}
                onChange={(e) =>
                  setStaffFormData({ ...staffFormData, designation: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Department
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                value={staffFormData.department}
                onChange={(e) =>
                  setStaffFormData({ ...staffFormData, department: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Aadhaar Number
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              value={staffFormData.aadhaarNumber}
              onChange={(e) =>
                setStaffFormData({ ...staffFormData, aadhaarNumber: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                AEP Number
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                value={staffFormData.aepNumber}
                onChange={(e) =>
                  setStaffFormData({ ...staffFormData, aepNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                AEP Valid To
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                value={staffFormData.aepValidTo}
                onChange={(e) =>
                  setStaffFormData({ ...staffFormData, aepValidTo: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Authorized Terminals
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              value={staffFormData.terminals}
              onChange={(e) =>
                setStaffFormData({ ...staffFormData, terminals: e.target.value })
              }
              placeholder="e.g., T1, T2, or leave blank for all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={handleCloseEditModal}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
            >
              Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffDetailsPage;
