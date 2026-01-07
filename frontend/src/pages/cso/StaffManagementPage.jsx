import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  Trash2,
  Search,
  Users,
  Building2,
  FileText,
  Filter,
  User,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";
import { formatDate } from "../../utils/helpers";

const StaffManagementPage = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await adminAPI.getStaff();
      setStaff(response.data.data || []);
    } catch (err) {
      setError("Failed to load staff");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    // Prevent the row click event (opening modal) when clicking delete
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    try {
      await adminAPI.deleteStaff(id);
      setSuccess("Staff member deleted successfully");
      fetchStaff();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete staff member");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleViewDetails = (staffMember) => {
    navigate(`/staff/${staffMember.id}`);
  };

  // Filter Logic
  const filteredStaff = staff.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.aadhaarNumber?.includes(searchTerm)
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="font-['Poppins'] text-slate-900 space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Staff Management
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Manage personnel across all entities
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
          <Users size={16} className="text-indigo-500" />
          <span className="text-xs font-bold text-slate-600">Total Staff:</span>
          <span className="text-sm font-bold text-slate-900">
            {staff.length}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert type="success" className="mb-4">
          {success}
        </Alert>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              className="w-full bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 pl-12 pr-4 py-3.5 rounded-2xl border border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              placeholder="Search by name, designation, entity, or Aadhaar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Staff Table Container */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[400px]">
        {filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No staff found</h3>
            <p className="text-sm text-slate-400 mt-1">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : "Get started by adding staff members"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    AEP Details
                  </th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((staffMember) => (
                  <tr
                    key={staffMember.id}
                    onClick={() => handleViewDetails(staffMember)}
                    className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {/* Name Column with Avatar */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-100">
                          {staffMember.fullName?.charAt(0) || (
                            <User size={18} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {staffMember.fullName}
                          </div>
                          <div className="text-[11px] font-medium text-slate-500">
                            {staffMember.isKialStaff
                              ? "KIAL Staff"
                              : "Contract Staff"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-600">
                        {staffMember.designation || "-"}
                      </span>
                    </td>

                    {/* Entity Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
                          <Building2 size={12} />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {staffMember.entity?.name || "-"}
                        </span>
                      </div>
                    </td>

                    {/* AEP Details */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {staffMember.aepNumber || "No AEP"}
                        </span>
                        {staffMember.aepValidTo && (
                          <span className="text-[10px] text-slate-400">
                            Exp: {formatDate(staffMember.aepValidTo)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Certificate Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                        <FileText size={12} className="text-slate-500" />
                        <span className="text-xs font-bold text-slate-600">
                          {staffMember.certificates?.length || 0} Certs
                        </span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => handleDelete(staffMember.id, e)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Staff"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagementPage;
