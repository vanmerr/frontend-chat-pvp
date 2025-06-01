import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { loginWithGoogle } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import useApi from "../services/fetchAPI";
import Loading from "./Loading";

function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { postApi } = useApi();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { user } = await loginWithGoogle();
      const idToken = await user.getIdToken();
      const res = await postApi('auth/verify-firebase-token', { idToken });
      login(res.user);
    } catch (err) {
      alert("Đăng nhập thất bại: " + err.message);
    } finally {
      setLoading(false);
    } 
  };

  return (
    <button
      onClick={handleLogin}
      className="btn-primary flex items-center  gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
    >
        {loading ? <Loading/> : <FaGoogle className="text-white" />}
        Sign in with Google
    </button>
  );
}

export default GoogleLoginButton;
