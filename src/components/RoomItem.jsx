import { FiLock, FiUsers, FiTrash2 } from 'react-icons/fi';

const RoomItem = ({
  room,
  currentRoomId,
  currentUserId,
  formatLastMessageTime,
  onClick,
  onDelete,
}) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-lg relative border border-transparent cursor-pointer transition-all duration-150 flex flex-col gap-1
      ${currentRoomId === room.id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}
    `}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 relative">
          <h3 className="font-medium text-gray-800 truncate">{room.name}</h3>
          {room.isPrivate && <FiLock className="text-gray-400 flex-shrink-0" />}
          {room.createdBy === currentUserId && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
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
);

export default RoomItem;
