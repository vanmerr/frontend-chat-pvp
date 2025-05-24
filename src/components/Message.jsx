import { useState } from "react";
import { FiDownload, FiImage, FiFile, FiX } from "react-icons/fi";
import safeFormat from "../utils/formatTime";
import linkifyText from "../utils/linkText";

const getExtension = (url) => {
  return url.split(".").pop().split("?")[0].toLowerCase();
};

const guessMimeType = (url) => {
  const ext = getExtension(url);
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return "image/" + ext;
  if (ext === "pdf") return "application/pdf";
  if (["doc", "docx"].includes(ext)) return "application/msword";
  if (["xls", "xlsx", "csv"].includes(ext)) return "application/vnd.ms-excel";
  return "application/octet-stream";
};

const guessFileName = (url) => {
  return decodeURIComponent(url.split("/").pop().split("?")[0]);
};

const Message = ({ message, isOwn }) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImagePreview(true);
  };

  const handleClosePreview = () => {
    setShowImagePreview(false);
    setSelectedImage(null);
  };

  const getFileIcon = (type) => {
    const mainType = type.split("/")[0];
    switch (mainType) {
      case "image":
        return <FiImage className="text-xl" />;
      case "application":
        if (type.includes("pdf")) return "📄";
        if (type.includes("word")) return "📝";
        if (type.includes("excel") || type.includes("sheet")) return "📊";
        return <FiFile className="text-xl" />;
      default:
        return <FiFile className="text-xl" />;
    }
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = guessFileName(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`relative flex ${
        isOwn ? "justify-end" : "justify-start"
      }  mb-4 animate-fade-in`}
    >
      <div className={` ${isOwn ? "hidden" : "block"}`}>
        <p
          className={`absolute text-nowrap text-left  top-0 left-12  z-50  text-sm text-gray-500`}
        >
          {message.sender.displayName}
        </p>{" "}
        {/* Adjusted position */}
        <img
          src={message.sender.photoURL}
          alt={message.sender.displayName}
          className={`${
            isOwn ? "hidden" : "block w-10 h-10 rounded-full"
          }`}
        />
      </div>
      <div
        className={`relative min-w-[50px] mt-6 ml-3 max-w-lg md:max-w-md max-sm:max-w-[300px]  chat-bubble ${
          isOwn ? "chat-bubble-sent" : "chat-bubble-received"
        }`}
      >
        {/* Message Text */}
        {message.text && (
          <pre className="text-sm text-wrap mb-2">
            {linkifyText(message.text, isOwn)}
          </pre>
        )}

        {/* Timestamp */}
        <div
          className={`absolute ${
            isOwn ? "right-3" : "left-3"
          } bottom-0 text-xs  ${isOwn ? "text-white/70" : "text-gray-500"}`}
        >
          {safeFormat(message.timestamp)}
        </div>

        {/* Files Section */}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.files.map((url, index) => {
              const type = guessMimeType(url);
              const name = guessFileName(url);

              if (type.startsWith("image/")) {
                return (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(url)}
                    />
                    <button
                      onClick={() => handleDownload(url)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Download"
                    >
                      <FiDownload />
                    </button>
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="flex items-center bg-white/10 rounded-lg px-3 py-2 gap-2 border border-gray-200"
                  >
                    {getFileIcon(type)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[120px]">
                        {name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(url)}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      title="Download"
                    >
                      <FiDownload />
                    </button>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={handleClosePreview}
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
