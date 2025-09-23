import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url, token) => {
    const [lastMessage, setLastMessage] = useState(null);
    const [readyState, setReadyState] = useState(WebSocket.CLOSED);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    useEffect(() => {
        if (!token) {
            if (wsRef.current) {
                wsRef.current.close();
            }
            return;
        }

        const connect = () => {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log('WebSocket Connected');
                setReadyState(WebSocket.OPEN);
                clearTimeout(reconnectTimeoutRef.current);
            };

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket Disconnected', event.code, event.reason);
                setReadyState(WebSocket.CLOSED);
                // Attempt to reconnect if the closure was not intentional (e.g., code 1000 is normal)
                if (event.code !== 1000) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Attempting to reconnect...');
                        connect();
                    }, 3000); // Wait 3 seconds before reconnecting
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
                setReadyState(WebSocket.CLOSED);
                wsRef.current.close();
            };
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }
            clearTimeout(reconnectTimeoutRef.current);
        };
    }, [url, token]);

    const sendMessage = (message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open. Message not sent.');
        }
    };

    return { lastMessage, readyState, sendMessage };
};

export default useWebSocket;
