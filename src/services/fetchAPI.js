import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URI = `${import.meta.env.VITE_API_URI}/api/v1`;

export const useApi = () => {
  const { currentUser, updateToken, logout } = useAuth();

  const getAuthHeader = () => {
    const token = currentUser?.user?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const makeRequest = async (endpoint, method, data = null, config = {}) => {
    const url = `${API_URI}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(currentUser?.user ? getAuthHeader() : ""),
      ...(config.headers || {}),
    };

    const reqConfig = {
      url,
      method: method.toLowerCase(),
      headers,
      ...config,
    };

    if (data) {
      if (method.toUpperCase() === "GET") {
        reqConfig.params = data;
      } else {
        reqConfig.data = data;
      }
    }

    try {
      const response = await axios(reqConfig);
      return response.data;
    } catch (error) {
      const isTokenExpired = error.response?.status === 401;
      const refreshToken = currentUser?.user?.refreshToken;

      if (isTokenExpired && refreshToken) {
        try {
          const refreshRes = await axios.post(`${API_URI}/auth/refresh-token`, {
            refreshToken,
          });

          const newAccessToken = refreshRes.data.accessToken;
          updateToken(newAccessToken);

          // Retry original request with new token
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          };

          const retryRes = await axios({
            ...reqConfig,
            headers: retryHeaders,
          });

          return retryRes.data;
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          logout();
          throw refreshError;
        }
      }

      console.error("API request failed:", error);
      throw error;
    }
  };

  const request = (method) => (endpoint, data = null, config = {}) =>
    makeRequest(endpoint, method, data, config);

  return {
    fetchAPI: makeRequest,
    getApi: request("GET"),
    postApi: request("POST"),
    putApi: request("PUT"),
    deleteApi: request("DELETE"),
  };
};

export default useApi;
