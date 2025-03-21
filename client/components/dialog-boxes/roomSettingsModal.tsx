"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAtomValue } from "jotai";
import { roomState } from "@/store/atoms/roomAtoms";

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
import { DifficultyLevel } from "@/types/enums";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/constants";
import { toast } from "sonner";
import { useRoomInfo } from "@/hooks/useRoomInfo";
import { RoomState } from "@/types/types";

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoomSettingsModal({
  isOpen,
  onClose,
}: RoomSettingsModalProps) {
  const { roomName, token } = useRoomInfo();

  const room = useAtomValue(roomState);
  const [localRoom, setLocalRoom] = useState(room);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setLocalRoom(room);
  }, [isOpen, room]);

  const handleChange = (
    key: keyof typeof localRoom,
    value: RoomState[keyof RoomState]
  ) => {
    setLocalRoom((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const updatedFields: Partial<typeof localRoom> = {};

      Object.keys(localRoom).forEach((key) => {
        const typedKey = key as keyof typeof localRoom;
        const newValue = localRoom[typedKey];

        if (newValue !== room[typedKey]) {
          updatedFields[typedKey] = newValue as never;
        }
      });
      if (Object.keys(updatedFields).length === 0) return;
      setLoading(true);
      await axios.put(`${BASE_URL}/api/v1/room/${roomName}`, updatedFields, {
        params: { token },
      });
      onClose();
    } catch (error) {
      console.log("Error", error);
      toast("Failed to update the room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>⚙️ Room Settings</DialogTitle>
        </DialogHeader>

        <div className="w-full  flex flex-col gap-5 px-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500">
                Room Name
              </span>
              <span className="text-xs text-gray-500 italic">
                ( Cannot be updated )
              </span>{" "}
            </div>
            <span className="text-gray-500">
              {room.name === "" ? "Loading..." : room.name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Difficulty Level</span>
              <span className="text-xs text-gray-500 italic"></span>
            </div>
            <Select
              value={localRoom.difficulty}
              onValueChange={(value) =>
                handleChange("difficulty", value as DifficultyLevel)
              }
              disabled={loading}
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
              <span className="text-xs text-gray-500 italic max-w-[250px]">
                ( Changing this may remove some users if they exceed the new
                limit )
              </span>
            </div>
            <Input
              type="number"
              value={localRoom.maxUsers}
              min={2}
              max={10}
              onChange={(e) => handleChange("maxUsers", Number(e.target.value))}
              className="w-1/3"
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Enable Chat</span>
            </div>

            <Switch
              checked={localRoom.enableChat}
              onCheckedChange={(value) => handleChange("enableChat", value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500">
                Private Room
              </span>
              <span className="text-xs text-gray-500 italic">
                ( Cannot be updated )
              </span>
            </div>

            <Switch checked={room.privateRoom} disabled />
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-4 w-full">
            <Button onClick={onClose} className="flex-1" disabled={loading}>
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={
                JSON.stringify(room) === JSON.stringify(localRoom) || loading
              }
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
