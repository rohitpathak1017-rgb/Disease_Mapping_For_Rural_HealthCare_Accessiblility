import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "../utils/helpers.js";

// ── useFetch Hook ─────────────────────────────────────────────────────────────
// Generic data fetching hook — service function pass karo, data milega
//
// Usage:
//   const { data, loading, error, refetch } = useFetch(getAllVillages);
//
//   With params:
//   const { data, loading, error } = useFetch(() => getVillageById(id));
// ─────────────────────────────────────────────────────────────────────────────
const useFetch = (fetchFn, dependencies = []) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    if (!fetchFn) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn();
      setData(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // refetch → manually dobara data fetch karo
  return { data, loading, error, refetch: fetchData };
};

export default useFetch;