import { useState } from 'react';
import { adminAPI } from '../../services/api';
import { Upload, FileSpreadsheet, Users, Building2, AlertCircle } from 'lucide-react';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';

const ImportDataPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importType, setImportType] = useState('entities');
  const [selectedFile, setSelectedFile] = useState(null);
  const [entityId, setEntityId] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please select an Excel file (.xlsx or .xls)');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    if (importType === 'entity-staff' && !entityId) {
      setError('Please enter an Entity ID for entity staff import');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      let response;
      if (importType === 'entities') {
        response = await adminAPI.importEntities(formData);
      } else if (importType === 'kial-staff') {
        response = await adminAPI.importKialStaff(formData);
      } else if (importType === 'entity-staff') {
        response = await adminAPI.importEntityStaff(entityId, formData);
      }

      setSuccess(response.data.message || 'Data imported successfully');
      setSelectedFile(null);
      setEntityId('');
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const importTypes = [
    {
      value: 'entities',
      label: 'Import Entities',
      icon: Building2,
      description: 'Import security agencies and contractors from Excel',
      requiresEntityId: false,
    },
    {
      value: 'kial-staff',
      label: 'Import KIAL Staff',
      icon: Users,
      description: 'Import KIAL staff members from Excel',
      requiresEntityId: false,
    },
    {
      value: 'entity-staff',
      label: 'Import Entity Staff',
      icon: Users,
      description: 'Import staff members for a specific entity from Excel',
      requiresEntityId: true,
    },
  ];

  const selectedImportType = importTypes.find(t => t.value === importType);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Import Data</h1>
        <p className="text-slate-500 mt-1">Bulk upload entities and staff from Excel files</p>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      {success && <Alert type="success" className="mb-4">{success}</Alert>}

      {/* Import Type Selection */}
      <div className="glass-panel p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Select Import Type</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {importTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = importType === type.value;
            
            return (
              <button
                key={type.value}
                onClick={() => setImportType(type.value)}
                className={`p-6 rounded-xl border-2 text-left transition-all duration-200 group ${
                  isSelected 
                    ? 'border-red-600 bg-red-50' 
                    : 'border-slate-200 bg-white hover:border-red-200 hover:bg-slate-50'
                }`}
              >
                <Icon
                  size={32}
                  className={`mb-4 transition-colors ${
                    isSelected ? 'text-red-600' : 'text-slate-400 group-hover:text-red-500'
                  }`}
                />
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {type.label}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Form */}
      <div className="glass-panel p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Upload File</h2>

        <form onSubmit={handleImport} className="space-y-6">
          {selectedImportType?.requiresEntityId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Entity ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="Enter the Entity ID"
                required
                className="glass-input w-full px-4 py-3"
              />
              <p className="text-xs text-slate-500 mt-2">
                You can find the Entity ID in the Entities page
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Excel File <span className="text-red-600">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Upload size={48} className="mx-auto text-slate-300 mb-4" />
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg cursor-pointer font-medium hover:bg-red-700 transition-colors mb-2"
              >
                Choose File
              </label>
              <p className="text-sm text-slate-600 mt-2">
                {selectedFile ? selectedFile.name : 'No file selected'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: .xlsx, .xls
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Important:</strong> Make sure your Excel file follows the correct format. 
              Invalid data will be skipped and errors will be reported.
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setEntityId('');
                document.getElementById('file-input').value = '';
                setError('');
                setSuccess('');
              }}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className={`px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 text-white transition-all ${
                loading || !selectedFile 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Importing...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={20} />
                  Import Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Instructions */}
      <div className="glass-panel p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Excel Format Guidelines</h2>
        <div className="text-sm text-slate-600 leading-relaxed space-y-4">
          <p>
            Ensure your Excel file contains the correct columns based on the import type:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Entities:</strong> Name, Category, Contract dates, ASCO details, etc.</li>
            <li><strong>KIAL Staff:</strong> Full Name, Designation, Department, Aadhaar, etc.</li>
            <li><strong>Entity Staff:</strong> Full Name, Designation, Aadhaar, AEP details, etc.</li>
          </ul>
          <p>
            Refer to the backend documentation for detailed column specifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportDataPage;
