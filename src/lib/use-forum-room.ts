"use client";

import { useEffect } from "react";
import { getSocket } from "./socket-client";

// Join 1 room khi component mount, tu dong leave khi unmount/doi room.
export function useForumRoom(room: string | null) {
  useEffect(() => {
    if (!room) return;
    const socket = getSocket();
    socket.emit("join", room);
    return () => {
      socket.emit("leave", room);
    };
  }, [room]);
}
