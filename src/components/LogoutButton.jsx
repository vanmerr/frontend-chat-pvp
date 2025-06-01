import { useAuth } from '../contexts/AuthContext';
import { FiLogOut } from 'react-icons/fi';

function LogoutButton() {
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName}
            className="w-9 h-9 rounded-full border object-cover"
          />
          <span className="font-semibold text-gray-800 truncate ">{currentUser.displayName}</span>
      </div>
      <button
        onClick={handleLogout}
        className="ml-2 p-2 text-gray-500 hover:text-white hover:bg-red-500 rounded-full transition-colors duration-200"
        title="Đăng xuất"
      >
        <FiLogOut className="text-lg" />
      </button>
    </div>
  );
}

export default LogoutButton; 