"use client";

import { roomState } from "@/store/atoms/roomAtoms";
import { userStateAtom } from "@/store/atoms/userAtoms";
import { useAtomValue } from "jotai";
import { ShieldUser, User, UserCheck, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { MessageType, RoomMessage } from "@/types/types";

interface RoomUsersListProps {
  isConnected: boolean;
  sendMessage: (msg: RoomMessage) => void | undefined;
}

export default function RoomUsersList({
  isConnected,
  sendMessage,
}: RoomUsersListProps) {
  const user = useAtomValue(userStateAtom);
  const room = useAtomValue(roomState);

  const handleRemoveUser = async (id: string) => {
    try {
      if (!isConnected) {
        toast("WebSocket is not connected");
        return;
      }

      if (!user || !user.isAdmin) {
        toast("You do not have permission to remove users");
        return;
      }

      sendMessage({
        type: MessageType.RemoveUser,
        payload: { userId: id },
      });
      toast("User removal request sent");
    } catch (error) {
      toast("Failed to remove user");
    }
  };

  if (!user) return <div>Loading ... </div>;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold">Participants</h2>
      <ul className="list-none space-y-3 mt-2">
        {room.users.map((u, index) => (
          <li
            key={index}
            className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border"
          >
            <div className="flex items-center gap-3">
              {u.id === room.admin?.id ? (
                <ShieldUser size={20} className="text-gray-500" />
              ) : (
                <User size={20} className="text-gray-500" />
              )}
              <span className="font-medium">{u.name}</span>
            </div>

            <div>
              {user.isAdmin && u.id !== user.id && (
                <Button
                  onClick={() => handleRemoveUser(u.id)}
                  className="shadow-none !p-0 rounded-md bg-transparent hover:bg-transparent transition-all cursor-pointer text-gray-600 hover:text-black !h-6 w-6"
                  title="Remove user"
                >
                  <UserRoundX />
                </Button>
              )}

              {user.id === u.id && (
                <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                  <UserCheck size={18} />
                  You
                </span>
              )}
              {!user.isAdmin && room.admin?.id === u.id && (
                <span className="flex items-center text-sm font-medium text-gray-500">
                  Admin
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
