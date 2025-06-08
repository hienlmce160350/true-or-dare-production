"use client";

import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from "react";
import { CircularProgress, Box, Button, Alert } from "@mui/material";
import { initializeSignalRConnection, setupSignalREventHandlers, useGameStore, ConnectionState } from "@/lib/signalr-connection";

interface SignalRContextType {
  isConnected: boolean;
  isConnecting: boolean;
  reconnect: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType>({
  isConnected: false,
  isConnecting: false,
  reconnect: async () => {},
});

export const useSignalR = () => useContext(SignalRContext);

interface SignalRProviderProps {
  children: ReactNode;
  serverUrl: string;
}

export default function SignalRProvider({ children, serverUrl }: SignalRProviderProps) {
  const [isConnecting, setIsConnecting] = useState(false); // Start as false to avoid server rendering
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const setConnection = useGameStore((state) => state.setConnection);
  const connectionState = useGameStore((state) => state.connectionState);

  const connectToSignalR = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const connection = await initializeSignalRConnection(serverUrl);
      setupSignalREventHandlers(connection);
      setConnection(connection);
      setIsConnecting(false);
    } catch (error) {
      console.error("Failed to connect to SignalR:", error);
      setConnectionError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      setIsConnecting(false);
    }
  }, [serverUrl, setConnection]);

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      connectToSignalR();
    }
  }, [connectToSignalR]);

  // Avoid rendering loading or error states during SSR
  if (typeof window === "undefined") {
    return <>{children}</>; // Render children directly on server
  }

  if (isConnecting) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <CircularProgress size={40} />
        <Box sx={{ mt: 2 }}>Đang kết nối đến máy chủ...</Box>
      </Box>
    );
  }

  if (connectionError) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", p: 2 }}>
        <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 500 }}>
          {connectionError}
        </Alert>
        <Button variant="contained" onClick={connectToSignalR}>
          Thử lại
        </Button>
      </Box>
    );
  }

  return <SignalRContext.Provider value={{ isConnected: connectionState === ConnectionState.Connected, isConnecting, reconnect: connectToSignalR }}>{children}</SignalRContext.Provider>;
}