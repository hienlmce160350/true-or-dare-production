import { CommonAPIErrors } from "@/api/common/types/common-errors";
import * as signalR from "@microsoft/signalr";
import { create } from "zustand";
import { Event } from "@/types/event/event";

// Types for our game
export interface Player {
  playerId: string;
  playerName: string;
}

export interface Question {
  questionId: string;
  questionText: string;
  questionType: "truth" | "dare";
}

export interface GameState {
  roomId: string;
  roomName: string;
  playerId: string;
  playerName: string;
  isHost: boolean;
  players: Player[];
  gameStatus: "waiting" | "playing" | "ended";
  currentPlayerId: string;
  currentPlayerName: string;
  currentQuestion: Question | null;
  messages: { sender: string; text: string; timestamp: Date }[];
}

// Connection state enum
export enum ConnectionState {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
  Reconnecting = "Reconnecting",
  Disconnecting = "Disconnecting",
}

// SignalR connection singleton
let connection: signalR.HubConnection | null = null;
let connectionPromise: Promise<signalR.HubConnection> | null = null;

// Initialize SignalR connection
export const initializeSignalRConnection = async (serverUrl: string) => {
  // if (connection) return connection;

  const { setConnectionState } = useGameStore.getState();

  // If we already have a connection promise in progress, return it
  if (connectionPromise) {
    return connectionPromise;
  }

  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  // If we have a connection but it's not connected, try to start it
  if (connection && connection.state !== signalR.HubConnectionState.Connected) {
    setConnectionState(ConnectionState.Connecting);

    connectionPromise = connection
      .start()
      .then(() => {
        setConnectionState(ConnectionState.Connected);
        connectionPromise = null;
        return connection!;
      })
      .catch((err) => {
        console.error("Error starting existing SignalR connection:", err);
        setConnectionState(ConnectionState.Disconnected);
        connectionPromise = null;
        throw err;
      });

    return connectionPromise;
  }

  // Create a new connection
  setConnectionState(ConnectionState.Connecting);

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${serverUrl}/roomHub`)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        // Implement exponential backoff for reconnection attempts
        if (retryContext.previousRetryCount < 3) {
          // First few retries happen quickly
          return Math.pow(2, retryContext.previousRetryCount) * 1000;
        }

        // After that, retry every 10 seconds
        return 10000;
      },
    })
    .build();

  // Set up connection state change handlers
  connection.onreconnecting(() => {
    setConnectionState(ConnectionState.Reconnecting);
  });

  connection.onreconnected(() => {
    setConnectionState(ConnectionState.Connected);
  });

  connection.onclose(() => {
    setConnectionState(ConnectionState.Disconnected);
  });

  // Start the connection
  connectionPromise = connection
    .start()
    .then(() => {
      console.log("SignalR Connected");
      setConnectionState(ConnectionState.Connected);

      // Set up event handlers
      setupSignalREventHandlers(connection!);

      connectionPromise = null;
      return connection!;
    })
    .catch((err) => {
      console.error("Error establishing SignalR connection:", err);
      setConnectionState(ConnectionState.Disconnected);
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
};

// Game store using Zustand
export const useGameStore = create<{
  connection: signalR.HubConnection | null;
  connectionState: ConnectionState;
  gameState: GameState;
  messages: { sender: string; text: string; timestamp: Date }[];
  error: CommonAPIErrors | null;
  setConnection: (connection: signalR.HubConnection) => void;
  setConnectionState: (state: ConnectionState) => void;
  updateGameState: (updates: Partial<GameState>) => void;
  addMessage: (sender: string, text: string) => void;
  resetGame: () => void;
  setError: (error: CommonAPIErrors | null) => void;
}>((set) => ({
  connection: null,
  connectionState: ConnectionState.Disconnected,
  gameState: {
    roomId: "",
    roomName: "",
    playerId: "",
    playerName: "",
    isHost: false,
    players: [],
    gameStatus: "waiting",
    currentPlayerId: "",
    currentPlayerName: "",
    currentQuestion: null,
    messages: [],
  },
  messages: [],
  error: null,
  setConnection: (connection) => set({ connection }),
  setConnectionState: (connectionState) => set({ connectionState }),
  updateGameState: (updates) =>
    set((state) => ({
      gameState: { ...state.gameState, ...updates },
    })),
  addMessage: (sender, text) =>
    set((state) => ({
      messages: [...state.messages, { sender, text, timestamp: new Date() }],
    })),
  resetGame: () =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: "waiting",
        currentPlayerId: "",
        currentPlayerName: "",
        currentQuestion: null,
      },
    })),
  setError: (error) => set({ error }),
}));

// Setup all SignalR event handlers
export const setupSignalREventHandlers = (
  connection: signalR.HubConnection
) => {
  const { updateGameState, addMessage, resetGame, setError } =
    useGameStore.getState();

  // Receive message in room
  connection.on(Event.ReceiveMessage, (message) => {
    addMessage("System", `Message: ${message}`);
  });

  // Player joined notification
  connection.on(Event.PlayerJoined, (playerName) => {
    addMessage("System", `Player joined: ${playerName}`);
  });

  // Player reconnected notification
  connection.on(Event.PlayerReconnected, (result) => {
    addMessage("System", `${result.message}`);
  });

  // Update player list
  connection.on(Event.PlayerListUpdated, (players) => {
    addMessage("System", `Player list updated`);
    updateGameState({ players });
  });

  // Create room success
  connection.on(Event.CreateRoomSuccess, (result) => {
    addMessage(
      "System",
      `Create room success: ${result.message} (Room ID: ${result.roomId})`
    );
    updateGameState({
      roomId: result.roomId,
      isHost: true,
    });
  });

  // Join room success
  connection.on(Event.JoinRoomSuccess, (result) => {
    addMessage("System", `Join success: ${result}`);
  });

  // Change player name success
  connection.on(Event.ChangePlayerNameSuccess, (result) => {
    addMessage("System", `Change name success: ${result}`);
  });

  // Start game success
  connection.on(Event.StartGameSuccess, (result) => {
    addMessage("System", `Start game success: ${result}`);
  });

  // Get question success
  connection.on(Event.GetQuestionSuccess, (result) => {
    addMessage(
      "System",
      `Question received: ${result.questionText} (ID: ${result.questionId})`
    );
    updateGameState({
      currentQuestion: {
        questionId: result.questionId,
        questionText: result.questionText,
        questionType: result.questionType || "truth",
      },
    });
  });

  // Next player success
  connection.on(Event.NextPlayerSuccess, (result) => {
    addMessage("System", `Next player: ${result}`);
  });

  // End game success
  connection.on(Event.EndGameSuccess, (result) => {
    addMessage("System", `End game success: ${result}`);
    updateGameState({
      gameStatus: "ended",
      currentPlayerId: "",
      currentPlayerName: "",
      currentQuestion: null,
    });
  });

  // Reset game success
  connection.on(Event.ResetGameSuccess, (result) => {
    addMessage("System", `Reset game success: ${result}`);
    resetGame();
  });

  // Leave room success
  connection.on(Event.LeaveRoomSuccess, (result) => {
    addMessage("System", `Leave success: ${result}`);
  });

  // Reconnect success
  connection.on(Event.ReconnectSuccess, (result) => {
    addMessage("System", `Reconnect success: ${result.message || result}`);
    updateGameState({
      gameStatus:
        result.roomStatus === "Playing"
          ? "playing"
          : result.roomStatus === "Ended"
          ? "ended"
          : "waiting",
      currentPlayerId: result.currentPlayerId || "",
    });
  });

  // Game started
  connection.on(Event.GameStarted, (result) => {
    addMessage("System", `Game started: ${result.message}`);
    updateGameState({
      gameStatus: "playing",
      currentPlayerId: result.currentPlayerId,
    });
  });

  // Question assigned
  connection.on(Event.QuestionAssigned, (result) => {
    addMessage(
      "System",
      `Question for ${result.playerName}: ${result.questionText}`
    );
    updateGameState({
      currentQuestion: {
        questionId: result.questionId || "",
        questionText: result.questionText,
        questionType: result.questionType || "truth",
      },
      currentPlayerId: result.playerId,
      currentPlayerName: result.playerName,
    });

    if (result.isLastQuestion) {
      addMessage("System", "This is the last question!");
    }
  });

  // Next player turn
  connection.on(Event.NextPlayerTurn, (result) => {
    addMessage(
      "System",
      `Next player turn: ${result.nextPlayerName} (${result.nextPlayerId})`
    );
    updateGameState({
      currentPlayerId: result.nextPlayerId,
      currentPlayerName: result.nextPlayerName,
      currentQuestion: null,
    });
  });

  // Game ended
  connection.on(Event.GameEnded, (result) => {
    addMessage("System", `Game ended: ${result.message}`);
    updateGameState({
      gameStatus: "ended",
      currentPlayerId: "",
      currentPlayerName: "",
      currentQuestion: null,
    });

    if (result.PlayerStats) {
      addMessage(
        "System",
        `Game summary: Total Questions: ${result.TotalQuestions}`
      );
    }
  });

  // Game reset
  connection.on(Event.GameReset, (result) => {
    addMessage("System", `Game reset: ${result.message}`);
    resetGame();
    updateGameState({ players: result.players });
  });

  // Update the OperationFailed handler to set the error in the store
  connection.on(Event.OperationFailed, (error) => {
    addMessage(
      "Error",
      `Operation failed: ${error.errors.message} (Code: ${error.errors.errorCode}, Status: ${error.statusCode})`
    );
    setError(error);
  });
};

// Helper function to ensure connection is available before performing operations
export const ensureConnection = async (
  serverUrl: string
): Promise<signalR.HubConnection> => {
  const { connection, connectionState, setConnection } =
    useGameStore.getState();

  // If we have a valid connection, use it
  if (connection && connectionState === ConnectionState.Connected) {
    return connection;
  }

  // Otherwise initialize a new connection
  const newConnection = await initializeSignalRConnection(serverUrl);
  setConnection(newConnection);
  return newConnection;
};

// SignalR method invocations
export const signalRMethods = {
  createRoom: async (
    connection: signalR.HubConnection,
    roomName: string,
    playerId: string,
    hostName: string,
    roomPassword: string,
    ageGroup: string,
    mode: string,
    maxPlayer: number
    // connectionId: string
  ) => {
    return new Promise((resolve, reject) => {
      // Set up one-time handlers for success and failure
      const onSuccess = (result: string) => {
        connection.off(Event.CreateRoomSuccess, onSuccess);
        connection.off(Event.OperationFailed, onFailure);
        resolve(result);
      };

      const onFailure = (error: CommonAPIErrors) => {
        connection.off(Event.CreateRoomSuccess, onSuccess);
        connection.off(Event.OperationFailed, onFailure);
        reject(error);
      };

      // Register the one-time handlers
      connection.on(Event.CreateRoomSuccess, onSuccess);
      connection.on(Event.OperationFailed, onFailure);

      // Invoke the method
      connection
        .invoke(
          Event.CreateRoom,
          roomName,
          playerId,
          hostName,
          roomPassword,
          ageGroup,
          mode,
          maxPlayer
          // connectionId
        )
        .catch((error) => {
          connection.off(Event.CreateRoomSuccess, onSuccess);
          connection.off(Event.OperationFailed, onFailure);
          reject(error);
        });
    });
  },

  joinRoom: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string,
    playerName: string,
    joinPassword: string
  ) => {
    try {
      await connection.invoke(
        Event.JoinRoom,
        roomId,
        playerId,
        playerName,
        joinPassword
      );
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  },

  changePlayerName: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string,
    newName: string
  ) => {
    try {
      await connection.invoke(
        Event.ChangePlayerName,
        roomId,
        playerId,
        newName
      );
    } catch (error) {
      console.error("Error changing player name:", error);
      throw error;
    }
  },

  startGame: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string
  ) => {
    try {
      await connection.invoke(Event.StartGame, roomId, playerId);
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  },

  getRandomQuestion: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string,
    questionType: "truth" | "dare"
  ) => {
    try {
      await connection.invoke(
        Event.GetRandomQuestionForRoom,
        roomId,
        playerId,
        questionType
      );
    } catch (error) {
      console.error("Error getting question:", error);
      throw error;
    }
  },

  nextPlayer: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string
  ) => {
    try {
      await connection.invoke(Event.NextPlayer, roomId, playerId);
    } catch (error) {
      console.error("Error moving to next player:", error);
      throw error;
    }
  },

  endGame: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string
  ) => {
    try {
      await connection.invoke(Event.EndGame, roomId, playerId);
    } catch (error) {
      console.error("Error ending game:", error);
      throw error;
    }
  },

  resetGame: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string
  ) => {
    try {
      await connection.invoke(Event.ResetGame, roomId, playerId);
    } catch (error) {
      console.error("Error resetting game:", error);
      throw error;
    }
  },

  leaveRoom: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string
  ) => {
    try {
      await connection.invoke(Event.LeaveRoom, roomId, playerId);
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    }
  },

  reconnectPlayer: async (
    connection: signalR.HubConnection,
    roomId: string,
    playerId: string,
    playerName: string
  ) => {
    try {
      await connection.invoke(
        Event.ReconnectPlayer,
        roomId,
        playerId,
        playerName
      );
    } catch (error) {
      console.error("Error reconnecting player:", error);
      throw error;
    }
  },

  sendMessage: async (
    connection: signalR.HubConnection,
    roomId: string,
    message: string
  ) => {
    try {
      await connection.invoke(Event.SendMessage, roomId, message);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};
