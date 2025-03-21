"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function useRoomInfo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const roomName = pathname.split("/").pop() || "";
  const token = searchParams.get("token") || "";

  return { roomName, token };
}
