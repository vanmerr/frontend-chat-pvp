
import React, { useState } from 'react';
import { FaFacebook } from "react-icons/fa";
import { loginWithFacebook } from '../services/auth';
import { useApi } from '../services/fetchAPI';
import Loading from './Loading';
import { useAuth } from '../contexts/AuthContext';
function FBLoginButton() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { postApi } = useApi();


  const handleLogin = async () => {
    try {
      setLoading(true);
      const { user } = await loginWithFacebook();
      const idToken = await user.getIdToken();
      const res = await postApi('auth/verify-firebase-token', { idToken });
      console.log(res);
      login(res.user);
    } catch (err) {
      alert('Đăng nhập thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
    >
      {loading? <Loading/> : <FaFacebook className="text-white" />}
      Sign in with Facebook
    </button>
  );
}

export default FBLoginButton;
