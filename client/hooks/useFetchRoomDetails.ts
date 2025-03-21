import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/constants";
import { roomState } from "@/store/atoms/roomAtoms";
import { useAtom, useSetAtom } from "jotai";
import { userStateAtom } from "@/store/atoms/userAtoms";
import { User } from "@/types/types";
import { jwtDecode } from "jwt-decode";
import { useRoomInfo } from "./useRoomInfo";
import { baseRoomState } from "@/store/initialStates";
import { extractAxiosError } from "@/utils/functions";

export function useFetchRoomDetails() {
  const { roomName, token } = useRoomInfo();
  const setUser = useSetAtom(userStateAtom);

  const [room, setRoom] = useAtom(roomState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomName || !token) {
      setError("Missing roomName or userId");
      setLoading(false);
      return;
    }

    if (room && room.id === roomName) {
      setLoading(false);
    } else {
      const fetchRoom = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/v1/room/${roomName}`,
            {
              params: { token },
            }
          );

          const userToken = response.data.user;
          const userResponse: User = jwtDecode(userToken);
          const roomResponse = response.data.room;

          setRoom(roomResponse);
          setUser(userResponse);
        } catch (err) {
          const errorMessage = extractAxiosError(err);
          setError(errorMessage);
          console.log("Failed to fetch room details:", errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchRoom();
    }

    return () => {
      setRoom(baseRoomState);
      setUser(null);
    };
  }, [roomName, token, setRoom, setUser]);

  return { room, loading, error };
}
