import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function useSocket(phone, role) {
  const socketRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!phone) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const onConnect = () => {
      socket.emit('join', { phone, role });
      setReady(true);
    };

    socket.on('connect', onConnect);
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.disconnect();
      socketRef.current = null;
      setReady(false);
    };
  }, [phone, role]);

  return { socketRef, ready };
}
