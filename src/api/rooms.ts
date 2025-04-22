import { HOST_API } from "@/config-global";
import { QuestionModeEnum } from "@/types/question/question-mode-enum";
import { QuestionTypeEnum } from "@/types/question/question-type-enum";
import { FilterRoomRequest, Room } from "@/types/room/room";
import { RoomAgeGroupEnum } from "@/types/room/room-age-group-enum";
import { endpoints, fetcher, patcher, poster } from "@/utils/axios";
import { buildURL } from "@/utils/build-url";
import { createQueryKeys } from "@/utils/react-query/query-key-factory";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
const roomQueryKeys = createQueryKeys(["rooms"], {
  list: (request: FilterRoomRequest) => ({
    key: [request],
  }),
  create: () => ({
    key: ["create"],
    // Optionally, if you need to differentiate between different POST operations, you can add parameters and dynamic values here.
  }),
  join: (request: Room["roomId"]) => ({
    key: [request],
  }),
  detail: (request: Room["roomId"]) => ({
    key: [request],
  }),
  leave: (request: Room["roomId"]) => ({
    key: [request],
  }),
  changePlayerName: (request: Room["roomId"]) => ({
    key: [request],
  }),
  getQuestion: (request: Room["roomId"]) => ({
    key: [request],
  }),
  nextPlayer: (request: Room["roomId"]) => ({
    key: [request],
  }),
});

export function useGetRoomListQuery(request: FilterRoomRequest) {
  const validationFilter = {
    ...(request.filter?.roomId ? { roomId: request.filter.roomId } : {}),
  };
  const url = buildURL({
    baseURL: HOST_API + endpoints.room.list,
    filters: validationFilter,
  });

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: roomQueryKeys.list(request).key,
    queryFn: () => fetcher(url),
  });

  const memoizedValue = useMemo(
    () => ({
      rooms: (data as Room[]) || [],
      roomsLoading: isLoading,
      roomsError: error,
      roomsEmpty: !isLoading && !data?.rooms?.length,
      isError,
      roomTableRefetch: refetch,
    }),
    [data, isLoading, error, isError, refetch]
  );
  return memoizedValue;
}

export type PostRoomRequest = {
  roomName: string;
  playerName?: string;
  roomPassword?: string;
  maxPlayer: number;
  mode: QuestionModeEnum;
  ageGroup: RoomAgeGroupEnum;
  playerId?: string;
};

export function useRoomPostMutation() {
  const queryClient = useQueryClient();
  const url = useMemo(() => `${endpoints.room.create}`, []);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: roomQueryKeys.create().key,
      mutationFn: (request: PostRoomRequest) => poster(url, { ...request }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roomQueryKeys.list({}).key });
      },
    });

  const memoizedValue = useMemo(
    () => ({
      postRoom: mutate,
      postRoomAsync: mutateAsync,
      postRoomError: error,
      postRoomSuccess: isSuccess,
      postRoomPending: isPending,
      postRoomReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );
  return memoizedValue;
}

export type JoinPostRoomRequest = {
  playerName?: string;
  roomPassword?: string;
  playerId?: string;
};

// Only include this in development, NEVER in production
if (process.env.NODE_ENV === "development") {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
}

export function useJoinRoomPostMutation(roomId: Room["roomId"]) {
  const queryClient = useQueryClient();
  const url = useMemo(() => `${endpoints.room.join(roomId)}`, [roomId]);
  const connectionRef = useRef<HubConnection | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  // Set up the connection
  const setupConnection = () => {
    if (connectionRef.current || isConnectingRef.current) return;

    isConnectingRef.current = true;

    // Use the exact same URL as your working code
    connectionRef.current = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_HOST_API}/roomHub`, {
        logger: LogLevel.Information,
        withCredentials: false,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    // Set up your event handlers exactly as in your working code
    connectionRef.current.on("ReceiveMessage", (message: string) => {
      console.log(`Received message: ${message}`);
    });

    connectionRef.current.on("JoinRoomSuccess", (result: string) => {
      console.log(`Room join success: ${result}`);
    });

    connectionRef.current.on("PlayerJoined", (playerName: string) => {
      console.log(`New player: ${playerName} joined`);
      // Invalidate room queries to show the new player
      queryClient.invalidateQueries({
        queryKey: roomQueryKeys.detail(roomId).key,
      });
    });

    connectionRef.current.on("PlayerLeft", (playerName: string) => {
      console.log(`Player ${playerName} left`);
      // Update room data
      queryClient.invalidateQueries({
        queryKey: roomQueryKeys.detail(roomId).key,
      });
    });

    // Handle connection close and reconnection
    connectionRef.current.onclose((error) => {
      console.error(`Connection closed: ${error?.message || "Unknown error"}`);
      isConnectingRef.current = false;
    });

    connectionRef.current.onreconnected(() => {
      console.log("Reconnected to SignalR hub!");
    });
  };

  // Start the connection
  const startConnection = async (): Promise<boolean> => {
    if (!connectionRef.current) {
      setupConnection();
    }

    try {
      if (connectionRef.current?.state === "Connected") {
        return true;
      }

      await connectionRef.current?.start();
      console.log("Connected to SignalR hub!");
      isConnectingRef.current = false;
      return true;
    } catch (error) {
      console.error(`Error connecting to hub: ${error}`);
      isConnectingRef.current = false;
      connectionRef.current = null;
      return false;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .stop()
          .catch((err) => console.error("Error stopping connection:", err));
        connectionRef.current = null;
      }
    };
  }, []);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      mutationKey: roomQueryKeys.join(roomId).key,
      mutationFn: async (request: JoinPostRoomRequest) => {
        // First establish SignalR connection
        const connected = await startConnection();
        if (!connected) {
          throw new Error("Unable to connect to the room's real-time service");
        }

        // Get connection ID after SignalR has started
        const connectionId = connectionRef.current?.connectionId;
        console.log("Connection ID:", connectionId);

        if (!connectionId) {
          throw new Error("Failed to get connection ID");
        }

        // Call API with connection ID
        const response = await patcher(url, {
          ...request,
          connectionId,
        });

        // After API call succeeds, join the room through SignalR as well
        try {
          await connectionRef.current?.invoke(
            "JoinRoom",
            roomId,
            request.playerId || response.data.playerId,
            request.playerName || response.data.playerName,
            request.roomPassword || ""
          );
        } catch (joinError) {
          console.error("Error joining room via SignalR:", joinError);
          // Continue anyway since API call succeeded
        }

        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roomQueryKeys.list({}).key });
      },
      onError: () => {
        // If joining fails, try to disconnect SignalR
        if (connectionRef.current) {
          connectionRef.current.stop().catch(console.error);
          connectionRef.current = null;
        }
      },
    });

  const memoizedValue = useMemo(
    () => ({
      joinRoom: mutate,
      joinRoomAsync: mutateAsync,
      joinRoomError: error,
      joinRoomSuccess: isSuccess,
      joinRoomPending: isPending,
      joinRoomReset: reset,
      connection: connectionRef.current,
      // Add methods to interact with the room directly
      sendMessage: async (message: string) => {
        if (
          !connectionRef.current ||
          connectionRef.current.state !== "Connected"
        ) {
          console.log("Cannot send message: Not connected");
          return;
        }
        try {
          await connectionRef.current.invoke("SendMessage", roomId, message);
        } catch (error) {
          console.error(`Error sending message: ${error}`);
        }
      },
      leaveRoom: async () => {
        if (
          !connectionRef.current ||
          connectionRef.current.state !== "Connected"
        ) {
          console.log("Cannot leave room: Not connected");
          return;
        }
        try {
          await connectionRef.current.invoke("LeaveRoom", roomId);
        } catch (error) {
          console.error(`Error leaving room: ${error}`);
        }
      },
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset, roomId]
  );

  return memoizedValue;
}

export function useGetRoomByIdReactQuery(
  roomId: Room["roomId"],
  enabledFetching: boolean = false
) {
  const URL = endpoints.room.detail(roomId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: roomQueryKeys.detail(roomId).key,
    queryFn: () => fetcher(URL),
    enabled: enabledFetching,
  });

  const memoizedValue = useMemo(
    () => ({
      room: (data as Room) || [],
      roomLoading: isLoading,
      roomError: error,
      roomEmpty: !isLoading && !data?.length,
      roomRefetch: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}

export type LeavePostRoomRequest = {
  playerId?: string;
};

export function useLeaveRoomPatchMutation(roomId: Room["roomId"]) {
  const queryClient = useQueryClient();

  const url = useMemo(() => `${endpoints.room.leave(roomId)}`, [roomId]);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: roomQueryKeys.leave(roomId).key,
      mutationFn: (request: LeavePostRoomRequest) =>
        patcher(url, { ...request }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roomQueryKeys.list({}).key });
        queryClient.invalidateQueries({
          queryKey: roomQueryKeys.detail(roomId).key,
        });
      },
    });

  const memoizedValue = useMemo(
    () => ({
      leaveRoom: mutate,
      leaveRoomAsync: mutateAsync,
      leaveRoomError: error,
      leaveRoomSuccess: isSuccess,
      leaveRoomPending: isPending,
      leaveRoomReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );
  return memoizedValue;
}

export type ChangePlayerNamePostRoomRequest = {
  playerId?: string;
  newName?: string;
};

export function useChangePlayerNamePostMutation(roomId: Room["roomId"]) {
  const queryClient = useQueryClient();
  const url = useMemo(
    () => `${endpoints.room.changePlayerName(roomId)}`,
    [roomId]
  );

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: roomQueryKeys.changePlayerName(roomId).key,
      mutationFn: (request: ChangePlayerNamePostRoomRequest) =>
        patcher(url, { ...request }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roomQueryKeys.list({}).key });
        queryClient.invalidateQueries({
          queryKey: roomQueryKeys.detail(roomId).key,
        });
      },
    });

  const memoizedValue = useMemo(
    () => ({
      changePlayerNameRoom: mutate,
      changePlayerNameAsync: mutateAsync,
      changePlayerNameError: error,
      changePlayerNameSuccess: isSuccess,
      changePlayerNamePending: isPending,
      changePlayerNameReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );
  return memoizedValue;
}

// Start the game
export type StartGamePatchRoomRequest = {
  playerId?: string;
};

export function useStartGamePatchMutation(roomId: Room["roomId"]) {
  const queryClient = useQueryClient();

  const url = useMemo(() => `${endpoints.room.start(roomId)}`, [roomId]);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: roomQueryKeys.leave(roomId).key,
      mutationFn: (request: StartGamePatchRoomRequest) =>
        patcher(url, { ...request }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: roomQueryKeys.detail(roomId).key,
        });
      },
    });

  const memoizedValue = useMemo(
    () => ({
      startRoom: mutate,
      startRoomAsync: mutateAsync,
      startRoomError: error,
      startRoomSuccess: isSuccess,
      startRoomPending: isPending,
      startRoomReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );
  return memoizedValue;
}

// Reset the game
export type ResetGamePatchRoomRequest = {
  playerId?: string;
};

export function useResetGamePatchMutation(roomId: Room["roomId"]) {
  const queryClient = useQueryClient();

  const url = useMemo(() => `${endpoints.room.reset(roomId)}`, [roomId]);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: roomQueryKeys.leave(roomId).key,
      mutationFn: (request: ResetGamePatchRoomRequest) =>
        patcher(url, { ...request }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: roomQueryKeys.detail(roomId).key,
        });
      },
    });

  const memoizedValue = useMemo(
    () => ({
      resetRoom: mutate,
      resetRoomAsync: mutateAsync,
      resetRoomError: error,
      resetRoomSuccess: isSuccess,
      resetRoomPending: isPending,
      resetRoomReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );
  return memoizedValue;
}

export type GetQuestionPatchRoomRequest = {
  playerId?: string;
  questionType: QuestionTypeEnum;
};

export function useGetQuestionPatchMutation(roomId: Room["roomId"]) {
  const url = useMemo(() => `${endpoints.room.getQuestion(roomId)}`, [roomId]);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: roomQueryKeys.getQuestion(roomId).key,
      mutationFn: (request: GetQuestionPatchRoomRequest) =>
        patcher(url, { ...request }),
    });

  const memoizedValue = useMemo(
    () => ({
      getQuestionRoom: mutate,
      getQuestionRoomAsync: mutateAsync,
      getQuestionRoomError: error,
      getQuestionRoomSuccess: isSuccess,
      getQuestionRoomPending: isPending,
      getQuestionRoomReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );
  return memoizedValue;
}

export type NextPlayerPatchRoomRequest = {
  playerId?: string;
};

export function useNextPlayerPatchMutation(roomId: Room["roomId"]) {
  const queryClient = useQueryClient();
  const url = useMemo(() => `${endpoints.room.nextPlayer(roomId)}`, [roomId]);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: roomQueryKeys.nextPlayer(roomId).key,
      mutationFn: (request: NextPlayerPatchRoomRequest) =>
        patcher(url, { ...request }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: roomQueryKeys.detail(roomId).key,
        });
      },
    });

  const memoizedValue = useMemo(
    () => ({
      nextPlayerRoom: mutate,
      nextPlayerRoomAsync: mutateAsync,
      nextPlayerRoomError: error,
      nextPlayerRoomSuccess: isSuccess,
      nextPlayerRoomPending: isPending,
      nextPlayerRoomReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );
  return memoizedValue;
}
