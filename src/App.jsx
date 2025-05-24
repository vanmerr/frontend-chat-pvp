import { useState, useEffect, useRef } from 'react';
import RoomList from './components/RoomList';
import Room from './components/Room';
import { FiMenu, FiX } from 'react-icons/fi';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { io } from 'socket.io-client';
import { getAllRooms, getRoomById } from './services/fethAPI';

const SOCKET_URL = import.meta.env.VITE_API_URI;

function MainApp() {
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [rooms, setRooms] = useState([]);
  const socketRef = useRef(null);
  const { currentUser } = useAuth();

  // Lấy danh sách phòng từ backend khi mount
  useEffect(() => {
    async function fetchRooms() {
      try {
        const allRooms = await getAllRooms();
        setRooms(allRooms);
      } catch (err) {
        console.error('Lỗi lấy danh sách phòng:', err);
      }
    }
    fetchRooms();
  }, []);


  // Hàm lấy thông tin phòng từ backend
  const handleGetRoomById = async (roomId) => {
    try {
      const room = await getRoomById(roomId);
      return room;
    } catch (err) {
      alert('Không thể lấy thông tin phòng: ' + (err?.response?.data?.error || err.message));
      return null;
    }
  };

  // Khởi tạo socket chỉ 1 lần
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
      socketRef.current.on("connection", () => {
        console.log("Connected to socket server");
        if (currentUser) {
          socketRef.current.emit("online", currentUser.uid);
        }
      });


      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, );

  // Khi tạo phòng mới, tự động join socket room
  const handleCreateRoom = (newRoom) => {
    setRooms(prev => [...prev, newRoom]);
    if (socketRef.current && currentUser) {
      socketRef.current.emit('join-room', newRoom.id, {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      });
    }
    setCurrentRoomId(newRoom.id);
  };

  // Khi chọn phòng, lấy thông tin mới nhất từ backend và join socket room
  const handleRoomSelect = async (roomId) => {
    const latestRoom = await handleGetRoomById(roomId);
    if (!latestRoom) return;
    setCurrentRoomId(roomId);
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId ? { ...latestRoom, unreadCount: 0 } : room
      )
    );
    if (socketRef.current && currentUser) {
      socketRef.current.emit('join-room', roomId, {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      });
    }
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current && currentUser && currentRoomId) {
      socketRef.current.emit('leave-room', currentRoomId, {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      });
    }
    setCurrentRoomId(null);
  };

  const currentRoom = rooms.find(room => room.id === currentRoomId);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-lg md:hidden"
      >
        <FiMenu className="text-xl text-gray-600" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-full md:w-80 bg-white md:border-r md:shadow-2xl overflow-hidden transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button for mobile */}
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentRoom && currentUser ? (
          <Room
            room={currentRoom}
            currentUser={currentUser}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to Chat PVP
              </h2>
              <p className="text-gray-600">
                Select a room to start chatting or create a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
