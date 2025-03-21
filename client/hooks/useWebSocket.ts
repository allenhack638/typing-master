import { useEffect, useState, useRef } from "react";
import { W_BASE_URL } from "@/utils/constants";
import { roomState } from "@/store/atoms/roomAtoms";
import { toast } from "sonner";
import { userStateAtom } from "@/store/atoms/userAtoms";
import { useRouter, useSearchParams } from "next/navigation";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { RoomMessage } from "@/types/types";

export function useWebSocket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user] = useAtom(userStateAtom);
  const setRoom = useSetAtom(roomState);

  const socketRef = useRef<WebSocket | null>(null);
  const room = useAtomValue(roomState);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (socketRef.current || !room.id || !token) return;

    setLoading(true);
    setError(null);

    const ws = new WebSocket(
      `${W_BASE_URL}/auth?roomName=${room.id}&token=${token}`
    );

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket Connected");
      setIsConnected(true);
      setLoading(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Message Received:", data);

        const type = data.type;
        const payload = data.payload;

        switch (type) {
          case "user-joined":
            toast(`👤 ${payload.user.name} joined the room.`);
            setRoom((prev) => ({
              ...prev,
              users: [...prev.users, payload.user],
            }));
            break;

          case "leave-room":
            toast(`👤 ${payload.userId} left the room.`);
            setRoom((prev) => ({
              ...prev,
              users: prev.users.filter((u) => u.id !== payload.userId),
            }));
            break;

          case "remove-user":
            toast(payload.message);
            if (user?.id === payload.userId) {
              setRoom((prev) => ({ ...prev, id: null, users: [] }));
              router.push(`/`);
            } else {
              setRoom((prev) => ({
                ...prev,
                users: prev.users.filter((u) => u.id !== payload.userId),
              }));
            }
            break;

          case "start-game":
            setRoom((prev) => ({
              ...prev,
              gameState: payload.gameState,
            }));
            break;

          case "abort-game":
            setRoom((prev) => ({
              ...prev,
              gameState: null,
            }));
            break;

          case "room-update":
            toast("Room details updated..");
            setRoom((prevRoom) => ({
              ...prevRoom,
              ...payload.updatedFields,
            }));
            break;

          case "typing-update":
            setRoom((prev) => {
              if (!prev.gameState) return prev;

              return {
                ...prev,
                gameState: {
                  ...prev.gameState,
                  progress: {
                    ...prev.gameState.progress,
                    [payload.userId]: {
                      percentage: payload.percentage,
                      timeTaken: payload.timeTaken,
                    },
                  },
                },
              };
            });
            break;

          case "chat":
            setRoom((prev) => {
              if (!prev.gameState?.chatMessages) return prev;

              return {
                ...prev,
                gameState: {
                  ...prev.gameState,
                  chatMessages: [
                    ...prev.gameState.chatMessages,
                    payload.chatMessage,
                  ],
                },
              };
            });
            break;

          default:
            console.warn("⚠️ Unknown message type:", data);
        }
      } catch (err) {
        console.error("❌ Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("⚠️ WebSocket Error:", err);
      setError("WebSocket encountered an error.");
      setLoading(false);
    };

    ws.onclose = (data) => {
      console.log("❌ WebSocket Disconnected", data);
      setIsConnected(false);
      setLoading(false);
      socketRef.current = null;
    };

    return () => {
      if (socketRef.current) {
        console.log("Closing the connections!!!");
        socketRef.current.close();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [room.id, token]);

  return {
    isConnected,
    loading,
    wsError: error,
    sendMessage: (msg: RoomMessage) =>
      socketRef.current?.send(JSON.stringify(msg)),
  };
}
