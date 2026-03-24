import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import useFetch from "../../hooks/useFetch.js";
import { getAllWorkers, getAllVillages, assignWorkerToVillage, unassignWorker } from "../../services/admin.service.js";

const AssignWorker = () => {
  const { data: workers, loading: wLoading, error: wError, refetch: refetchWorkers } = useFetch(getAllWorkers);
  const { data: villages, loading: vLoading, error: vError, refetch: refetchVillages } = useFetch(getAllVillages);

  const [selectedWorker,  setSelectedWorker]  = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [submitting,      setSubmitting]      = useState(false);
  const [success,         setSuccess]         = useState("");
  const [error,           setError]           = useState("");

  const handleAssign = async () => {
    if (!selectedWorker || !selectedVillage) {
      setError("Please select both a worker and a village");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await assignWorkerToVillage(selectedWorker, selectedVillage);
      setSuccess("Worker assigned to village successfully!");
      setSelectedWorker("");
      setSelectedVillage("");
      refetchWorkers();
      refetchVillages();
    } catch (err) {
      setError(err?.response?.data?.message || "Assignment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (workerId) => {
    try {
      await unassignWorker(workerId);
      refetchWorkers();
      refetchVillages();
    } catch (err) {
      setError(err?.response?.data?.message || "Unassign failed");
    }
  };

  const isLoading = wLoading || vLoading;
  const isError   = wError   || vError;

  // Unassigned workers only
  const unassignedWorkers  = workers?.filter((w) => !w.assignedVillage) || [];
  // Unassigned villages only
  const unassignedVillages = villages?.filter((v) => !v.assignedHealthWorker) || [];
  // Assigned workers
  const assignedWorkers    = workers?.filter((w) => w.assignedVillage) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Assign Worker to Village</h1>
            <p className="text-gray-500 text-sm mt-1">Link health workers to their assigned villages</p>
          </div>

          {isLoading && <LoadingSpinner fullScreen={false} />}
          {isError   && <ErrorMessage message={wError || vError} />}

          {!isLoading && (
            <>
              {/* Assignment Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">New Assignment</h2>

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Worker Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Health Worker
                    </label>
                    <select
                      value={selectedWorker}
                      onChange={(e) => { setSelectedWorker(e.target.value); setError(""); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Worker --</option>
                      {unassignedWorkers.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name} ({w.qualification || "No qualification"})
                        </option>
                      ))}
                    </select>
                    {unassignedWorkers.length === 0 && (
                      <p className="text-xs text-orange-500 mt-1">All workers are already assigned</p>
                    )}
                  </div>

                  {/* Village Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Village
                    </label>
                    <select
                      value={selectedVillage}
                      onChange={(e) => { setSelectedVillage(e.target.value); setError(""); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Village --</option>
                      {unassignedVillages.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.villageName} — {v.district}, {v.state}
                        </option>
                      ))}
                    </select>
                    {unassignedVillages.length === 0 && (
                      <p className="text-xs text-orange-500 mt-1">All villages are already assigned</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAssign}
                  disabled={submitting || !selectedWorker || !selectedVillage}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting ? "Assigning..." : "Assign Worker"}
                </button>
              </div>

              {/* Current Assignments */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">Current Assignments</h2>
                </div>
                {assignedWorkers.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-10">No assignments yet</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Health Worker", "Qualification", "Village", "District", "Action"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {assignedWorkers.map((w) => (
                        <tr key={w._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{w.name}</td>
                          <td className="px-4 py-3 text-gray-600">{w.qualification || "—"}</td>
                          <td className="px-4 py-3 text-green-600 font-medium">
                            {w.assignedVillage?.villageName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {w.assignedVillage?.district}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleUnassign(w._id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Unassign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default AssignWorker;