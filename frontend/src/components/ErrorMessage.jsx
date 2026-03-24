// ── ErrorMessage ──────────────────────────────────────────────────────────────
// Usage:
//   <ErrorMessage message={error} />
//   <ErrorMessage message="Custom error" onRetry={refetch} />
// ─────────────────────────────────────────────────────────────────────────────
const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-red-600 font-medium text-sm mb-4">
        {message || "Something went wrong"}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;