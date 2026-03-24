/* eslint-disable no-unused-vars */
import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import useFetch from "../../hooks/useFetch.js";
import useAuth from "../../hooks/useAuth.js";
import { getAllCamps, createCamp, updateCamp, deleteCamp } from "../../services/camp.service.js";
import { getAllDiseases } from "../../services/admin.service.js";
import { formatDate, getCampStatusColor } from "../../utils/helpers.js";
import { CAMP_STATUS } from "../../utils/constants.js";

const initForm = {
  campName: "", campDate: "", startTime: "", endTime: "",
  servicesOffered: "", targetedDiseases: [], activitiesDone: "", notes: "",
};

const CampManagement = () => {
  const { user } = useAuth();
  const { data: camps,    loading: cLoading, error: cError, refetch } = useFetch(getAllCamps);
  const { data: diseases, loading: dLoading }                          = useFetch(getAllDiseases);

  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState(initForm);
  const [formError,  setFormError]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteLoad, setDeleteLoad] = useState(false);

  const villageId = user?.assignedVillage?._id || user?.assignedVillage;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleDiseaseToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      targetedDiseases: prev.targetedDiseases.includes(id)
        ? prev.targetedDiseases.filter((d) => d !== id)
        : [...prev.targetedDiseases, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.campName || !formData.campDate) {
      setFormError("Camp name and date are required");
      return;
    }
    if (!villageId) {
      setFormError("You are not assigned to any village");
      return;
    }
    setSubmitting(true);
    try {
      await createCamp({
        ...formData,
        villageId,
        servicesOffered: formData.servicesOffered.split(",").map((s) => s.trim()).filter(Boolean),
        activitiesDone:  formData.activitiesDone
          ? [{ activityName: formData.activitiesDone, description: "" }]
          : [],
      });
      setFormData(initForm);
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create camp");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (campId, status) => {
    try {
      await updateCamp(campId, { status });
      refetch();
    } catch { /* empty */ }
  };

  const handleDelete = async () => {
    setDeleteLoad(true);
    try {
      await deleteCamp(deleteId);
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
              <h1 className="text-2xl font-bold text-gray-800">Camp Management</h1>
              <p className="text-gray-500 text-sm mt-1">Manage health camps for your village</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {showForm ? "Cancel" : "+ Create Camp"}
            </button>
          </div>

          {/* Create Camp Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Camp</h2>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Camp Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="campName" value={formData.campName} onChange={handleChange}
                      placeholder="e.g. Malaria Camp - Lalapur"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Camp Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date" name="campDate" value={formData.campDate} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="text" name="startTime" value={formData.startTime} onChange={handleChange}
                      placeholder="09:00 AM"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="text" name="endTime" value={formData.endTime} onChange={handleChange}
                      placeholder="05:00 PM"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Services Offered <span className="text-gray-400 font-normal">(comma separated)</span>
                    </label>
                    <input
                      type="text" name="servicesOffered" value={formData.servicesOffered} onChange={handleChange}
                      placeholder="Blood Test, Medicine Distribution, Consultation"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activities Done</label>
                    <input
                      type="text" name="activitiesDone" value={formData.activitiesDone} onChange={handleChange}
                      placeholder="e.g. Blood Smear Test"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Targeted Diseases */}
                {diseases?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Targeted Diseases
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {diseases.map((d) => (
                        <button
                          key={d._id}
                          type="button"
                          onClick={() => handleDiseaseToggle(d._id)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                            formData.targetedDiseases.includes(d._id)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes" value={formData.notes} onChange={handleChange} rows={2}
                    placeholder="Any additional notes..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Camp"}
                </button>
              </form>
            </div>
          )}

          {/* Camps List */}
          {cLoading && <LoadingSpinner fullScreen={false} />}
          {cError   && <ErrorMessage message={cError} onRetry={refetch} />}

          {camps && (
            <div className="space-y-4">
              {camps.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center text-gray-500 text-sm">
                  No camps created yet
                </div>
              ) : (
                camps.map((camp) => (
                  <div key={camp._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{camp.campName}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          📅 {formatDate(camp.campDate)} &nbsp;|&nbsp;
                          🏘️ {camp.village?.villageName}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${getCampStatusColor(camp.status)}-100 text-${getCampStatusColor(camp.status)}-700`}>
                        {camp.status}
                      </span>
                    </div>

                    {camp.servicesOffered?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {camp.servicesOffered.map((s, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Status Update + Delete */}
                    <div className="mt-4 flex items-center gap-3">
                      <select
                        value={camp.status}
                        onChange={(e) => handleStatusUpdate(camp._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CAMP_STATUS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setDeleteId(camp._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </main>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Camp"
        message="Are you sure you want to delete this camp?"
        confirmText="Delete"
        isDanger={true}
        isLoading={deleteLoad}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default CampManagement;