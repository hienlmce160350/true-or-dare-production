"use client";

import { memo, useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { PostRoomRequest } from "@/api/rooms";
import FormProvider from "../hook-form/form-provider";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
} from "@mui/material";
import RHFTextField from "../hook-form/rhf-text-field";
import { useSnackbar } from "notistack";
import { IoHomeOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getStorage } from "@/hooks/use-local-storage";
import { QuestionModeEnum } from "@/types/question/question-mode-enum";
import { RoomAgeGroupEnum } from "@/types/room/room-age-group-enum";
import { RHFSelect } from "../hook-form/rhf-select";
import { CommonAPIErrors, RoomErrors } from "@/api/common/types/common-errors";
import {
  ConnectionState,
  ensureConnection,
  signalRMethods,
  useGameStore,
} from "@/lib/signalr-connection";
import { Event } from "@/types/event/event";

const CreateRoom = () => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const connectionState = useGameStore((state) => state.connectionState);
  const connection = useGameStore((state) => state.connection);
  const updateGameState = useGameStore((state) => state.updateGameState);
  const setError = useGameStore((state) => state.setError);
  const error = useGameStore((state) => state.error);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const playerState = getStorage("player");

  const defaultValues = useMemo(
    () => ({
      roomName: "",
      playerName: (playerState?.state?.playerName as string) || "",
      roomPassword: "",
      maxPlayer: 2,
      mode: QuestionModeEnum.Party,
      ageGroup: RoomAgeGroupEnum.All,
    }),
    [playerState?.state?.playerName]
  );

  const CreateRoomSchema = Yup.object().shape({
    roomName: Yup.string().required("Tên phòng không được để trống"),
    playerName: Yup.string().nullable(),
    roomPassword: Yup.string().nullable(),
    maxPlayer: Yup.number()
      .required("Số lượng người chơi tối đa không được để trống")
      .moreThan(0, "Số lượng người chơi tối đa phải lớn hơn 0"),
    mode: Yup.string(),
    ageGroup: Yup.string(),
  });

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(CreateRoomSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    watch,
  } = methods;

  // Reset error state when dialog opens/closes
  useEffect(() => {
    setError(null);
  }, [setError]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      if (error.errors?.errorCode === RoomErrors.RoomAlreadyExists) {
        setFormError("roomName", {
          type: "manual",
          message: "Tên phòng đã tồn tại",
        });
        enqueueSnackbar({
          message: "Tên phòng đã tồn tại",
          variant: "error",
        });
      } else {
        enqueueSnackbar({
          message:
            error.errors?.message ||
            "Tạo phòng thất bại. Vui lòng thử lại sau.",
          variant: "error",
        });
      }
      setIsLoading(false);
      setError(null);
    }
  }, [error, enqueueSnackbar, setFormError, setError]);

  const handleCreateRoom = async ({
    playerId,
    playerName,
    roomPassword,
    roomName,
    maxPlayer,
    mode,
    ageGroup,
  }: PostRoomRequest) => {
    if (!connection) {
      alert("Kết nối không thành công. Vui lòng thử lại sau.");
      return;
    }

    if (!roomName || !playerName) {
      alert("Tên phòng và tên người chơi không được để trống.");
      return;
    }

    setIsLoading(true);

    try {
      // Update local state first
      updateGameState({
        roomName,
        playerId,
        playerName,
        isHost: true,
      });

      // Create room via SignalR
      await signalRMethods.createRoom(
        connection,
        roomName,
        playerId || "",
        playerName,
        roomPassword || "",
        ageGroup,
        mode,
        maxPlayer
      );
    } catch (error) {
      const customError = error as CommonAPIErrors;
      // console.error("Failed to create room:", error);
      if (customError?.errors?.errorCode === RoomErrors.RoomAlreadyExists) {
        setFormError("roomName", {
          type: "manual",
          message: "Tên phòng đã tồn tại",
        });
        enqueueSnackbar({
          message: "Tên phòng đã tồn tại",
          variant: "error",
        });
      } else {
        enqueueSnackbar({
          message: "Tạo phòng thất bại. Vui lòng thử lại sau.",
          variant: "error",
        });
      }
      setIsLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (dataSubmit) => {
    try {
      if (dataSubmit.mode === QuestionModeEnum.Couples) {
        dataSubmit.maxPlayer = 2;
      }
      const roomInfo = {
        playerId: playerState?.state?.playerId,
        roomName: dataSubmit.roomName,
        playerName: dataSubmit.playerName ? dataSubmit.playerName.trim() : "",
        roomPassword: dataSubmit.roomPassword ? dataSubmit.roomPassword : "",
        maxPlayer: dataSubmit.maxPlayer ? dataSubmit.maxPlayer : 2,
        mode: dataSubmit.mode
          ? (dataSubmit.mode as QuestionModeEnum)
          : QuestionModeEnum.Party,
        ageGroup: dataSubmit.ageGroup
          ? (dataSubmit.ageGroup as RoomAgeGroupEnum)
          : RoomAgeGroupEnum.All,
      };
      await handleCreateRoom(roomInfo);
    } catch (error) {
      const customError = error as CommonAPIErrors;
      console.error(error);
      if (customError?.errors?.errorCode === RoomErrors.RoomAlreadyExists) {
        setFormError("roomName", {
          type: "manual",
          message: "Tên phòng đã tồn tại",
        });
        enqueueSnackbar({
          message: "Tên phòng đã tồn tại",
          variant: "error",
        });
      } else {
        enqueueSnackbar({
          message: "Tạo phòng thất bại",
          variant: "error",
        });
      }
    }
  });

  const memoizedModesMenuItems = useMemo(() => {
    const MODE_OPTIONS = [
      { label: "Bạn bè", value: QuestionModeEnum.Friends },
      { label: "Cặp đôi", value: QuestionModeEnum.Couples },
      { label: "Buổi tiệc", value: QuestionModeEnum.Party },
    ];
    return MODE_OPTIONS.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {`${option.label}`}
      </MenuItem>
    ));
  }, []);

  const memoizedAgeGroupMenuItems = useMemo(() => {
    const MODE_OPTIONS = [
      { label: "Trẻ em", value: RoomAgeGroupEnum.Kids },
      { label: "Vị thành niên", value: RoomAgeGroupEnum.Teen },
      { label: "Tất cả độ tuổi", value: RoomAgeGroupEnum.All },
    ];
    return MODE_OPTIONS.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {`${option.label}`}
      </MenuItem>
    ));
  }, []);

  const sxFormControl = useMemo(
    () => ({
      width: "100%",
      "& .MuiInputBase-root": {
        height: "40px",
      },
      "& .MuiFormLabel-root": {
        top: "-7px",
        fontSize: "14px",
        fontWeight: "400",
      },
      "& .MuiInputBase-input": {
        fontSize: "14px",
        fontWeight: "400",
      },
      "& .MuiInputLabel-shrink": {
        transform: "translate(14px, -2px) scale(0.75)",
      },
    }),
    []
  );

  useEffect(() => {
    connection?.on(Event.CreateRoomSuccess, (result) => {
      enqueueSnackbar({
        message: "Tạo phòng thành công",
        variant: "success",
      });
      router.push(`/rooms/${result.roomId}`);
    });
  }, [connection, enqueueSnackbar, router]);

  // Ensure connection is established when dialog opens
  useEffect(() => {
    const connectToSignalR = async () => {
      if (connectionState !== ConnectionState.Connected) {
        setIsConnecting(true);
        try {
          const serverUrl =
            process.env.NEXT_PUBLIC_SIGNALR_URL ||
            "https://your-signalr-server.com";
          await ensureConnection(serverUrl);
          setIsConnecting(false);
        } catch (error) {
          console.error("Failed to connect to SignalR:", error);
          enqueueSnackbar({
            message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
            variant: "error",
          });
          setIsConnecting(false);
        }
      }
    };

    connectToSignalR();
  }, [connectionState, enqueueSnackbar]);

  return (
    <>
      <div className="w-full max-w-md bg-white p-3 shadow-lg relative rounded-md">
        <div className="flex items-center justify-between">
          <IconButton onClick={router.back} className="!text-black">
            <IoHomeOutline className="h-5 w-5" />
          </IconButton>
          <motion.h2
            className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Tạo phòng chơi
          </motion.h2>
        </div>
        {isConnecting ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress size={40} />
            <Box sx={{ mt: 2 }}>Đang kết nối đến máy chủ...</Box>
          </Box>
        ) : connectionState !== ConnectionState.Connected ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Không thể kết nối đến máy chủ. Vui lòng thử lại sau.
            <Button
              variant="outlined"
              size="small"
              sx={{ ml: 2 }}
              onClick={async () => {
                setIsConnecting(true);
                try {
                  const serverUrl =
                    process.env.NEXT_PUBLIC_SIGNALR_URL ||
                    "https://your-signalr-server.com";
                  await ensureConnection(serverUrl);
                  setIsConnecting(false);
                } catch (error) {
                  console.error("Failed to reconnect:", error);
                  setIsConnecting(false);
                }
              }}
            >
              Kết nối lại
            </Button>
          </Alert>
        ) : (
          <FormProvider methods={methods} onSubmit={onSubmit} className="mt-4">
            <div className="flex flex-col gap-2">
              <FormControl sx={sxFormControl}>
                <RHFTextField
                  name="roomName"
                  label="Tên phòng"
                  placeholder="Nhập tên"
                  variant="outlined"
                />
              </FormControl>

              <FormControl sx={sxFormControl}>
                <RHFTextField
                  name="roomPassword"
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  variant="outlined"
                  type="password"
                />
              </FormControl>

              {playerState?.state?.playerName ? null : (
                <FormControl sx={sxFormControl}>
                  <RHFTextField
                    name="playerName"
                    label="Tên người chơi"
                    placeholder="Nhập tên"
                    variant="outlined"
                  />
                </FormControl>
              )}

              <FormControl sx={sxFormControl}>
                <RHFSelect name="mode" label="Chế độ">
                  {memoizedModesMenuItems}
                  {errors.mode && (
                    <FormHelperText error>{errors.mode.message}</FormHelperText>
                  )}
                </RHFSelect>
              </FormControl>

              <FormControl sx={sxFormControl}>
                <RHFSelect name="ageGroup" label="Độ tuổi">
                  {memoizedAgeGroupMenuItems}
                  {errors.ageGroup && (
                    <FormHelperText error>
                      {errors.ageGroup.message}
                    </FormHelperText>
                  )}
                </RHFSelect>
              </FormControl>
              {watch("mode") === QuestionModeEnum.Couples ? null : (
                <FormControl sx={sxFormControl}>
                  <RHFTextField
                    name="maxPlayer"
                    label="Số lượng người chơi"
                    placeholder="Nhập số lượng"
                    type="number"
                  />
                </FormControl>
              )}
            </div>
            <div className="flex w-full justify-end mt-3">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="w-fit"
                disabled={isLoading}
              >
                {isLoading && (
                  <CircularProgress color="inherit" className="!h-5 !w-5" />
                )}
                Tạo
              </Button>
            </div>
          </FormProvider>
        )}
      </div>
    </>
  );
};

export default memo(CreateRoom);
