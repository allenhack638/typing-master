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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function RoomPage() {
  const router = useRouter();
  const { loading, error } = useFetchRoomDetails();
  const user = useAtomValue(userStateAtom);
  const room = useAtomValue(roomState);
  const {
    isConnected,
    loading: socketLoading,
    sendMessage,
    wsError,
  } = useWebSocket();

  if (socketLoading || loading)
    return (
      <div className="flex justify-center items-center h-screen font-semibold">
        Loading...
      </div>
    );

  if (wsError || error || !isConnected)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-black">
        <div className="p-8 rounded-lg flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg font-semibold mb-4 text-center">
            {!isConnected || wsError ? "Too idle, connection closed." : error}
          </p>
          <Button className="cursor-pointer" onClick={() => router.push("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    );

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
