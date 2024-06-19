import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000000,
        transports: ['websocket'],
    };
    return io(process.env.REACT_APP_BACKEND_URL || 'http://192.168.92.71:5000', options);
};