import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Shield,
  CreditCard,
  User,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import {
  formatDate,
  getDaysUntilExpiry,
  getCertificateStatus,
} from "../../utils/helpers";

// Dynamic Badge Component based on status string
const StatusBadge = ({ status }) => {
  // Normalize status to lowercase for matching, then map to styles
  const getStyle = (s) => {
    const lower = s?.toLowerCase() || "";
    if (
      lower.includes("active") ||
      lower.includes("valid") ||
      lower.includes("approved")
    )
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (lower.includes("expir"))
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (lower.includes("pending"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (lower.includes("reject") || lower.includes("invalid"))
      return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getStyle(
        status
      )}`}
    >
      {status || "Unknown"}
    </span>
  );
};

const EntityDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Modal State
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certificateFormData, setCertificateFormData] = useState({
    type: "",
    validFrom: "",
    validTo: "",
    docUrl: "",
  });

  useEffect(() => {
    fetchEntityDetails();
  }, [id]);

  const fetchEntityDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getEntity(id);
      setEntity(response.data.data);
    } catch (err) {
      setError("Failed to load entity details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...certificateFormData,
        entityId: parseInt(id),
      };
      await adminAPI.createCertificate(data);
      setSuccess("Certificate added successfully");
      setCertificateModalOpen(false);
      setCertificateFormData({
        type: "",
        validFrom: "",
        validTo: "",
        docUrl: "",
      });
      fetchEntityDetails(); // Refresh data to show new cert
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add certificate");
      setTimeout(() => setError(""), 3000);
    }
  };

  // --- Real-time Calculations based on fetched data ---

  const entityCertStats = entity
    ? entity.certificates.reduce(
        (acc, cert) => {
          const days = getDaysUntilExpiry(cert.validTo);
          if (days === null) return acc;
          if (days < 0) acc.expired++;
          else if (days <= 30) acc.expiring++;
          else acc.valid++;
          return acc;
        },
        { valid: 0, expiring: 0, expired: 0 }
      )
    : { valid: 0, expiring: 0, expired: 0 };

  const staffCertStats = entity
    ? entity.staffMembers.reduce(
        (acc, staff) => {
          const staffCerts = staff.certificates || [];
          staffCerts.forEach((cert) => {
            const days = getDaysUntilExpiry(cert.validTo);
            if (days === null) return;
            if (days < 0) acc.expired++;
            else if (days <= 30) acc.expiring++;
            else acc.valid++;
          });
          return acc;
        },
        { valid: 0, expiring: 0, expired: 0 }
      )
    : { valid: 0, expiring: 0, expired: 0 };

  const totalExpiringIssues =
    entityCertStats.expiring +
    staffCertStats.expiring +
    entityCertStats.expired +
    staffCertStats.expired;

  if (loading) return <LoadingSpinner fullScreen />;

  if (!entity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center font-['Poppins']">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={32} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Entity not found</h2>
        <button
          onClick={() => navigate("/entities")}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg"
        >
          Back to Entities
        </button>
      </div>
    );
  }

  return (
    <div className="font-['Poppins'] text-slate-900 space-y-6">
      {/* 1. Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate("/entities")}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {entity.name}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-600 border border-slate-300">
              {entity.category || "General"}
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">
              ID: {entity.id}
            </span>
          </div>
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

      {/* 2. Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">
            {entity.staffMembers?.length || 0}
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Total Staff
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Shield size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">
            {entity.certificates?.length || 0}
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Entity Certs
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">
            {entity.staffMembers?.reduce(
              (sum, s) => sum + (s.certificates?.length || 0),
              0
            ) || 0}
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Staff Certs
          </p>
        </div>

        <div
          className={`rounded-[32px] p-6 shadow-sm border relative overflow-hidden group ${
            totalExpiringIssues > 0
              ? "bg-red-50 border-red-100"
              : "bg-white border-slate-100"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                totalExpiringIssues > 0
                  ? "bg-red-100 text-red-500"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <AlertTriangle size={20} />
            </div>
          </div>
          <h3
            className={`text-3xl font-bold mb-1 ${
              totalExpiringIssues > 0 ? "text-red-600" : "text-slate-900"
            }`}
          >
            {totalExpiringIssues}
          </h3>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              totalExpiringIssues > 0 ? "text-red-400" : "text-slate-400"
            }`}
          >
            Attention Needed
          </p>
        </div>
      </div>

      {/* 3. Tab Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-100 inline-flex shadow-sm overflow-x-auto max-w-full">
        {["Overview", "Entity Certificates", "Staff & Certificates"].map(
          (tab) => {
            let tabKey = "overview";
            if (tab.includes("Entity")) tabKey = "entity-certs";
            if (tab.includes("Staff")) tabKey = "staff";

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
          }
        )}
      </div>

      {/* 4. Tab Content */}

      {/* --- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left Panel: Entity Information */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-indigo-600" />
              Entity Information
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Clearance Status
                </span>
                <StatusBadge status={entity.securityClearanceStatus} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Program Status
                  </p>
                  <p
                    className="text-sm font-bold text-slate-900 truncate"
                    title={entity.securityProgramStatus}
                  >
                    {entity.securityProgramStatus || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    QCP Status
                  </p>
                  <p
                    className="text-sm font-bold text-slate-900 truncate"
                    title={entity.qcpStatus}
                  >
                    {entity.qcpStatus || "N/A"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Contract Period
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Calendar size={16} className="text-slate-400" />
                  <span>
                    {entity.contractValidFrom
                      ? formatDate(entity.contractValidFrom)
                      : "N/A"}
                  </span>
                  <span className="text-slate-400 font-normal mx-1">to</span>
                  <span>
                    {entity.contractValidTo
                      ? formatDate(entity.contractValidTo)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Contact & Compliance */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Phone size={20} className="text-emerald-600" />
                Contact Details
              </h3>

              <div className="space-y-4">
                {/* ASCO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                    ASCO (Security Officer)
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <User size={14} className="text-slate-400" />{" "}
                      {entity.ascoName || "N/A"}
                    </div>
                    {entity.ascoContactNo && (
                      <div className="flex items-center gap-2 text-slate-600 text-xs pl-6">
                        <Phone size={12} /> {entity.ascoContactNo}
                      </div>
                    )}
                    {entity.ascoEmail && (
                      <div className="flex items-center gap-2 text-slate-600 text-xs pl-6">
                        <Mail size={12} /> {entity.ascoEmail}
                      </div>
                    )}
                  </div>
                </div>

                {/* KIAL POC */}
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">
                    KIAL Point of Contact
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                      <User size={14} className="text-indigo-400" />{" "}
                      {entity.kialPocName || "N/A"}
                    </div>
                    {entity.kialPocNumber && (
                      <div className="flex items-center gap-2 text-indigo-700 text-xs pl-6">
                        <Phone size={12} /> {entity.kialPocNumber}
                      </div>
                    )}
                    {entity.kialPocEmail && (
                      <div className="flex items-center gap-2 text-indigo-700 text-xs pl-6">
                        <Mail size={12} /> {entity.kialPocEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Combined Compliance Stats */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Certificate Health
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="block text-xs text-slate-500 font-medium mb-1">
                    Entity Valid
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    {entityCertStats.valid}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="block text-xs text-slate-500 font-medium mb-1">
                    Staff Valid
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    {staffCertStats.valid}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ENTITY CERTIFICATES TAB --- */}
      {activeTab === "entity-certs" && (
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">
              Entity Certificates
            </h3>
            <button
              onClick={() => setCertificateModalOpen(true)}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Add Certificate
            </button>
          </div>

          {entity.certificates && entity.certificates.length > 0 ? (
            <div className="space-y-4">
              {entity.certificates.map((cert) => {
                const days = getDaysUntilExpiry(cert.validTo);
                const status = getCertificateStatus(
                  cert.validFrom,
                  cert.validTo
                );

                return (
                  <div
                    key={cert.id}
                    className="group p-5 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {cert.type}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <Calendar size={14} />
                              {formatDate(cert.validFrom)} -{" "}
                              {formatDate(cert.validTo)}
                            </div>
                            {days !== null && days >= 0 && days <= 30 && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                Expiring in {days} days
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <StatusBadge status={status} />
                        {cert.docUrl && (
                          <a
                            href={cert.docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Document"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <FileText size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">
                No certificates uploaded yet.
              </p>
              <button
                onClick={() => setCertificateModalOpen(true)}
                className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
              >
                Add First Certificate
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- STAFF TAB --- */}
      {activeTab === "staff" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {entity.staffMembers && entity.staffMembers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {entity.staffMembers.map((staff) => {
                // Calculate dynamic stats for this specific staff member
                const certStats = (staff.certificates || []).reduce(
                  (acc, cert) => {
                    const days = getDaysUntilExpiry(cert.validTo);
                    if (days === null) return acc;
                    if (days < 0) acc.expired++;
                    else if (days <= 30) acc.expiring++;
                    else acc.valid++;
                    return acc;
                  },
                  { valid: 0, expiring: 0, expired: 0 }
                );

                return (
                  <div
                    key={staff.id}
                    className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden"
                  >
                    {/* Staff Header Row */}
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg border border-slate-200">
                          {staff.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">
                            {staff.fullName}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="font-medium text-indigo-600">
                              {staff.designation || "No designation"}
                            </span>
                            {staff.aadhaarNumber && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500">
                                ID: {staff.aadhaarNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Individual Stats Pills */}
                      <div className="flex gap-3">
                        <div className="px-4 py-2 bg-emerald-50 rounded-xl text-center min-w-[80px] border border-emerald-100">
                          <span className="block text-xl font-bold text-emerald-700 leading-none">
                            {certStats.valid}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">
                            Valid
                          </span>
                        </div>
                        <div className="px-4 py-2 bg-amber-50 rounded-xl text-center min-w-[80px] border border-amber-100">
                          <span className="block text-xl font-bold text-amber-700 leading-none">
                            {certStats.expiring}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase">
                            Expiring
                          </span>
                        </div>
                        <div className="px-4 py-2 bg-red-50 rounded-xl text-center min-w-[80px] border border-red-100">
                          <span className="block text-xl font-bold text-red-700 leading-none">
                            {certStats.expired}
                          </span>
                          <span className="text-[10px] font-bold text-red-600 uppercase">
                            Expired
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Staff Certificates List */}
                    <div className="p-6 bg-slate-50/50">
                      {staff.certificates && staff.certificates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {staff.certificates.map((cert) => {
                            const status = getCertificateStatus(
                              cert.validFrom,
                              cert.validTo
                            );
                            return (
                              <div
                                key={cert.id}
                                className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                                    <FileText size={16} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">
                                      {cert.type}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                      Exp: {formatDate(cert.validTo)}
                                    </p>
                                  </div>
                                </div>
                                <StatusBadge status={status} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-slate-400 italic py-2">
                          No certificates found.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-slate-100">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">
                No Staff Members
              </h3>
              <p className="text-slate-500">
                There are no staff members associated with this entity yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. Add Certificate Modal */}
      <Modal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        title="Add Entity Certificate"
      >
        <form
          onSubmit={handleAddCertificate}
          className="space-y-5 font-['Poppins']"
        >
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Certificate Type *
            </label>
            <input
              type="text"
              required
              value={certificateFormData.type}
              onChange={(e) =>
                setCertificateFormData({
                  ...certificateFormData,
                  type: e.target.value,
                })
              }
              className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
              placeholder="e.g., Security Clearance, QCP Certificate"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Valid From *
              </label>
              <input
                type="date"
                required
                value={certificateFormData.validFrom}
                onChange={(e) =>
                  setCertificateFormData({
                    ...certificateFormData,
                    validFrom: e.target.value,
                  })
                }
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Valid To *
              </label>
              <input
                type="date"
                required
                value={certificateFormData.validTo}
                onChange={(e) =>
                  setCertificateFormData({
                    ...certificateFormData,
                    validTo: e.target.value,
                  })
                }
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Document URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={certificateFormData.docUrl}
                onChange={(e) =>
                  setCertificateFormData({
                    ...certificateFormData,
                    docUrl: e.target.value,
                  })
                }
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 pl-10 pr-3 py-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                placeholder="https://example.com/certificate.pdf"
              />
              <CreditCard
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setCertificateModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
            >
              Add Certificate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EntityDetailsPage;
