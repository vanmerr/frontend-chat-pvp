import React from 'react';

const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;

const linkifyText = (text, isOwn) => {
  const parts = [];
  let lastIndex = 0;

  text.replace(urlRegex, (url, _group, _protocol, offset) => {
    // Push plain text before the link
    if (lastIndex < offset) {
      parts.push(text.slice(lastIndex, offset));
    }

    // Push link
    parts.push(
      <a
        key={offset}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline ${isOwn ? "text-white hover:text-gray-300" : "text-blue-500 hover:text-blue-700"} transition-colors`}
      >
        {url}
      </a>
    );

    lastIndex = offset + url.length;
    return url;
  });

  // Push remaining plain text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

export default linkifyText;
