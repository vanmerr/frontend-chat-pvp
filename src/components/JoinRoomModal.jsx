const JoinRoomModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-80 text-center">
      <h3 className="text-lg font-semibold mb-4">Join Room</h3>
      <p className="mb-6">Do you want to join this room?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
        >
          Join
        </button>
      </div>
    </div>
  </div>
);

export default JoinRoomModal;
