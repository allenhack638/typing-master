import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  BASE_URL,
  generateUniqueRoomName,
  W_BASE_URL,
} from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { roomState } from "@/store/atoms/roomAtoms";
import { userStateAtom } from "@/store/atoms/userAtoms";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types/types";

interface Room {
  name: string;
  users: number;
  maxUsers: number;
}

export default function AvailableRooms() {
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);

  const setRoom = useSetAtom(roomState);
  const setUser = useSetAtom(userStateAtom);
  const [loading, setLoading] = useState(false);

  console.log(W_BASE_URL);

  useEffect(() => {
    const ws = new WebSocket(`${W_BASE_URL}/check`);

    ws.onopen = () => {
      console.log("✅ Connected to Public WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const type = data.type;
        const payload = data.payload;
        if (type === "rooms") {
          setRooms(payload.rooms);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("❌ Public WebSocket Disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchRoom = async (roomId: string) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/api/v1/room/join/${roomId}`,
        {
          params: { userId: generateUniqueRoomName("User") },
        }
      );
      const userToken = response.data.user;

      const userResponse: User = jwtDecode(userToken);
      const roomResponse = response.data.room;

      setRoom(roomResponse);
      setUser(userResponse);

      if (userResponse && roomResponse) {
        router.push(`/room/${roomResponse.id}?token=${userToken}`);
      }
    } catch (err) {
      toast("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {rooms.length === 0 ? (
        <p className="text-gray-500 text-center">No available rooms</p>
      ) : (
        <ul className="space-y-2 w-full h-full overflow-y-auto py-3 [&::-webkit-scrollbar]:hidden flex-1">
          {rooms.map((room, index) => (
            <li
              key={index}
              className="flex justify-between items-center py-2 px-3 bg-white rounded-md shadow-sm border border-gray-200"
            >
              <span className="text-sm font-medium text-gray-700">
                Room: {room.name}
              </span>
              <span className="text-sm text-gray-600">
                {room.users} / {room.maxUsers}
              </span>
              <Button
                className="ml-3 h-8 px-4 text-sm font-medium cursor-pointer"
                onClick={() => fetchRoom(room.name)}
              >
                Join
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
