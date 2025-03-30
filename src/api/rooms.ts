import { HOST_API } from "@/config-global";
import { FilterRoomRequest, Room } from "@/types/room/room";
import { endpoints, fetcher, patcher, poster } from "@/utils/axios";
import { buildURL } from "@/utils/build-url";
import { createQueryKeys } from "@/utils/react-query/query-key-factory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

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
};

export function useJoinRoomPostMutation(roomId: Room["roomId"]) {
  const queryClient = useQueryClient();
  const url = useMemo(() => `${endpoints.room.join(roomId)}`, [roomId]);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: roomQueryKeys.join(roomId).key,
      mutationFn: (request: JoinPostRoomRequest) =>
        patcher(url, { ...request }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: roomQueryKeys.list({}).key });
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
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
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
