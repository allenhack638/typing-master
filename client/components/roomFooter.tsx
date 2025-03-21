"use client";

import { Button } from "@/components/ui/button";
import { roomState } from "@/store/atoms/roomAtoms";
import { userStateAtom } from "@/store/atoms/userAtoms";
import { GameStatus } from "@/types/enums";
import { MessageType, RoomMessage } from "@/types/types";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";

interface RoomFooterProps {
  isConnected: boolean;
  sendMessage: (msg: RoomMessage) => void | undefined;
}

export default function RoomFooter({
  isConnected,
  sendMessage,
}: RoomFooterProps) {
  const router = useRouter();
  const user = useAtomValue(userStateAtom);
  const room = useAtomValue(roomState);

  const leaveRoom = () => {
    if (isConnected) {
      sendMessage({ type: MessageType.LeaveRoom });
    }

    router.push("/");
  };

  const startGame = () => {
    if (isConnected) {
      sendMessage({ type: MessageType.StartGame });
    }
  };

  const abortGame = () => {
    if (isConnected) {
      sendMessage({ type: MessageType.AbortGame });
    }
  };

  if (!user || !isConnected) {
    return <div>Loading ...</div>;
  }

  return (
    <div className="flex justify-between w-full mt-4 gap-3">
      {user.isAdmin && !room.gameState && (
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all text-ellipsis overflow-hidden whitespace-nowrap"
          onClick={startGame}
          title={
            room.users.length <= 1
              ? "At least 2 players are required to start the game"
              : "Start Game"
          }
          disabled={room.users.length <= 1}
        >
          Start Game {room.users.length <= 1 && "( Min. 2 required)"}
        </Button>
      )}

      {user.isAdmin && room.gameState && (
        <Button onClick={abortGame} className="flex-1">
          Abort Game
        </Button>
      )}

      <Button
        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
        onClick={leaveRoom}
        disabled={!isConnected}
      >
        Leave Room
      </Button>
    </div>
  );
}
