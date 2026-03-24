import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import useFetch from "../../hooks/useFetch.js";
import { getAllDiseases, createDisease, deleteDisease } from "../../services/admin.service.js";
import { DISEASE_CATEGORIES, SEVERITY_LEVELS } from "../../utils/constants.js";
import { getSeverityColor } from "../../utils/helpers.js";

const initForm = {
  name: "", category: "Other", severity: "Medium",
  description: "", symptoms: "", preventionTips: "",
};

const ManageDiseases = () => {
  const { data: diseases, loading, error, refetch } = useFetch(getAllDiseases);

  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState(initForm);
  const [formError,  setFormError]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteLoad, setDeleteLoad] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      setFormError("Name and category are required");
      return;
    }
    setSubmitting(true);
    try {
      await createDisease({
        ...formData,
        symptoms:      formData.symptoms.split(",").map((s) => s.trim()).filter(Boolean),
        preventionTips: formData.preventionTips.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setFormData(initForm);
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create disease");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoad(true);
    try {
      await deleteDisease(deleteId);
      setDeleteId(null);
      refetch();
    } catch {
      setDeleteId(null);
    } finally {
      setDeleteLoad(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Diseases</h1>
              <p className="text-gray-500 text-sm mt-1">Master list of diseases</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {showForm ? "Cancel" : "+ Add Disease"}
            </button>
          </div>

          {/* Add Disease Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Disease</h2>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disease Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g. Malaria"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category" value={formData.category} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DISEASE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    name="severity" value={formData.severity} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SEVERITY_LEVELS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text" name="description" value={formData.description} onChange={handleChange}
                    placeholder="Short description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms <span className="text-gray-400 font-normal">(comma separated)</span>
                  </label>
                  <input
                    type="text" name="symptoms" value={formData.symptoms} onChange={handleChange}
                    placeholder="Fever, Chills, Headache"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prevention Tips <span className="text-gray-400 font-normal">(comma separated)</span>
                  </label>
                  <input
                    type="text" name="preventionTips" value={formData.preventionTips} onChange={handleChange}
                    placeholder="Use nets, Remove water"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit" disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {submitting ? "Adding..." : "Add Disease"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Disease List */}
          {loading && <LoadingSpinner fullScreen={false} />}
          {error   && <ErrorMessage message={error} onRetry={refetch} />}

          {diseases && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {diseases.length === 0 ? (
                <p className="text-gray-500 text-sm col-span-3 text-center py-10">No diseases found</p>
              ) : (
                diseases.map((d) => (
                  <div key={d._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{d.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${getSeverityColor(d.severity)}-100 text-${getSeverityColor(d.severity)}-700`}>
                        {d.severity}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 font-medium mb-2">{d.category}</p>
                    {d.symptoms?.length > 0 && (
                      <p className="text-xs text-gray-500 mb-3">
                        <span className="font-medium">Symptoms:</span> {d.symptoms.slice(0, 3).join(", ")}
                        {d.symptoms.length > 3 && "..."}
                      </p>
                    )}
                    <button
                      onClick={() => setDeleteId(d._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </main>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Disease"
        message="This will remove the disease from the master list."
        confirmText="Delete"
        isDanger={true}
        isLoading={deleteLoad}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ManageDiseases;