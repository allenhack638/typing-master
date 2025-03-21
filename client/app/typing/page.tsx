"use client";
import { DifficultyLevel } from "@/types/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameState } from "@/types/types";
import axios from "axios";
import { BASE_URL } from "@/utils/constants";
import TypingArea from "@/components/typingArea";

function Page() {
  const [difficulty, setDifficulty] = useState(DifficultyLevel.BEGINNER);
  const [loading, setLoading] = useState(false);

  const [gameState, setGameState] = useState<Omit<
    GameState,
    "progress"
  > | null>(null);

  const onHandleStartGame = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/v1/templates/${difficulty}`
      );
      setGameState(response.data.data);
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Start Typing
        </h1>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Difficulty:
            </label>
            <Select
              value={difficulty}
              onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
            >
              <SelectTrigger className="w-full border-gray-300 shadow-sm">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent className="w-full bg-white shadow-md rounded-lg">
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
                <SelectItem value="Legend">Legend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full cursor-pointer text-white py-2 rounded-lg transition duration-200 shadow-md "
            onClick={onHandleStartGame}
            disabled={loading}
          >
            {loading ? "Starting game.." : "Start Game"}
          </Button>
        </div>
      </div>

      {/* Typing Area */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 mt-6 text-center">
        {gameState ? (
          <TypingArea gameState={gameState} setGameState={setGameState} />
        ) : (
          <p className="text-gray-500">
            Click "Start Game" to begin practicing.
          </p>
        )}
      </div>
    </div>
  );
}

export default Page;
