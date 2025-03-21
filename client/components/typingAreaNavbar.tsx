"use client";

import { useState, useEffect, useMemo } from "react";
import { GameStatus } from "@/types/enums";
import { GameState, RoomMessage, User } from "@/types/types";
import { useAtomValue, useSetAtom } from "jotai";
import { roomState } from "@/store/atoms/roomAtoms";
import { calculateUserPosition } from "@/utils/functions";
import GameScoreboard from "./dialog-boxes/gameScoreboard";
import { userStateAtom } from "@/store/atoms/userAtoms";

interface TypingAreaNavbarProps {
  gameState: Omit<GameState, "progress"> | GameState;
  isConnected?: boolean;
  sendMessage?: (msg: RoomMessage) => void | undefined;
  setGameState?: React.Dispatch<
    React.SetStateAction<Omit<GameState, "progress"> | null>
  >;
}

export default function TypingAreaNavbar({
  gameState,
  sendMessage,
  setGameState,
}: TypingAreaNavbarProps) {
  const setRoom = useSetAtom(roomState);
  const user = useAtomValue(userStateAtom);

  const progress = "progress" in gameState ? gameState.progress : null;
  const { status, startTime, endTime } = gameState;

  const [showResults, setShowResults] = useState(false);

  const [coolingTimeLeft, setCoolingTimeLeft] = useState(0);
  const [timerLeft, setTimerLeft] = useState(0);

  useEffect(() => {
    if (status !== GameStatus.COOLING_PERIOD || !startTime) return;

    const updateCoolingTimer = () => {
      const timeLeft = Math.max(0, Math.floor((startTime - Date.now()) / 1000));
      setCoolingTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);

        if (setGameState) {
          setGameState((prev) =>
            prev ? { ...prev, status: GameStatus.GAME_STARTED } : prev
          );
        } else {
          setRoom((prev) => ({
            ...prev,
            gameState: prev.gameState
              ? { ...prev.gameState, status: GameStatus.GAME_STARTED }
              : null,
          }));
        }
      }
    };

    updateCoolingTimer();
    const interval = setInterval(updateCoolingTimer, 1000);

    return () => clearInterval(interval);
  }, [status, startTime]);

  useEffect(() => {
    if (status !== GameStatus.GAME_STARTED || !endTime || coolingTimeLeft > 0)
      return;

    const updateMainTimer = () => {
      const remainingTime = Math.max(
        0,
        Math.floor((endTime - Date.now()) / 1000)
      );
      setTimerLeft(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(interval);

        if (setGameState) {
          setGameState((prev) =>
            prev ? { ...prev, status: GameStatus.GAME_ENDED } : prev
          );
        } else {
          setRoom((prev) => ({
            ...prev,
            gameState: prev.gameState
              ? { ...prev.gameState, status: GameStatus.GAME_ENDED }
              : null,
          }));
        }

        setShowResults(true);
      }
    };

    updateMainTimer();
    const interval = setInterval(updateMainTimer, 1000);

    return () => clearInterval(interval);
  }, [status, endTime, coolingTimeLeft]);

  // const [coolingTimeLeft, setCoolingTimeLeft] = useState(
  //   Math.max(0, Math.floor((startTime - Date.now()) / 1000))
  // );

  // const [timerLeft, setTimerLeft] = useState(
  //   Math.max(0, Math.floor((endTime - Date.now()) / 1000))
  // );

  // useEffect(() => {
  //   if (status !== GameStatus.COOLING_PERIOD) return;

  //   const interval = setInterval(() => {
  //     const timeLeft = Math.max(0, Math.floor((startTime - Date.now()) / 1000));
  //     setCoolingTimeLeft(timeLeft);

  //     if (timeLeft <= 0) {
  //       if (setGameState) {
  //         setGameState((prev) =>
  //           prev
  //             ? {
  //                 ...prev,
  //                 status: GameStatus.GAME_STARTED,
  //               }
  //             : prev
  //         );
  //       } else {
  //         setRoom((prev) => ({
  //           ...prev,
  //           gameState: prev.gameState
  //             ? { ...prev.gameState, status: GameStatus.GAME_STARTED }
  //             : null,
  //         }));
  //       }
  //     }
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [status, startTime]);

  // useEffect(() => {
  //   if (status !== GameStatus.GAME_STARTED || !endTime) return;

  //   const interval = setInterval(() => {
  //     const remainingTime = Math.max(
  //       0,
  //       Math.floor((endTime - Date.now()) / 1000)
  //     );
  //     setTimerLeft(remainingTime);

  //     if (remainingTime <= 0) {
  //       if (setGameState) {
  //         setGameState((prev) =>
  //           prev
  //             ? {
  //                 ...prev,
  //                 status: GameStatus.GAME_ENDED,
  //               }
  //             : prev
  //         );
  //       } else {
  //         setRoom((prev) => ({
  //           ...prev,
  //           gameState: prev.gameState
  //             ? { ...prev.gameState, status: GameStatus.GAME_ENDED }
  //             : null,
  //         }));
  //       }

  //       setShowResults(true);
  //     }
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [status, endTime]);

  const userPosition = useMemo(
    () =>
      user && progress ? calculateUserPosition(user.id, progress) : undefined,
    [progress, user?.id]
  );

  return (
    <div className="flex items-center justify-between w-full text-black px-4 rounded-md">
      <>
        {status === GameStatus.COOLING_PERIOD && (
          <span className="m-auto text-lg font-semibold">
            Game starting in: {coolingTimeLeft}s
          </span>
        )}

        {status === GameStatus.GAME_STARTED && (
          <span className={`text-lg font-semibold ${setGameState && "m-auto"}`}>
            Time Left: {timerLeft}s
          </span>
        )}

        {status === GameStatus.GAME_ENDED && (
          <span className="m-auto text-lg font-semibold">Game Over</span>
        )}
      </>

      {!setGameState && status === GameStatus.GAME_STARTED && (
        <div className="flex items-center gap-2">
          <span className="text-lg flex gap-1">
            🏆
            <span
              className="hover:underline cursor-pointer"
              onClick={() => {
                setShowResults(true);
              }}
            >
              Position: {userPosition || "NA"}
            </span>
          </span>
        </div>
      )}

      {sendMessage && progress && (
        <GameScoreboard
          showResults={showResults}
          setShowResults={setShowResults}
          progress={progress}
          sendMessage={sendMessage}
        />
      )}
    </div>
  );
}
