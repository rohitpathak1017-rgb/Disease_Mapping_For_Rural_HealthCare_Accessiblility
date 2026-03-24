import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import useFetch from "../../hooks/useFetch.js";
import useAuth from "../../hooks/useAuth.js";
import { getFeedbackForWorker, getWorkerRatingStats } from "../../services/feedback.service.js";
import { formatDate, roundToOne } from "../../utils/helpers.js";

// ── Star Rating Display ───────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? "text-yellow-400" : "text-gray-200"}>★</span>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const ViewFeedback = () => {
  const { user } = useAuth();

  const { data: feedbacks, loading: fLoading, error: fError, refetch } =
    useFetch(() => getFeedbackForWorker(user._id), [user._id]);

  const { data: ratingStats } = useFetch(() => getWorkerRatingStats(user._id), [user._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Public Feedback</h1>
            <p className="text-gray-500 text-sm mt-1">Feedback received from public users</p>
          </div>

          {/* Rating Summary Card */}
          {ratingStats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Rating Summary</h2>
              <div className="flex items-center gap-8">

                {/* Average Rating */}
                <div className="text-center">
                  <p className="text-5xl font-bold text-yellow-500">
                    {roundToOne(ratingStats.averageRating) || 0}
                  </p>
                  <Stars rating={Math.round(ratingStats.averageRating)} />
                  <p className="text-xs text-gray-500 mt-1">{ratingStats.totalFeedback} reviews</p>
                </div>

                {/* Rating Breakdown */}
                <div className="flex-1 space-y-1.5">
                  {Object.entries(ratingStats.ratingBreakdown || {})
                    .reverse()
                    .map(([key, count]) => {
                      const label = { five: 5, four: 4, three: 3, two: 2, one: 1 }[key];
                      const pct   = ratingStats.totalFeedback
                        ? Math.round((count / ratingStats.totalFeedback) * 100)
                        : 0;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-4">{label}</span>
                          <span className="text-yellow-400 text-xs">★</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-6">{count}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Feedback List */}
          {fLoading && <LoadingSpinner fullScreen={false} />}
          {fError   && <ErrorMessage message={fError} onRetry={refetch} />}

          {feedbacks && feedbacks.length === 0 && (
            <div className="bg-white rounded-xl p-10 text-center text-gray-500 text-sm">
              No feedback received yet
            </div>
          )}

          {feedbacks && feedbacks.length > 0 && (
            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {fb.isAnonymous ? "Anonymous" : fb.givenBy?.name}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(fb.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Stars rating={fb.rating} />
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {fb.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{fb.message}</p>
                  {fb.village && (
                    <p className="text-xs text-gray-400 mt-2">
                      📍 {fb.village.villageName}, {fb.village.district}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ViewFeedback;