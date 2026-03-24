import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import useFetch from "../../hooks/useFetch.js";
import useAuth from "../../hooks/useAuth.js";
import { submitReport, getAllReports } from "../../services/report.service.js";
import { getAllDiseases } from "../../services/admin.service.js";
import { getCampsByVillage } from "../../services/camp.service.js";
import { formatMonthYear } from "../../utils/helpers.js";
import { MONTHS } from "../../utils/constants.js";

const currentYear  = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const DiseaseReportForm = () => {
  const { user } = useAuth();
  const villageId = user?.assignedVillage?._id || user?.assignedVillage;

  const { data: diseases } = useFetch(getAllDiseases);
  const { data: camps    } = useFetch(() => getCampsByVillage(villageId), [villageId]);
  const { data: reports, loading: rLoading, error: rError, refetch } = useFetch(getAllReports);

  const [reportMonth,  setReportMonth]  = useState(currentMonth);
  const [reportYear,   setReportYear]   = useState(currentYear);
  const [linkedCamp,   setLinkedCamp]   = useState("");
  const [observations, setObservations] = useState("");
  const [entries,      setEntries]      = useState([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState("");
  const [error,        setError]        = useState("");

  // ── Add disease entry ──────────────────────────────────────────────────────
  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { disease: "", affectedCount: 0, recoveredCount: 0, deathCount: 0,
        ageGroups: { children: 0, adults: 0, seniors: 0 }, notes: "" },
    ]);
  };

  const updateEntry = (index, field, value) => {
    setEntries((prev) => {
      const updated = [...prev];
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        updated[index] = { ...updated[index], [parent]: { ...updated[index][parent], [child]: value } };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const removeEntry = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (entries.length === 0) {
      setError("Add at least one disease entry");
      return;
    }
    if (entries.some((e) => !e.disease)) {
      setError("Please select a disease for all entries");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await submitReport({
        villageId,
        reportMonth,
        reportYear,
        diseases:            entries,
        generalObservations: observations,
        linkedCamp:          linkedCamp || undefined,
      });
      setSuccess("Report submitted successfully!");
      setEntries([]);
      setObservations("");
      setLinkedCamp("");
      refetch();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Submit Disease Report</h1>
            <p className="text-gray-500 text-sm mt-1">Monthly disease data for your assigned village</p>
          </div>

          {/* Report Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
                ✅ {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Period + Camp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Camp (Optional)</label>
                  <select
                    value={linkedCamp}
                    onChange={(e) => setLinkedCamp(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Camp --</option>
                    {camps?.map((c) => (
                      <option key={c._id} value={c._id}>{c.campName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Disease Entries */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Disease Entries</label>
                  <button
                    type="button" onClick={addEntry}
                    className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium"
                  >
                    + Add Disease
                  </button>
                </div>

                {entries.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    Click "Add Disease" to start adding disease data
                  </p>
                )}

                <div className="space-y-4">
                  {entries.map((entry, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-700">Entry #{idx + 1}</span>
                        <button
                          type="button" onClick={() => removeEntry(idx)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Disease</label>
                          <select
                            value={entry.disease}
                            onChange={(e) => updateEntry(idx, "disease", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Select Disease --</option>
                            {diseases?.map((d) => (
                              <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Affected Count</label>
                          <input
                            type="number" min="0"
                            value={entry.affectedCount}
                            onChange={(e) => updateEntry(idx, "affectedCount", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Recovered</label>
                          <input
                            type="number" min="0"
                            value={entry.recoveredCount}
                            onChange={(e) => updateEntry(idx, "recoveredCount", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Deaths</label>
                          <input
                            type="number" min="0"
                            value={entry.deathCount}
                            onChange={(e) => updateEntry(idx, "deathCount", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Children (0-14)</label>
                          <input
                            type="number" min="0"
                            value={entry.ageGroups.children}
                            onChange={(e) => updateEntry(idx, "ageGroups.children", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Adults (15-59)</label>
                          <input
                            type="number" min="0"
                            value={entry.ageGroups.adults}
                            onChange={(e) => updateEntry(idx, "ageGroups.adults", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Seniors (60+)</label>
                          <input
                            type="number" min="0"
                            value={entry.ageGroups.seniors}
                            onChange={(e) => updateEntry(idx, "ageGroups.seniors", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">General Observations</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  placeholder="Overall health observations for the village this month..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit" disabled={submitting || entries.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>

          {/* Past Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Reports</h2>
            {rLoading && <LoadingSpinner fullScreen={false} size="sm" />}
            {rError   && <ErrorMessage message={rError} />}
            {reports && reports.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No reports submitted yet</p>
            )}
            {reports && reports.length > 0 && (
              <div className="space-y-2">
                {reports.map((r) => (
                  <div key={r._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {formatMonthYear(r.reportMonth, r.reportYear)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {r.diseases?.length} disease(s) · {r.village?.villageName}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.isReviewed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.isReviewed ? "Reviewed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default DiseaseReportForm;