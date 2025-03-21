"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowBigRight, ArrowLeft, Keyboard, Users } from "lucide-react";
import JoinRoom from "@/components/joinRoom";
import AvailableRooms from "@/components/availableRooms";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [showRooms, setShowRooms] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 sm:p-10 bg-white shadow-lg rounded-2xl flex flex-col gap-5 items-center">
        {!showRooms ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              Typing Master
            </h1>
            <Button
              onClick={() => router.push("/typing")}
              className="w-full cursor-pointer flex items-center gap-2"
            >
              <Keyboard size={20} />
              Start Typing
            </Button>
            <Button
              className="w-full cursor-pointer flex items-center gap-2"
              onClick={() => router.push("/create-room")}
            >
              <Users size={20} />
              Create Room
            </Button>

            <Button
              className="w-full cursor-pointer flex items-center gap-2"
              onClick={() => setShowRooms((prev) => !prev)}
            >
              <ArrowBigRight size={20} />
              Available Rooms
            </Button>
            <JoinRoom />
          </>
        ) : (
          <div className="w-full flex flex-col items-center h-[250px] relative">
            <Button
              onClick={() => setShowRooms(false)}
              className="absolute left-0 cursor-pointer flex items-center bg-transparent shadow-none text-gray-900 hover:bg-slate-100 rounded-full w-7 h-7"
            >
              <ArrowLeft size={20} />
            </Button>

            <h1 className="text-xl font-bold text-center">Available Rooms</h1>

            <AvailableRooms />
          </div>
        )}
      </div>
    </div>
  );
}
