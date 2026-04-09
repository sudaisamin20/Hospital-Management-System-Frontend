import { useEffect } from "react";
import { socket } from "../socket/socket";

export const useSocket = (user: { id: string; role: string } | null) => {
  useEffect(() => {
    if (!user?.id || !user?.role) return;

    if (!socket.connected) {
      socket.connect();
      console.log(`Socket connected as ${user.role}`);
    }

    socket.emit("join", { role: user.role, id: user.id });

    socket.io.opts.reconnection = true;
    socket.io.opts.reconnectionAttempts = Infinity;
    socket.io.opts.reconnectionDelay = 1000;

    // DO NOT disconnect in cleanup
    // socket.disconnect() should only run on logout
  }, [user?.id, user?.role]);
};

// export const useSocket = (user: { id: string; role: string } | null) => {
//   useEffect(() => {
//     if (!user?.id || !user?.role) return;

//     socket.connect();

//     socket.emit("join", {
//       role: user.role,
//       id: user.id,
//     });

//     console.log(`Socket connected as ${user.role}`);

//     return () => {
//       socket.disconnect();
//       console.log("Socket disconnected");
//     };
//   }, [user?.id, user?.role]);
// };
