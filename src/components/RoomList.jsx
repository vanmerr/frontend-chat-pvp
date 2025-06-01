import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FBLoginButton from './FBLoginButton';
import GoogleLoginButton from './GGLoginButton';
import LogoutButton from './LogoutButton';
import { createRoom, deleteRoom, getRoomById, updateParticipants } from '../services/fethAPI';

import RoomListHeader from './RoomListHeader';
import RoomItem from './RoomItem';
import CreateRoomModal from './CreateRoomModal';
import PasswordModal from './PasswordModal';
import JoinRoomModal from './JoinRoomModal';

const RoomList = ({ rooms = [], onRoomSelect, onCreateRoom, currentRoomId }) => {
  const { currentUser } = useAuth();

  // States liên quan đến modals và dữ liệu phòng tạo/join
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [passwordInput, setPasswordInput] = useState(''); // eslint-disable-line no-unused-vars
  const [passwordError, setPasswordError] = useState('');

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

  // Các hàm xử lý logic đã được giữ nguyên nhưng rút gọn inline

  const handleCreateRoom = async (roomData) => {
    try {
      const room = await createRoom({ ...roomData, createdBy: currentUser.uid });
      onCreateRoom?.(room);
      setShowCreateModal(false);
    } catch (err) {
      alert('Tạo phòng thất bại: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await deleteRoom(roomId, currentUser.uid);
    } catch (err) {
      alert('Xóa phòng thất bại: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleRoomClick = async (room) => {
    try {
      const latestRoom = await getRoomById(room.id);
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
    } catch (err) {
      alert('Không thể lấy thông tin phòng: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handlePasswordSubmit = (password) => {
    if (selectedRoom && selectedRoom.password === password) {
      onRoomSelect(selectedRoom.id);
      setShowPasswordModal(false);
      setSelectedRoom(null);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password!');
    }
  };

  const handleJoinRoomConfirm = async () => {
    if (!selectedRoom) return;
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
      <RoomListHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateClick={() => setShowCreateModal(true)}
      />
      <div className="p-4 border-b border-gray-200">
        <LogoutButton />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 md:px-0 pb-4 space-y-2">
        {filteredRooms.map(room => (
          <RoomItem
            key={room.id}
            room={room}
            currentRoomId={currentRoomId}
            currentUserId={currentUser.uid}
            formatLastMessageTime={formatLastMessageTime}
            onClick={() => handleRoomClick(room)}
            onDelete={() => handleDeleteRoom(room.id)}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />
      )}

      {showPasswordModal && selectedRoom && (
        <PasswordModal
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedRoom(null);
            setPasswordInput('');
            setPasswordError('');
          }}
          onSubmit={handlePasswordSubmit}
          error={passwordError}
        />
      )}

      {showJoinModal && selectedRoom && (
        <JoinRoomModal
          onCancel={() => {
            setShowJoinModal(false);
            setSelectedRoom(null);
          }}
          onConfirm={handleJoinRoomConfirm}
        />
      )}
    </div>
  );
};

export default RoomList;
