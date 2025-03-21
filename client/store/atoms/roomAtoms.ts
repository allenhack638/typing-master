import { atom } from "jotai";
import { baseRoomState } from "../initialStates";

export const roomState = atom({
  ...baseRoomState,
});
