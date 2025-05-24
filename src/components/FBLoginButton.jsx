
import React from 'react';
import { FaFacebook } from "react-icons/fa";
import { loginWithFacebook } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { verifyFirebaseToken } from '../services/fethAPI';

function FBLoginButton() {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const { user } = await loginWithFacebook();
      const idToken = await user.getIdToken();
      const response = await verifyFirebaseToken(idToken);
      login(response.user);
    } catch (err) {
      alert('Đăng nhập thất bại: ' + err.message);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
    >
      <FaFacebook className="text-white" />
      Đăng nhập bằng Facebook
    </button>
  );
}

export default FBLoginButton;
