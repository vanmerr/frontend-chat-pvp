import { useState } from 'react';
import { FiPlus, FiSearch, FiLock, FiUsers, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import FBLoginButton from './FBLoginButton';
import LogoutButton from './LogoutButton';
import { createRoom, deleteRoom, getRoomById, updateParticipants } from '../services/fethAPI';
import GoogleLoginButton from './GGLoginButton';

const RoomList = ({ rooms = [], onRoomSelect, onCreateRoom, currentRoomId }) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    isPrivate: false,
    description: '',
    password: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Please login to view rooms</h2>
        <FBLoginButton />
        <GoogleLoginButton />
      </div>
    );
  }

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const roomData = {
        ...newRoomData,
        createdBy: currentUser.uid,
      };
      const room = await createRoom(roomData);
      if (onCreateRoom) onCreateRoom(room);
      setShowCreateModal(false);
      setNewRoomData({ name: '', isPrivate: false, description: '', password: '' });
    } catch (err) {
      alert('Tạo phòng thất bại: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleGetRoomById = async (roomId) => {
    try {
      const room = await getRoomById(roomId);
      return room;
    } catch (err) {
      alert('Không thể lấy thông tin phòng: ' + (err?.response?.data?.error || err.message));
      return null;
    }
  };

  const handleRoomClick = async (room) => {
    const latestRoom = await handleGetRoomById(room.id);
    if (!latestRoom) return;

    const isParticipant = latestRoom.participants?.some(p => p.uid === currentUser.uid);

    if (!isParticipant) {
      setSelectedRoom(latestRoom);
      setShowJoinModal(true);
      return;
    }

    if (latestRoom.isPrivate) {
      setSelectedRoom(latestRoom);
      setShowPasswordModal(true);
      setPasswordInput('');
      setPasswordError('');
    } else {
      onRoomSelect(latestRoom.id);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (selectedRoom && selectedRoom.password === passwordInput) {
      onRoomSelect(selectedRoom.id);
      setShowPasswordModal(false);
      setSelectedRoom(null);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password!');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await deleteRoom(roomId, currentUser.uid);
    } catch (err) {
      alert('Xóa phòng thất bại: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleJoinRoomConfirm = async () => {
    if (selectedRoom.isPrivate) {
      setShowJoinModal(false);
      setShowPasswordModal(true);
    } else {
      await updateParticipants(selectedRoom.id, currentUser.uid, 'add');
      onRoomSelect(selectedRoom.id);
      setShowJoinModal(false);
      setSelectedRoom(null);
    }
  };

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-full md:w-80 bg-white md:border-r md:border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 sticky top-0 z-20 bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Chat Rooms</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors shadow-sm"
            title="Create Room"
          >
            <FiPlus className="text-2xl" />
          </button>
        </div>
        <div className="p-4 border-b border-gray-200">
          <LogoutButton />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 md:px-0 pb-4 space-y-2">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => handleRoomClick(room)}
            className={`p-4 rounded-lg relative border border-transparent cursor-pointer transition-all duration-150 flex flex-col gap-1
              ${currentRoomId === room.id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-800 truncate">{room.name}</h3>
                  {room.isPrivate && <FiLock className="text-gray-400 flex-shrink-0" />}
                  {room.createdBy === currentUser.uid && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteRoom(room.id); }}
                      className="ml-2 absolute top-1 right-1 p-1 text-red-500 hover:bg-red-100 rounded-full"
                      title="delete room"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
                {!room.isPrivate && (
                  <p className="text-sm text-gray-500 truncate">
                    {room.lastMessage?.text || 'No messages yet'}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end ml-4 gap-1">
                <span className="text-xs text-gray-500">
                  {room.lastMessage && formatLastMessageTime(room.lastMessage.timestamp)}
                </span>
                {room.unreadCount > 0 && (
                  <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                    {room.unreadCount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs text-gray-500 gap-1">
              <FiUsers />
              <span>{room.participants?.length || 0} members</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Room</h3>
            <form onSubmit={handleCreateRoom}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRoomData.description}
                    onChange={(e) => setNewRoomData({ ...newRoomData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    rows="3"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="private"
                    checked={newRoomData.isPrivate}
                    onChange={(e) => setNewRoomData({ ...newRoomData, isPrivate: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="private" className="text-sm text-gray-700">Private Room</label>
                </div>
                {newRoomData.isPrivate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={newRoomData.password}
                      onChange={(e) => setNewRoomData({ ...newRoomData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      required={newRoomData.isPrivate}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Enter Room Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary mb-2"
                placeholder="Password"
                required
              />
              {passwordError && <div className="text-red-500 text-sm mb-2">{passwordError}</div>}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setSelectedRoom(null); setPasswordInput(''); setPasswordError(''); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Join the chat room?</h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setSelectedRoom(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                No
              </button>
              <button
                onClick={handleJoinRoomConfirm}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
