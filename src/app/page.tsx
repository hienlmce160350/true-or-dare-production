"use client";

import {
  initializeSignalRConnection,
  setupSignalREventHandlers,
  useGameStore,
} from "@/lib/signalr-connection";
import MainMenuGame from "../components/main-menu/page";
import { useEffect, useState } from "react";
import { Button, Container, Typography } from "@mui/material";
import { m } from "framer-motion";
import MotionContainer from "@/components/animate/motion-container";
import { varBounce } from "@/components/animate/variant/bounce";
import MaintenanceIllustration from "@/assets/illustrations/maintenance-illustration";

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
          "Kết nối đến máy chủ thất bại. Vui lòng thử lại sau."
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
          <h1 className="text-2xl font-bold mb-4 text-white">
            Kết nối đến Server...
          </h1>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex h-fit flex-col items-center justify-center p-4 bg-white rounded-md">
        <Container component={MotionContainer} sx={{ textAlign: "center" }}>
          <m.div variants={varBounce().in}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Kết nối thất bại
            </Typography>
          </m.div>

          <m.div variants={varBounce().in}>
            <Typography sx={{ color: "text.secondary" }}>
              {connectionError}
            </Typography>
          </m.div>

          <m.div variants={varBounce().in}>
            <MaintenanceIllustration
              sx={{
                height: 260,
                my: { xs: 5, sm: 10 },
              }}
            />
          </m.div>

          <m.div variants={varBounce().in} className="mt-2">
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Kết nối lại
            </Button>
          </m.div>
        </Container>
      </div>
    );
  }

  return <MainMenuGame />;
}
