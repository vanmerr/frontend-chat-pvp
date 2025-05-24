import { useEffect, useRef } from 'react';
import Message from './Message';
import safeFormat from '../utils/formatTime';

const MessageList = ({ messages, currentUser, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = safeFormat(message.timestamp, 'dd/MM/yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 p-4 space-y-4 relative scrollbar-hide">
      {Object.entries(messageGroups).map(([date, messages]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              {date}
            </div>
          </div>
          {messages.map((message, index) => (
            <Message
              key={`${message.id}-${index}`}
              message={message}
              isOwn={message.sender.uid === currentUser.uid}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
