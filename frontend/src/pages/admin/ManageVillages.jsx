import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import useFetch from "../../hooks/useFetch.js";
import { getAllVillages, createVillage, deleteVillage } from "../../services/admin.service.js";

const initForm = { state: "", district: "", subdistrict: "", villageName: "", pincode: "", population: "" };

const ManageVillages = () => {
  const { data: villages, loading, error, refetch } = useFetch(getAllVillages);

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
    if (!formData.state || !formData.district || !formData.subdistrict || !formData.villageName) {
      setFormError("State, District, Subdistrict and Village Name are required");
      return;
    }
    setSubmitting(true);
    try {
      await createVillage(formData);
      setFormData(initForm);
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create village");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoad(true);
    try {
      await deleteVillage(deleteId);
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
              <h1 className="text-2xl font-bold text-gray-800">Villages</h1>
              <p className="text-gray-500 text-sm mt-1">Manage all registered villages</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {showForm ? "Cancel" : "+ Add Village"}
            </button>
          </div>

          {/* Add Village Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Village</h2>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "state",       label: "State",            required: true  },
                  { name: "district",    label: "District",         required: true  },
                  { name: "subdistrict", label: "Subdistrict/Block",required: true  },
                  { name: "villageName", label: "Village Name",     required: true  },
                  { name: "pincode",     label: "Pincode",          required: false },
                  { name: "population",  label: "Population",       required: false },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.name === "population" ? "number" : "text"}
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
                    {submitting ? "Adding..." : "Add Village"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Villages List */}
          {loading && <LoadingSpinner fullScreen={false} />}
          {error   && <ErrorMessage message={error} onRetry={refetch} />}

          {villages && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {villages.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">No villages found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Village", "Subdistrict", "District", "State", "Population", "Worker", "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {villages.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{v.villageName}</td>
                        <td className="px-4 py-3 text-gray-600">{v.subdistrict}</td>
                        <td className="px-4 py-3 text-gray-600">{v.district}</td>
                        <td className="px-4 py-3 text-gray-600">{v.state}</td>
                        <td className="px-4 py-3 text-gray-600">{v.population || "—"}</td>
                        <td className="px-4 py-3">
                          {v.assignedHealthWorker ? (
                            <span className="text-green-600 font-medium">
                              {v.assignedHealthWorker.name}
                            </span>
                          ) : (
                            <span className="text-orange-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDeleteId(v._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Delete
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

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Village"
        message="This will permanently delete the village record."
        confirmText="Delete"
        isDanger={true}
        isLoading={deleteLoad}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ManageVillages;