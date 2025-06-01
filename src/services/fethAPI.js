import axios from 'axios';

// Dùng import.meta.env cho Vite
const API_URL = `${import.meta.env.VITE_API_URI}/api/v1`;

export const fetchAPI = async (endpoint, method = 'GET', data = null, config = {}) => {
    const reqConfig = {
        url: `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
        method: method.toLowerCase(),
        ...config
    };
    if (data) {
        if (method.toUpperCase() === 'GET') {
            reqConfig.params = data;
        } else {
            reqConfig.data = data;
        }
    }
    const response = await axios(reqConfig);
    return response.data;
};

export const verifyFirebaseToken = async (idToken) => {
    const response = await fetchAPI('auth/verify-firebase-token', 'POST', { idToken });
    return response;
};

export const createRoom = async (roomData) => {
    const response = await fetchAPI('room/create', 'POST', roomData);
    return response.room;
};

export const getAllRooms = async () => {
    const response = await fetchAPI('room', 'GET');
    return response.rooms;
};

export const getRoomById = async (roomId) => {
    const response = await fetchAPI(`room/${roomId}`, 'GET');
    return response.room;
};

export const deleteRoom = async (roomId, userId) => {
    const response = await fetchAPI(`room/${roomId}`, 'DELETE', { userId });
    return response;
};

// Message API
export const sendMessage = async (roomId, { text, sender, files }) => {
    // Nếu có file, gửi dạng multipart/form-data
    if (files && files.length > 0) {
        const formData = new FormData();
        if (text) formData.append('text', text);
        formData.append('sender', JSON.stringify(sender));
        files.forEach(file => formData.append('files', file));
        const response = await axios.post(`${API_URL}/message/${roomId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.message;
    } else {
        // Không có file, gửi JSON bình thường
        const response = await fetchAPI(`message/${roomId}`, 'POST', { text, sender });
        return response.message;
    }
};

export const updateParticipants = async (roomId, userId, action) => {
    const response = await fetchAPI(`room/${roomId}/participants`, 'PUT', { userId, action });
    return response;
};

export const getMessages = async (roomId, limit = 50) => {
    const response = await fetchAPI(`message/${roomId}`, 'GET', { limit });
    return response.messages;
};


