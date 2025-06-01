import { FiPlus, FiSearch } from 'react-icons/fi';

const RoomListHeader = ({ searchQuery, setSearchQuery, onCreateClick }) => (
  <div className="p-4 border-b border-gray-200 sticky top-0 z-20 bg-white flex-shrink-0">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-800">Chat Rooms</h2>
      <button
        onClick={onCreateClick}
        className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors shadow-sm"
        title="Create Room"
      >
        <FiPlus className="text-2xl" />
      </button>
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
);

export default RoomListHeader;
