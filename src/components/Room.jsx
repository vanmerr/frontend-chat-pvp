import { useState, useEffect, useRef } from "react";
import {
  FiUsers,
  FiX,
  FiArrowLeft,
  FiUserPlus,
  FiVideo,
  FiMonitor,
} from "react-icons/fi";
import { FaDotCircle, FaRegDotCircle } from "react-icons/fa";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import PropTypes from "prop-types";
import {
  getMessages,
  sendMessage as sendMessageAPI,
} from "../services/fethAPI";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URI;

const Room = ({ room = {}, currentUser = {}, onLeaveRoom = () => {} }) => {
  const [messages, setMessages] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState(room.participants || []);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [searchParticipant, setSearchParticipant] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchAdd, setSearchAdd] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  // // Danh sách user mẫu (giả lập)
  // const allUsers = [
  //   { id: 'user10', name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=10' },
  //   { id: 'user11', name: 'Bob', avatar: 'https://i.pravatar.cc/150?img=11' },
  //   { id: 'user12', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?img=12' },
  //   { id: 'user13', name: 'David', avatar: 'https://i.pravatar.cc/150?img=13' },
  //   { id: 'user14', name: 'Eve', avatar: 'https://i.pravatar.cc/150?img=14' },
  //   { id: 'user15', name: 'Frank', avatar: 'https://i.pravatar.cc/150?img=15' },
  // ];
  // // Lọc user chưa có trong participants
  // const availableUsers = allUsers.filter(u => !participants.some(p => p.id === u.id));
  // const filteredAddUsers = availableUsers.filter(u => u.displayName.toLowerCase().includes(searchAdd.toLowerCase()));

  // Lấy lịch sử tin nhắn khi vào phòng
  useEffect(() => {
    setIsLoading(true);
    async function fetchMsgs() {
      try {
        const msgs = await getMessages(room.id);
        setMessages(msgs);
      } catch (err) {
        setMessages([]);
      }
      setIsLoading(false);
    }
    if (room.id) fetchMsgs();
  }, [room.id]);

  // Khởi tạo socket và lắng nghe tin nhắn mới
  useEffect(() => {
    if (!room.id) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    const socket = socketRef.current;

    // Emit online event khi người dùng vào phòng
    socket.emit("online", currentUser.uid);
    // Join room
    socket.emit("join-room", room.id, currentUser);
    // Lắng nghe tin nhắn mới
    socket.on("chat-message", (message) => {
      if (message) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("user-online", (userId) => {
      if (userId !== currentUser.uid) {
        setOnlineUsers((prev) => [...prev, userId]);
      }
    });
    socket.on("user-offline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });
    return () => {
      socket.emit("leave-room", room.id, currentUser);
      socket.emit("offline", currentUser.uid);
      socket.off("chat-message");
    };
    // eslint-disable-next-line
  }, [room.id, currentUser?.uid]);

  // Gửi tin nhắn (có thể kèm file)
  const handleSendMessage = async (messageData) => {
    const msg = await sendMessageAPI(room.id, {
      text: messageData.text,
      sender: currentUser.uid,
      files: messageData.files || [],
    });
    socketRef.current.emit("chat-message", room.id, msg);
  };

  useEffect(() => {
    setParticipants(room.participants || []);
  }, [room, onlineUsers]);

  const handleAddParticipant = () => {
    setShowAddModal(true);
  };

  // const handleSelectAddUser = (user) => {
  //   setParticipants(prev => [...prev, user]);
  //   setShowAddModal(false);
  //   setSearchAdd('');
  // };

  // If room data is not available, show loading state
  if (!room || !room.name) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading room...</p>
      </div>
    );
  }

  const filteredParticipants = participants.filter((p) =>
    p.displayName.toLowerCase().includes(searchParticipant.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Room Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:px-8 md:py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onLeaveRoom}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          >
            <FiArrowLeft className="text-gray-600 text-xl md:text-2xl" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {room.name}
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              {room.description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Video Call & Share Screen Buttons */}
          <button
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors"
            title="Start Video Call"
            onClick={() => setShowVideoModal(true)}
          >
            <FiVideo className="text-xl md:text-2xl" />
          </button>
          <button
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors"
            title="Share Screen"
            onClick={() => setShowScreenModal(true)}
          >
            <FiMonitor className="text-xl md:text-2xl" />
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiUsers className="text-gray-600 text-xl md:text-2xl" />
          </button>
          <button
            onClick={onLeaveRoom}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
          >
            <FiX className="text-gray-600 text-xl md:text-2xl" />
          </button>
        </div>
      </div>

      {/* Video Call Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 relative w-full max-w-md">
            <button
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              onClick={() => setShowVideoModal(false)}
            >
              <FiX className="text-xl" />
            </button>
            <div className="flex flex-col items-center">
              <FiVideo className="text-4xl text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Video Call</h2>
              <p className="text-gray-600 mb-4">
                Tính năng gọi video sẽ sớm khả dụng!
              </p>
              <button
                className="btn-primary mt-2"
                onClick={() => setShowVideoModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Screen Share Modal */}
      {showScreenModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 relative w-full max-w-md">
            <button
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              onClick={() => setShowScreenModal(false)}
            >
              <FiX className="text-xl" />
            </button>
            <div className="flex flex-col items-center">
              <FiMonitor className="text-4xl text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Chia sẻ màn hình</h2>
              <p className="text-gray-600 mb-4">
                Tính năng chia sẻ màn hình sẽ sớm khả dụng!
              </p>
              <button
                className="btn-primary mt-2"
                onClick={() => setShowScreenModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        {/* Messages + Form */}
        <div className="flex-1 flex flex-col max-h-[calc(100vh-80px)] min-h-0 md:px-8 md:py-4">
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide ::-webkit-scrollbar:none ">
            <MessageList
              messages={messages}
              currentUser={currentUser}
              isLoading={isLoading}
            />
          </div>
          <div className="sticky bottom-0 bg-white z-10">
            <MessageForm onSendMessage={handleSendMessage} />
          </div>
        </div>

        {/* Participants Sidebar - chỉ show khi showParticipants true, overlay cố định, không làm tăng chiều cao DOM */}
        {showParticipants && (
          <div
            className="fixed top-0 right-0 h-full w-full md:w-80 bg-white border-l border-gray-200 z-50 shadow-2xl flex flex-col"
            style={{ maxHeight: "100vh" }}
          >
            {/* Header sticky */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                Participants
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddParticipant}
                  className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors shadow-sm"
                  title="Add participant"
                >
                  <FiUserPlus className="text-2xl md:text-3xl" />
                </button>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close"
                >
                  <FiX className="text-gray-600 text-2xl md:text-3xl" />
                </button>
              </div>
            </div>
            {/* Search input */}
            <div className="px-6 md:px-8 py-2 border-b border-gray-100 bg-white sticky top-[72px] z-10">
              <input
                type="text"
                value={searchParticipant}
                onChange={(e) => setSearchParticipant(e.target.value)}
                placeholder="Search participants..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50"
              />
            </div>
            {/* Danh sách participants scrollable */}
            <div className="space-y-5 overflow-y-auto flex-1 px-4 py-4 scrollbar-hide">
              {filteredParticipants.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  No participants found.
                </div>
              ) : (
                room.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <img
                      src={participant.photoURL}
                      alt={participant.displayName}
                      className="w-12 h-12 md:w-14 md:h-14 object-cover border-2 border-primary/20 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 md:text-lg">
                        {participant.displayName}
                      </p>
                      {participant.uid === currentUser.uid ||
                      onlineUsers.includes(participant.uid) ? (
                        <p className="text-sm text-green-600">
                          <FaDotCircle className="inline-block text-green-600" />{" "}
                          Online
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          <FaRegDotCircle className="inline-block text-gray-500" />{" "}
                          Offline
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Overlay for mobile participants sidebar - chỉ phủ phần chat, không phủ sidebar RoomList */}
        {showParticipants && (
          <div
            className="fixed inset-y-0 right-0 left-0 md:hidden z-40 bg-black bg-opacity-60"
            style={{ left: "20rem" }}
            onClick={() => setShowParticipants(false)}
          />
        )}
      </div>

      {/* Modal Add Participant */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Add Participant</h3>
            <input
              type="text"
              value={searchAdd}
              onChange={(e) => setSearchAdd(e.target.value)}
              placeholder="Search users..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-gray-50 mb-4"
            />
            {/* <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
              {filteredAddUsers.length === 0 ? (
                <div className="text-center text-gray-400">No users found.</div>
              ) : (
                filteredAddUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => handleSelectAddUser(user)}>
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                ))
              )}
            </div> */}
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Room.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string,
      })
    ),
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  onLeaveRoom: PropTypes.func,
};

export default Room;
