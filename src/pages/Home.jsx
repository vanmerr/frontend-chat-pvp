import { useState, useEffect, useRef } from 'react';
import RoomList from '../components/RoomList';
import Room from '../components/Room';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import { getAllRooms, getRoomById } from '../services/fethAPI';
import WelcomeScreen from '../components/WelcomeScreen';

const SOCKET_URL = import.meta.env.VITE_API_URI;

function Home() {
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [rooms, setRooms] = useState([]);
  const socketRef = useRef(null);
  const { currentUser } = useAuth();

  // Fetch all rooms on mount
  useEffect(() => {
    getAllRooms()
      .then(setRooms)
      .catch(err => console.error('Lỗi lấy danh sách phòng:', err));
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);

      socketRef.current.on('connection', () => {
        console.log('Connected to socket server');
        if (currentUser) {
          socketRef.current.emit('online', currentUser.uid);
        }
      });
    }

    return () => socketRef.current?.disconnect();
  }, [currentUser]);

  const joinRoomSocket = (roomId) => {
    socketRef.current?.emit('join-room', roomId, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
    });
  };

  const leaveRoomSocket = () => {
    socketRef.current?.emit('leave-room', currentRoomId, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
    });
  };

  const handleCreateRoom = (newRoom) => {
    setRooms(prev => [...prev, newRoom]);
    joinRoomSocket(newRoom.id);
    setCurrentRoomId(newRoom.id);
  };

  const handleRoomSelect = async (roomId) => {
    try {
      const latestRoom = await getRoomById(roomId);
      setCurrentRoomId(roomId);
      setRooms(prev =>
        prev.map(room => room.id === roomId ? { ...latestRoom, unreadCount: 0 } : room)
      );
      joinRoomSocket(roomId);
      if (window.innerWidth < 768) setShowSidebar(false);
    } catch (err) {
      alert('Không thể lấy thông tin phòng: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleLeaveRoom = () => {
    leaveRoomSocket();
    setCurrentRoomId(null);
  };

  const currentRoom = rooms.find(r => r.id === currentRoomId);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-lg md:hidden"
      >
        <FiMenu className="text-xl text-gray-600" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-full md:w-80 bg-white md:border-r md:shadow-2xl overflow-hidden transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setShowSidebar(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden"
        >
          <FiX className="text-xl text-gray-600" />
        </button>
        <RoomList
          rooms={rooms}
          onRoomSelect={handleRoomSelect}
          onCreateRoom={handleCreateRoom}
          currentRoomId={currentRoomId}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {currentRoom && currentUser ? (
          <Room
            room={currentRoom}
            currentUser={currentUser}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
            <WelcomeScreen />
        )}
      </main>

      {/* Overlay for sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}

export default Home;
