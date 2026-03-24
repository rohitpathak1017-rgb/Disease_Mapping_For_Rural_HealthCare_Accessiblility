import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import useFetch from "../../hooks/useFetch.js";
import { getAllWorkers, createHealthWorker, deleteWorker } from "../../services/admin.service.js";

// ── Initial Form State ────────────────────────────────────────────────────────
const initForm = { name: "", email: "", password: "", phone: "", qualification: "", employeeId: "" };

// ─────────────────────────────────────────────────────────────────────────────
const ManageWorkers = () => {
  const { data: workers, loading, error, refetch } = useFetch(getAllWorkers);

  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState(initForm);
  const [formError,  setFormError]  = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteId,      setDeleteId]      = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Form ──────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setFormError("Name, email and password are required");
      return;
    }
    setSubmitting(true);
    try {
      await createHealthWorker(formData);
      setFormData(initForm);
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create worker");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteWorker(deleteId);
      setDeleteId(null);
      refetch();
    } catch {
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
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
              <h1 className="text-2xl font-bold text-gray-800">Health Workers</h1>
              <p className="text-gray-500 text-sm mt-1">Manage all health workers</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {showForm ? "Cancel" : "+ Add Worker"}
            </button>
          </div>

          {/* Add Worker Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Health Worker</h2>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "name",          label: "Full Name",      type: "text",     required: true  },
                  { name: "email",         label: "Email",          type: "email",    required: true  },
                  { name: "password",      label: "Password",       type: "password", required: true  },
                  { name: "phone",         label: "Phone",          type: "tel",      required: false },
                  { name: "qualification", label: "Qualification",  type: "text",     required: false },
                  { name: "employeeId",    label: "Employee ID",    type: "text",     required: false },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {submitting ? "Creating..." : "Create Worker"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workers List */}
          {loading && <LoadingSpinner fullScreen={false} />}
          {error   && <ErrorMessage message={error} onRetry={refetch} />}

          {workers && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {workers.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">No health workers found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Name", "Email", "Phone", "Qualification", "Assigned Village", "Status", "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {workers.map((w) => (
                      <tr key={w._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{w.name}</td>
                        <td className="px-4 py-3 text-gray-600">{w.email}</td>
                        <td className="px-4 py-3 text-gray-600">{w.phone || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{w.qualification || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {w.assignedVillage ? (
                            <span className="text-green-600 font-medium">
                              {w.assignedVillage.villageName}
                            </span>
                          ) : (
                            <span className="text-orange-500">Not Assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${w.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {w.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDeleteId(w._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Deactivate Worker"
        message="This will deactivate the health worker and unassign them from their village."
        confirmText="Deactivate"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ManageWorkers;