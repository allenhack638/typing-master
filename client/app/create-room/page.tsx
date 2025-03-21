"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAtom, useSetAtom } from "jotai";

import { roomState } from "@/store/atoms/roomAtoms";
import { jwtDecode } from "jwt-decode";
import { useEffect, useMemo, useState } from "react";
import { BASE_URL, generateUniqueRoomName } from "@/utils/constants";

import axios from "axios";
import { useRouter } from "next/navigation";
import { DifficultyLevel } from "@/types/enums";
import { userStateAtom } from "@/store/atoms/userAtoms";
import { User } from "@/types/types";
import { toast } from "sonner";

export default function CreateRoom() {
  const router = useRouter();
  const [room, setRoom] = useAtom(roomState);
  const setUser = useSetAtom(userStateAtom);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room.name) {
      setRoom((prev) => ({
        ...prev,
        name: generateUniqueRoomName("Room"),
      }));
    }
  }, [room.name, setRoom]);

  const isMaxUsersValid = useMemo(
    () => room.maxUsers >= 2 && room.maxUsers <= 10,
    [room.maxUsers]
  );

  const handleSubmit = async () => {
    if (!isMaxUsersValid) return;

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/room`, {
        name: room.name,
        userName: generateUniqueRoomName("User"),
        maxUsers: room.maxUsers,
        enableChat: room.enableChat,
        privateRoom: room.privateRoom,
        difficulty: room.difficulty,
      });

      const userToken = response.data.token;
      const userResponse: User = jwtDecode(userToken);
      const roomResponse = response.data.room;

      setRoom(roomResponse);
      setUser(userResponse);

      if (userResponse && roomResponse) {
        router.push(`/room/${response.data.room.id}?token=${userToken}`);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-6 sm:p-10 bg-white shadow-lg rounded-2xl flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          Create Room
        </h1>

        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold w-1/3">Room Name</label>
          <span>{room.name === "" ? "Loading..." : room.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Difficulty Level</span>
            <span className="text-xs text-gray-500 italic">
              (You can change this later)
            </span>
          </div>
          <Select
            value={room.difficulty}
            onValueChange={(value) =>
              setRoom((prev) => ({
                ...prev,
                difficulty: value as DifficultyLevel,
              }))
            }
          >
            <SelectTrigger className="w-1/3">
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
              <SelectItem value="Legend">Legend</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <label className="text-sm font-semibold">Max Users</label>
            <span className="text-xs text-gray-500 italic">
              (You can change this later)
            </span>
          </div>
          <Input
            type="number"
            value={room.maxUsers}
            min={2}
            max={10}
            onChange={(e) =>
              setRoom((prev) => ({ ...prev, maxUsers: Number(e.target.value) }))
            }
            className="w-1/3"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Enable Chat</span>
            <span className="text-xs text-gray-500 italic">
              (You can change this later)
            </span>
          </div>

          <Switch
            checked={room.enableChat}
            onCheckedChange={(value) =>
              setRoom((prev) => ({ ...prev, enableChat: value }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Private Room</span>

          <Switch
            checked={room.privateRoom}
            onCheckedChange={(value) =>
              setRoom((prev) => ({ ...prev, privateRoom: value }))
            }
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={!isMaxUsersValid || loading}
        >
          {loading ? "Creating..." : "Create Room"}
        </Button>
      </div>
    </div>
  );
}
