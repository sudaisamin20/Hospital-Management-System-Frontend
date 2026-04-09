import { useEffect } from "react";
import { socket } from "../socket/socket";

export const useSocketEvent = (eventName: string, handler: any) => {
  useEffect(() => {
    if (!handler) return;
    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, handler]);
};
