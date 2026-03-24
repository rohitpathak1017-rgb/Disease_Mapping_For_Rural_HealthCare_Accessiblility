// ── LoadingSpinner ────────────────────────────────────────────────────────────
const LoadingSpinner = ({ fullScreen = true, size = "md", text = "Loading..." }) => {
  const sizeMap = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-16 w-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size]} rounded-full border-blue-500 border-t-transparent animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-10">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;