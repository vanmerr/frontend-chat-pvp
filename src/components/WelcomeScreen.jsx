import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { FaHandSparkles } from "react-icons/fa";
import { useState, useEffect } from 'react';

const EMOJIS = ['💬', '✨', '🔥', '🎉', '😊', '🚀', '💡', '🎮', '💻', '🌟', '💫', '🎊', '🎁', '🎈', '🎵', '🎶', '📣', '📢'];

function getRandomPosition() {
  return {
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  };
}

function getRandomMovement() {
  return {
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
  };
}

const FloatingEmoji = ({ emoji, index }) => {
  const [pos, setPos] = useState(getRandomPosition());
  const movement = getRandomMovement();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPos(getRandomPosition());
    }, 5000); // Change position every 5 seconds

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, []);

  return (
    <motion.div
      className="absolute text-2xl select-none pointer-events-none"
      style={{ top: pos.top, left: pos.left, zIndex: 0 }}
      animate={{
        x: [0, movement.x, -movement.x, 0],
        y: [0, movement.y, -movement.y, 0],
      }}
      transition={{
        duration: 10 + index,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.div>
  );
};

function WelcomeScreen() {
  return (
    <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Emoji bay xung quanh */}
      {EMOJIS.map((emoji, index) => (
        <FloatingEmoji key={index} emoji={emoji} index={index} />
      ))}

      {/* Nội dung trung tâm */}
      <motion.div
        className="text-center z-10 max-w-md px-6 py-10 bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-200"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="flex justify-center mb-4"
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, -10, 10, -10, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
        >
          <FaHandSparkles className="w-10 h-10 text-indigo-500" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to <span className="text-indigo-600">Chat PVP</span>
        </h2>
        <p className="text-gray-600 text-lg">
          Select a room to start chatting <br /> or create a new one
        </p>
      </motion.div>
    </div>
  );
}

export default WelcomeScreen;
