import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  Filter,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Users,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import { formatDate, getDaysUntilExpiry } from "../../utils/helpers";

const EntitiesPage = () => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    securityStatus: "",
    contractExpiry: "",
    qcpStatus: "",
  });

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    securityClearanceStatus: "",
    securityProgramStatus: "",
    qcpStatus: "",
    ascoName: "",
    ascoContactNo: "",
    ascoEmail: "",
    kialPocName: "",
    kialPocNumber: "",
    kialPocEmail: "",
  });

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const response = await adminAPI.getEntities();
      setEntities(response.data.data || []);
    } catch (err) {
      setError("Failed to load entities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Dynamic Filtering Logic ---
  const getContractExpiryStatus = (entity) => {
    if (!entity.contractValidTo) return null;
    const daysLeft = getDaysUntilExpiry(entity.contractValidTo);
    if (daysLeft === null) return null;
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 30) return "expiring";
    return "valid";
  };

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch =
      entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !filters.category || entity.category === filters.category;
    const matchesSecurityStatus =
      !filters.securityStatus ||
      entity.securityClearanceStatus === filters.securityStatus;
    const matchesQcpStatus =
      !filters.qcpStatus || entity.qcpStatus === filters.qcpStatus;

    let matchesContractExpiry = true;
    if (filters.contractExpiry) {
      const expiryStatus = getContractExpiryStatus(entity);
      if (filters.contractExpiry === "expiring")
        matchesContractExpiry = expiryStatus === "expiring";
      else if (filters.contractExpiry === "expired")
        matchesContractExpiry = expiryStatus === "expired";
      else if (filters.contractExpiry === "valid")
        matchesContractExpiry = expiryStatus === "valid";
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSecurityStatus &&
      matchesQcpStatus &&
      matchesContractExpiry
    );
  });

  const uniqueCategories = [
    ...new Set(entities.map((e) => e.category).filter(Boolean)),
  ];

  // --- Modal Handlers ---
  const handleOpenModal = (entity = null) => {
    if (entity) {
      setEditingEntity(entity);
      setFormData({
        name: entity.name || "",
        category: entity.category || "",
        securityClearanceStatus: entity.securityClearanceStatus || "",
        securityProgramStatus: entity.securityProgramStatus || "",
        qcpStatus: entity.qcpStatus || "",
        ascoName: entity.ascoName || "",
        ascoContactNo: entity.ascoContactNo || "",
        ascoEmail: entity.ascoEmail || "",
        kialPocName: entity.kialPocName || "",
        kialPocNumber: entity.kialPocNumber || "",
        kialPocEmail: entity.kialPocEmail || "",
      });
    } else {
      setEditingEntity(null);
      setFormData({
        name: "",
        category: "",
        securityClearanceStatus: "",
        securityProgramStatus: "",
        qcpStatus: "",
        ascoName: "",
        ascoContactNo: "",
        ascoEmail: "",
        kialPocName: "",
        kialPocNumber: "",
        kialPocEmail: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntity(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingEntity) {
        await adminAPI.updateEntity(editingEntity.id, formData);
        setSuccess("Entity updated successfully");
      } else {
        await adminAPI.createEntity(formData);
        setSuccess("Entity created successfully");
      }
      handleCloseModal();
      fetchEntities();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save entity");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this entity?")) return;

    try {
      await adminAPI.deleteEntity(id);
      setSuccess("Entity deleted successfully");
      fetchEntities();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete entity");
    }
  };

  const handleViewDetails = (entity) => {
    navigate(`/entities/${entity.id}`);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      securityStatus: "",
      contractExpiry: "",
      qcpStatus: "",
    });
    setSearchTerm("");
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="font-['Poppins'] text-slate-900 space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Entities Management
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Manage security agencies and contractors
          </p>
        </div>

        {/* Total Count & Add Button */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <Building2 size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-600">
              Total Entities:
            </span>
            <span className="text-sm font-bold text-slate-900">
              {entities.length}
            </span>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all"
          >
            <Plus size={18} /> Add Entity
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

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 transition-all duration-300">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 pl-12 pr-4 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                showFilters
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter size={18} />
              Filters
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full bg-slate-50 text-sm font-medium p-3 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-50 outline-none"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Security Status
                </label>
                <select
                  value={filters.securityStatus}
                  onChange={(e) =>
                    setFilters({ ...filters, securityStatus: e.target.value })
                  }
                  className="w-full bg-slate-50 text-sm font-medium p-3 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-50 outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Contract Expiry
                </label>
                <select
                  value={filters.contractExpiry}
                  onChange={(e) =>
                    setFilters({ ...filters, contractExpiry: e.target.value })
                  }
                  className="w-full bg-slate-50 text-sm font-medium p-3 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-50 outline-none"
                >
                  <option value="">All Contracts</option>
                  <option value="valid">Valid</option>
                  <option value="expiring">Expiring Soon (30 days)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  onClick={clearFilters}
                  className="w-full py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Entities Table */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[400px]">
        {filteredEntities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Building2 size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No entities found
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting search or adding a new entity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-6">
                    Entity Name
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ASCO
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Security Status
                  </th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-4 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEntities.map((entity) => {
                  const contractStatus = getContractExpiryStatus(entity);
                  return (
                    <tr
                      key={entity.id}
                      onClick={() => handleViewDetails(entity)}
                      className="group hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {/* Name */}
                      <td className="px-4 py-4 whitespace-nowrap pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
                            {entity.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {entity.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              ID: {entity.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                        {entity.category || "N/A"}
                      </td>

                      {/* ASCO */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                        {entity.ascoName || "N/A"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              entity.securityClearanceStatus === "Active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : entity.securityClearanceStatus === "Expired"
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                          >
                            {entity.securityClearanceStatus || "Unknown"}
                          </span>

                          {/* Contract Warning Indicators */}
                          {contractStatus === "expiring" && (
                            <span
                              className="p-1 bg-amber-50 text-amber-500 rounded-md"
                              title="Contract Expiring Soon"
                            >
                              <AlertTriangle size={14} />
                            </span>
                          )}
                          {contractStatus === "expired" && (
                            <span
                              className="p-1 bg-red-50 text-red-500 rounded-md"
                              title="Contract Expired"
                            >
                              <AlertTriangle size={14} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Staff Count */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                          <Users size={12} /> {entity.staffMembers?.length || 0}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap text-right pr-6">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleViewDetails(entity)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(entity);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(entity.id, e)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
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
      </div>

      {/* 4. Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEntity ? "Edit Entity" : "Add New Entity"}
      >
        <form onSubmit={handleSubmit} className="space-y-5 font-['Poppins']">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Entity Name *
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Category
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Security Agency"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <select
                className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                value={formData.securityClearanceStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    securityClearanceStatus: e.target.value,
                  })
                }
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              ASCO Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="ASCO Name"
                  className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                  value={formData.ascoName}
                  onChange={(e) =>
                    setFormData({ ...formData, ascoName: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Contact Number"
                  className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                  value={formData.ascoContactNo}
                  onChange={(e) =>
                    setFormData({ ...formData, ascoContactNo: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                  value={formData.ascoEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, ascoEmail: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              KIAL Point of Contact
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="POC Name"
                  className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                  value={formData.kialPocName}
                  onChange={(e) =>
                    setFormData({ ...formData, kialPocName: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Contact Number"
                  className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                  value={formData.kialPocNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, kialPocNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-slate-50 text-sm font-medium text-slate-900 p-3 rounded-xl border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                  value={formData.kialPocEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, kialPocEmail: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
            >
              {editingEntity ? "Update Entity" : "Create Entity"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EntitiesPage;
