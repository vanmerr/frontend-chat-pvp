import React from "react";
import { FaGoogle } from "react-icons/fa";
import { loginWithGoogle } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { verifyFirebaseToken } from "../services/fethAPI";

function GoogleLoginButton() {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const { user } = await loginWithGoogle();
      const idToken = await user.getIdToken();
      const response = await verifyFirebaseToken(idToken);
      login(response.user);
    } catch (err) {
      alert("Đăng nhập thất bại: " + err.message);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="btn-primary flex items-center  gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
    >
      <FaGoogle className="text-white" />
      Đăng nhập bằng Google
    </button>
  );
}

export default GoogleLoginButton;
