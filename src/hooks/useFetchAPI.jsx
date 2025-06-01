import { useState } from "react";
import { useApi } from "../services/fetchAPI";

const useFetchApi = () => {
  const { fetchAPI } = useApi();

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getApi = async (endpoint, payload = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAPI(endpoint, "GET", payload);
      setResult(data);
      return { result: data, error: null };
    } catch (err) {
      setError(err);
      return { result: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const postApi = async (endpoint, payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAPI(endpoint, "POST", payload);
      setResult(data);
      return { result: data, error: null };
    } catch (err) {
      setError(err);
      return { result: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const putApi = async (endpoint, payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAPI(endpoint, "PUT", payload);
      setResult(data);
      return { result: data, error: null };
    } catch (err) {
      setError(err);
      return { result: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteApi = async (endpoint, payload = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAPI(endpoint, "DELETE", payload);
      setResult(data);
      return { result: data, error: null };
    } catch (err) {
      setError(err);
      return { result: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    getApi,
    postApi,
    putApi,
    deleteApi,
    result,
    loading,
    error,  
  };
};

export default useFetchApi;
