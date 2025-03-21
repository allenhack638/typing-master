"use client";

import { Button } from "@/components/ui/button";
import { roomState } from "@/store/atoms/roomAtoms";
import { userStateAtom } from "@/store/atoms/userAtoms";
import { useAtomValue } from "jotai";
import { Files, Settings } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import RoomSettingsModal from "./dialog-boxes/roomSettingsModal";

export default function RoomNavbar() {
  const room = useAtomValue(roomState);
  const user = useAtomValue(userStateAtom);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const onCopyRoomName = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(room.name);
      toast("Room name copied to clipboard");
    } catch (error) {
      toast("Failed to copy room name");
    }
  }, [room.name]);

  const roomInfo = useMemo(
    () => `Max Users: ${room.maxUsers} | Current: ${room.users.length}`,
    [room.maxUsers, room.users.length]
  );

  const onOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);
  return (
    <div className="flex justify-between items-center bg-gray-200 px-4 py-2 rounded-t-lg">
      <div className="text-sm font-medium">{roomInfo}</div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">{room.id}</span>
        <Button
          onClick={onCopyRoomName}
          className=" shadow-none !p-0 rounded-md bg-transparent hover:bg-transparent transition-all cursor-pointer text-gray-600 hover:text-black"
        >
          <Files />
        </Button>

        {user?.isAdmin && (
          <Button
            onClick={onOpenSettings}
            className=" shadow-none !p-0 rounded-md bg-transparent hover:bg-transparent transition-all cursor-pointer text-gray-600 hover:text-black "
            disabled={!!room.gameState}
          >
            <Settings />
          </Button>
        )}
      </div>

      {isSettingsOpen && (
        <RoomSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
