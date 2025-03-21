"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GameStatus } from "@/types/enums";
import { GameState, MessageType, RoomMessage, User } from "@/types/types";
import TypingAreaNavbar from "./typingAreaNavbar";
import { Input } from "./ui/input";

interface TypingAreaProps {
  gameState: Omit<GameState, "progress"> | GameState;
  user?: User;
  isConnected?: boolean;
  sendMessage?: (msg: RoomMessage) => void | undefined;
  setGameState?: React.Dispatch<
    React.SetStateAction<Omit<GameState, "progress"> | null>
  >;
}

export default function TypingArea({
  isConnected,
  sendMessage,
  gameState,
  user,
  setGameState,
}: TypingAreaProps) {
  const { textContent, status } = gameState;

  const words = useMemo(() => textContent.split(" "), [textContent]);

  const [inputValue, setInputValue] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  useEffect(() => {
    if (status !== GameStatus.GAME_STARTED) {
      setInputValue("");
      setCurrentWordIndex(0);
    }

    if (inputValue.trim() === words[currentWordIndex]) {
      if (sendMessage && user) {
        sendMessage({
          type: MessageType.TypingUpdate,
          payload: {
            userId: user.id,
            percentage: (currentWordIndex + 1) / words.length,
            timeTaken: gameState.startTime
              ? (Date.now() - gameState.startTime) / 1000
              : 0,
          },
        });
      } else if (setGameState) {
        if (words.length - 1 === currentWordIndex) {
          setGameState((prev) =>
            prev ? { ...prev, status: GameStatus.GAME_ENDED } : prev
          );
        }
      }

      setInputValue("");
      setCurrentWordIndex((prev) => prev + 1);
    }
  }, [inputValue, currentWordIndex, words, sendMessage, status, user?.id]);

  return (
    <div
      className="flex flex-col items-center gap-4 p-6 bg-gray-100 rounded-lg shadow-md w-full"
      onContextMenu={(e) => e.preventDefault()}
    >
      <TypingAreaNavbar
        isConnected={isConnected}
        gameState={gameState}
        sendMessage={sendMessage}
        setGameState={setGameState}
      />

      {status === GameStatus.GAME_STARTED && (
        <div className="text-lg text-gray-700 font-medium text-center flex flex-wrap justify-center max-w-full break-words">
          {words.map((word, index) => (
            <span
              key={index}
              className={`mr-2 ${
                index < currentWordIndex
                  ? "text-green-500"
                  : index === currentWordIndex
                  ? "text-black underline"
                  : "text-gray-400"
              }`}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {status === GameStatus.GAME_STARTED && (
        <div className="w-full flex flex-col items-center">
          <Input
            type="text"
            className={`w-full p-2 border rounded-md text-lg font-medium focus:outline-none focus:ring-1 placeholder:text-gray-400`}
            value={inputValue}
            onChange={handleInputChange}
            autoFocus
            disabled={currentWordIndex >= words.length}
            placeholder={
              currentWordIndex >= words.length
                ? "You’ve finished! Waiting for others..."
                : "Type here"
            }
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
        </div>
      )}
    </div>
  );
}
