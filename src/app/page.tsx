"use client";

import {
  initializeSignalRConnection,
  setupSignalREventHandlers,
  useGameStore,
} from "@/lib/signalr-connection";
import MainMenuGame from "../components/main-menu/page";
import { useEffect, useState } from "react";

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const setConnection = useGameStore((state) => state.setConnection);

  useEffect(() => {
    const connectToSignalR = async () => {
      try {
        // Replace with your actual SignalR hub URL
        const serverUrl =
          process.env.NEXT_PUBLIC_HOST_API || "https://your-signalr-server.com";
        const connection = await initializeSignalRConnection(serverUrl);

        // Set up event handlers
        setupSignalREventHandlers(connection);

        // Store connection in global state
        setConnection(connection);
        setIsConnecting(false);
      } catch (error) {
        console.error("Failed to connect to SignalR:", error);
        setConnectionError(
          "Failed to connect to the game server. Please try again later."
        );
        setIsConnecting(false);
      }
    };

    connectToSignalR();
  }, [setConnection]);

  if (isConnecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Kết nối đến Server...
          </h1>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
          <p className="text-red-500 mb-4">{connectionError}</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Kết nối lại
          </button>
        </div>
      </div>
    );
  }

  return <MainMenuGame />;
}
