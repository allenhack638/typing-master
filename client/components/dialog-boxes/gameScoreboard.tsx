"use client";

import React, { useCallback, useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";
import { useAtomValue } from "jotai";
import { userStateAtom } from "@/store/atoms/userAtoms";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { roomState } from "@/store/atoms/roomAtoms";
import { MessageType, Progress, RoomMessage } from "@/types/types";
import { GameStatus } from "@/types/enums";

function GameScoreboard({
  showResults,
  progress,
  setShowResults,
  sendMessage,
}: {
  showResults: boolean;
  progress: Progress;
  setShowResults: (value: boolean) => void;
  sendMessage: (msg: RoomMessage) => void | undefined;
}) {
  const router = useRouter();
  const user = useAtomValue(userStateAtom);
  const room = useAtomValue(roomState);

  const sortedLeaderboard = useMemo(() => {
    return room.users
      .map(({ id, name }) => ({
        userId: id,
        userName: name,
        percentage: ((progress[id]?.percentage || 0) * 100).toFixed(2),
        timeTaken: progress[id]?.timeTaken ?? null,
      }))
      .sort((a, b) => {
        if (Number(b.percentage) !== Number(a.percentage)) {
          return Number(b.percentage) - Number(a.percentage);
        }
        return (a.timeTaken ?? Infinity) - (b.timeTaken ?? Infinity);
      });
  }, [progress, room.users]);

  const userPosition = useMemo(
    () => sortedLeaderboard.findIndex((player) => player.userId === user?.id),
    [sortedLeaderboard, user?.id]
  );

  const allUsersAtZero = sortedLeaderboard.every(
    (player) => Number(player.percentage) === 0
  );

  const handleLeaveGroup = useCallback(() => {
    sendMessage({ type: MessageType.LeaveRoom });
    router.push("/");
  }, [sendMessage, router]);

  const handleBackToLobby = useCallback(() => {
    sendMessage({ type: MessageType.AbortGame });
    setShowResults(false);
  }, [sendMessage, setShowResults]);

  if (!user) return null;

  const gameStatus = room?.gameState?.status;
  const isGameRunning = gameStatus === GameStatus.GAME_STARTED;
  const isGameEnded = gameStatus === GameStatus.GAME_ENDED;

  return (
    <Dialog open={showResults}>
      <DialogContent
        className="pointer-events-auto [&>button]:hidden"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {" "}
            {isGameRunning ? "📊 Live Scoreboard" : "🏆 Game Results"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {sortedLeaderboard.length > 0 ? (
            sortedLeaderboard.map((player, index) => (
              <div
                key={player.userId}
                className={clsx(
                  "flex justify-between px-4 py-2 border-b rounded-md",
                  player.userId === user.id
                    ? "bg-yellow-100 font-bold text-black"
                    : "bg-white"
                )}
              >
                <span className="font-semibold">
                  {index + 1}. {player.userId}
                </span>
                <span>
                  {player.percentage}% -{" "}
                  {player.timeTaken ? `${player.timeTaken} s` : "Not started"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No progress recorded</p>
          )}
        </div>

        {isGameRunning ? (
          <div className="text-center font-semibold text-md text-gray-600">
            Keep typing! The race is still on.
          </div>
        ) : allUsersAtZero ? (
          <div className="text-center font-semibold text-md text-gray-600">
            The race never began! Looks like no one started typing.
          </div>
        ) : (
          userPosition !== -1 && (
            <div className="text-center font-semibold text-lg">
              🎉 You finished in position {userPosition + 1}!
            </div>
          )
        )}
        {/* <DialogFooter>
          {!user.isAdmin ? (
            <div className="flex flex-col items-center gap-1 w-full">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
              <span className="text-[12px] text-gray-600 text-center">
                ⚠️ The admin can start a new game. Please wait or rejoin later.
              </span>
            </div>
          ) : (
            <div className="flex justify-between w-full gap-3">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
              <Button className="flex-1" onClick={handleBackToLobby}>
                Back to Lobby
              </Button>
            </div>
          )}
        </DialogFooter> */}

        <DialogFooter>
          {isGameRunning ? (
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
              onClick={() => setShowResults(false)}
            >
              Close
            </Button>
          ) : !user.isAdmin ? (
            <div className="flex flex-col items-center gap-1 w-full">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
              <span className="text-[12px] text-gray-600 text-center">
                ⚠️ The admin can start a new game. Please wait or rejoin later.
              </span>
            </div>
          ) : (
            <div className="flex justify-between w-full gap-3">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
              <Button className="flex-1" onClick={handleBackToLobby}>
                Back to Lobby
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GameScoreboard;
