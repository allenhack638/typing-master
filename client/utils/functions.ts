import { Progress } from "@/types/types";
import { AxiosError } from "axios";

export function calculateUserPosition(userId: string, progress: Progress) {
  const sortedPlayers = Object.entries(progress).sort(
    (
      [, { percentage: progressA, timeTaken: timeA }],
      [, { percentage: progressB, timeTaken: timeB }]
    ) => {
      if (progressB !== progressA) {
        return progressB - progressA;
      }
      return (timeA ?? Infinity) - (timeB ?? Infinity);
    }
  );

  const position = sortedPlayers.findIndex(([id]) => id === userId) + 1;
  return position || null;
}

export function extractAxiosError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      return (
        error.response.data?.error ||
        `Error ${error.response.status}: ${error.response.statusText}`
      );
    } else if (error.request) {
      return "No response from server. Please check your connection.";
    } else {
      return error.message || "An unexpected error occurred.";
    }
  }
  return "An unknown error occurred.";
}
