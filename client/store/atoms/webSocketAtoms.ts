import { atom } from "jotai";

export const webSocketAtom = atom<WebSocket | null>(null);
export const webSocketLoadingAtom = atom<boolean>(true);
export const webSocketErrorAtom = atom<string | null>(null);
export const webSocketConnectedAtom = atom<boolean>(false);
