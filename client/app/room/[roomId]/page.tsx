"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useFetchRoomDetails } from "@/hooks/useFetchRoomDetails";
import { useAtomValue } from "jotai";
import { roomState } from "@/store/atoms/roomAtoms";
import { userStateAtom } from "@/store/atoms/userAtoms";
import RoomNavbar from "@/components/roomNavbar";
import RoomFooter from "@/components/roomFooter";
import RoomUsersList from "@/components/roomUsersList";
import TypingArea from "@/components/typingArea";

export default function RoomPage() {
  const { loading, error } = useFetchRoomDetails();
  const user = useAtomValue(userStateAtom);
  const room = useAtomValue(roomState);
  const { isConnected, loading: socketLoading, sendMessage } = useWebSocket();

  if (socketLoading || loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">{error}</div>
    );
  console.log("room", room);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg">
        <RoomNavbar />

        <div className="p-6">
          {user && !room.gameState && (
            <RoomUsersList
              isConnected={isConnected}
              sendMessage={sendMessage}
            />
          )}

          {user && room.gameState && (
            <TypingArea
              isConnected={isConnected}
              sendMessage={sendMessage}
              gameState={room.gameState}
              user={user}
            />
          )}

          <RoomFooter isConnected={isConnected} sendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
}
