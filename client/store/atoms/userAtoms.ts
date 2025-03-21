import { User } from "@/types/types";
import { atom } from "jotai";

export const userStateAtom = atom<User | null>(null);
