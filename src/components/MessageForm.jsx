import { useState, useRef, useEffect, useCallback } from 'react';
import { FiPaperclip, FiSmile, FiX, FiSend } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

const MessageForm = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest('button[data-emoji-button]')
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle paste file
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files);
        setFiles(prev => [...prev, ...pastedFiles]);
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || files.length > 0) {
      onSendMessage({
        text: message,
        files: files
      });
      setMessage('');
      setFiles([]);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const getFileIcon = (file) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) return <span className="text-red-500 font-bold">PDF</span>;
    if (name.endsWith('.doc') || name.endsWith('.docx')) return <span className="text-blue-600 font-bold">DOC</span>;
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return <span className="text-green-600 font-bold">XLS</span>;
    if (name.endsWith('.txt')) return <span className="text-gray-500 font-bold">TXT</span>;
    return <span className="text-gray-400 font-bold">FILE</span>;
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="bg-white border-t border-gray-200 p-4 relative"
    >
      {/* File Preview */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {files.map((file, index) => {
            if (file.type.startsWith('image/')) {
              return (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 text-xs hover:opacity-100"
                    title="Remove"
                  >
                    <FiX />
                  </button>
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 relative max-w-xs"
                >
                  {getFileIcon(file)}
                  <span className="text-sm text-gray-700 truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-500 hover:text-gray-700 absolute -top-2 -right-2 bg-white rounded-full p-1"
                    title="Remove"
                  >
                    <FiX />
                  </button>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-28 focus:outline-none focus:border-primary resize-none min-h-[44px] max-h-[120px]"
            rows="1"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <FiPaperclip className="text-xl" />
            </button>
            <button
              type="button"
              data-emoji-button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <FiSmile className="text-xl" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim() && files.length === 0}
          className="p-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <FiSend className="text-xl" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full right-0 mb-2 z-50"
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </form>
  );
};

export default MessageForm;
