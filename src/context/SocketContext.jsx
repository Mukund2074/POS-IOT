import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socketIsOn, setSocketIsOn] = useState(null);
    const [socket2IsOn, setSocket2IsOn] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('auth_token'));

    useEffect(() => {
        const url = `${process.env.REACT_APP_URL}`;
        const url2 = `${process.env.REACT_APP_URL2}`;
        let ws = null;
        if (token) {
            ws = io(url, {
                transports: ['websocket', 'polling'],
                path: '/api/v1/sio',
                forceNew: true,
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 2000,
                auth: { token: token },
            });

            setSocketIsOn(ws);

            ws.on('connect', () => {
                setIsConnected(true);
                console.log('[SocketContext] Socket1 connected successfully');
            });

            ws.on('disconnect', () => {
                setIsConnected(false);
            });
        } else {
            setSocketIsOn(null);
            setIsConnected(false);
        }

        const ws2 = io(url2, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: { token: token },
        });

        ws2.on('connect', () => {
            setSocket2IsOn(ws2);
        });

        ws2.on('auth-error', (data) => {
            console.error('Socket authentication error:', data);
        });

        return () => {
            if (ws) ws.disconnect();
            if (ws2) ws2.disconnect();
        };
    }, [token]);

    useEffect(() => {
        const checkToken = () => {
            const newToken = localStorage.getItem('auth_token');
            if (newToken !== token) {
                setToken(newToken);
            }
        };

        const interval = setInterval(checkToken, 1000);
        const handleStorageChange = (e) => {
            if (e.key === 'auth_token') checkToken();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [token]);

    // Function to join a specific payment room (now optional since backend auto-joins socket to its own room)
    const joinPaymentRoom = (paymentReference) => {
        if (socket2IsOn && isConnected) {
            socket2IsOn.emit('join-room', paymentReference);
        }
    };

    // Function to leave a specific payment room
    const leavePaymentRoom = (paymentReference) => {
        if (socket2IsOn && isConnected) {
            socket2IsOn.emit('leave-room', paymentReference);
        }
    };

    return (
        <SocketContext.Provider
            value={{
                socketIsOn,
                socket2IsOn,
                isConnected,
                joinPaymentRoom,
                leavePaymentRoom,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
