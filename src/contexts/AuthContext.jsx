import { createContext, useState, useEffect, useContext } from 'react';

// Tạo AuthContext
const AuthContext = createContext();



// Provider chứa logic xử lý xác thực
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra người dùng đã đăng nhập khi tải trang
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Hàm đăng nhập
  const login = (userData) => {
    setCurrentUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  // Hàm đăng xuất
  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('user');
  };

  // Cập nhật accessToken mới
  const updateToken = (newAccessToken) => {
    setCurrentUser((prev) => {
      const updatedUser = {
        ...prev,
        user: {
          ...prev.user,
          accessToken: newAccessToken,
        },
      };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Truyền giá trị context
  const value = {
    currentUser,
    login,
    logout,
    updateToken,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line
export const useAuth = () => useContext(AuthContext);