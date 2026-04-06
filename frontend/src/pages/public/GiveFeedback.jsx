/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import useFetch from "../../hooks/useFetch.js";
import useAuth from "../../hooks/useAuth.js";
import { submitFeedback, getWorkerRatingStats } from "../../services/feedback.service.js";
import { getAllVillages } from "../../services/admin.service.js";
import { FEEDBACK_CATEGORIES } from "../../utils/constants.js";
import { roundToOne } from "../../utils/helpers.js";

// ── Star Picker ───────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={`text-3xl transition-colors ${s <= value ? "text-yellow-400" : "text-gray-200 hover:text-yellow-300"}`}
      >
        ★
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const GiveFeedback = () => {
  const { workerId } = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const { data: ratingStats } = useFetch(() => getWorkerRatingStats(workerId), [workerId]);
  const { data: villages }    = useFetch(getAllVillages);

  const [rating,      setRating]      = useState(0);
  const [category,    setCategory]    = useState("Overall Experience");
  const [message,     setMessage]     = useState("");
  const [villageId,   setVillageId]   = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError("Please select a rating"); return; }
    if (!message.trim()) { setError("Please write a message"); return; }
    if (message.trim().length < 10) { setError("Message must be at least 10 characters"); return; }
    if (!villageId) { setError("Please select your village"); return; }

    setSubmitting(true);
    setError("");
    try {
      await submitFeedback({
        healthWorkerId: workerId,
        villageId,
        rating,
        category,
        message: message.trim(),
        isAnonymous,
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Feedback Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Thank you for your feedback. It helps improve healthcare services.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">

        <Link to="/" className="text-sm text-blue-600 hover:underline mb-4 block">
          ← Back
        </Link>

        {/* Rating Summary */}
        {ratingStats && ratingStats.totalFeedback > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-500">
                {roundToOne(ratingStats.averageRating)}
              </p>
              <p className="text-xs text-gray-400">{ratingStats.totalFeedback} reviews</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Worker Rating</p>
              <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className={s <= Math.round(ratingStats.averageRating) ? "text-yellow-400" : "text-gray-200"}>★</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Give Feedback</h1>
          <p className="text-gray-500 text-sm mb-6">Share your experience with the health worker</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <StarPicker value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {["","Very Poor","Poor","Average","Good","Excellent"][rating]}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FEEDBACK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Village */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Village <span className="text-red-500">*</span>
              </label>
              <select
                value={villageId}
                onChange={(e) => setVillageId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Village --</option>
                {villages?.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.villageName} — {v.district}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Share your experience... (min 10 characters)"
                maxLength={500}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{message.length}/500</p>
            </div>

            {/* Anonymous */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">Submit anonymously</span>
            </label>

            <button
              type="submit"
              disabled={submitting || !rating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default GiveFeedback;