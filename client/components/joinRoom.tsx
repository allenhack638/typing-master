"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { BASE_URL, generateUniqueRoomName } from "@/utils/constants";
import { useSetAtom } from "jotai";
import { roomState } from "@/store/atoms/roomAtoms";
import { userStateAtom } from "@/store/atoms/userAtoms";
import { toast } from "sonner";
import { User } from "@/types/types";
import { jwtDecode } from "jwt-decode";

const JoinRoom = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);

  const setRoom = useSetAtom(roomState);
  const setUser = useSetAtom(userStateAtom);

  const fetchRoom = async () => {
    if (!roomId) {
      toast("Please enter a valid roomId");
    }

    setLoading(true);

    try {
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
    <div className="flex gap-2 w-full">
      <Input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="flex-1"
      />
      <Button
        onClick={fetchRoom}
        className="flex items-center gap-2 cursor-pointer w-20"
        disabled={loading || roomId.trim().length === 0}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <LogIn size={20} />
            Join
          </>
        )}
      </Button>
    </div>
  );
};

export default JoinRoom;
