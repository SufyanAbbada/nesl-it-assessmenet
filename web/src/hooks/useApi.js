import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/useAuth";

// Simple in-memory cache
const cache = new Map();

export const useApi = (resource, options = {}) => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef();

  const cacheKey = `${resource}_${JSON.stringify(options)}`;

  const fetchData = async (skipCache = false) => {
    // Check cache first
    if (!skipCache && cache.has(cacheKey)) {
      setData(cache.get(cacheKey));
      setLoading(false);
      return cache.get(cacheKey);
    }

    setLoading(true);
    setError(null);

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(resource, {
        method: "GET",
        headers,
        signal: abortControllerRef.current?.signal,
        ...options,
      });

      if (!response.ok) {
        toast.error(`Failed to fetch data: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache the result
      cache.set(cacheKey, result);
      setData(result);
      return result;
    } catch (err) {
      if (err.name === "AbortError") {
        return; // Request was cancelled
      }
      toast.error("Failed to load data");
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchData(true);

  const clearCache = () => {
    cache.delete(cacheKey);
  };

  useEffect(() => {
    if (resource && token) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [resource, token]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    fetchData,
  };
};
