import { CommonAPIErrors, RoomErrors } from "@/api/common/types/common-errors";
import { PostRoomRequest } from "@/api/rooms";
import FormProvider from "@/components/hook-form/form-provider";
import { RHFSelect } from "@/components/hook-form/rhf-select";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { getStorage } from "@/hooks/use-local-storage";
import { QuestionModeEnum } from "@/types/question/question-mode-enum";
import { RoomAgeGroupEnum } from "@/types/room/room-age-group-enum";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import * as Yup from "yup";
import {
  ConnectionState,
  ensureConnection,
  signalRMethods,
  useGameStore,
} from "@/lib/signalr-connection";
import { Event } from "@/types/event/event";

type Props = {
  open: boolean;
  onClose: () => void;
};

function CreateRoomDialog({ open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const connection = useGameStore((state) => state.connection);
  const connectionState = useGameStore((state) => state.connectionState);
  const updateGameState = useGameStore((state) => state.updateGameState);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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
      .moreThan(1, "Số lượng người chơi tối đa phải lớn hơn 1"),
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

  // Ensure connection is established when dialog opens
  useEffect(() => {
    if (open) {
      const connectToSignalR = async () => {
        if (connectionState !== ConnectionState.Connected) {
          setIsConnecting(true);
          try {
            // Replace with your actual SignalR hub URL
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
    }
  }, [open, connectionState, enqueueSnackbar]);

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
      alert("Connection not established. Please refresh the page.");
      return;
    }

    if (!roomName || !playerName) {
      alert("Room name and player name are required.");
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

      // The room ID will be set by the CreateRoomSuccess event handler
      // We'll navigate to the room page after the event is received
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
        roomName: dataSubmit.roomName.trim(),
        playerName: dataSubmit.playerName ? dataSubmit.playerName.trim() : "",
        roomPassword: dataSubmit.roomPassword
          ? dataSubmit.roomPassword.trim()
          : "",
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
      onClose();
      router.push(`/rooms/${result.roomId}`);
    });
  }, [connection, enqueueSnackbar, onClose, router]);

  const handleFailed = useCallback(
    (error: CommonAPIErrors) => {
      const customError = error as CommonAPIErrors;
      console.log("customError: ", JSON.stringify(customError));
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
      setIsLoading(false);
    },
    [enqueueSnackbar, setFormError]
  );

  useEffect(() => {
    connection?.on(Event.OperationFailed, handleFailed);
    return () => {
      connection?.off(Event.OperationFailed);
    };
  }, [connection, handleFailed]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: "div",
      }}
      fullWidth
      maxWidth="sm"
      fullScreen={useCheckMobile()}
    >
      <DialogTitle sx={{ p: "20px" }}>
        Tạo phòng chơi
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <FaTimes size={12} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ overflow: "visible", p: "20px" }}>
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
          <Box sx={{ py: 0, bgcolor: "background.paper", borderRadius: 2 }}>
            <FormProvider
              methods={methods}
              onSubmit={onSubmit}
              className="mt-4"
            >
              <div className="flex flex-col gap-3">
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
                      <FormHelperText error>
                        {errors.mode.message}
                      </FormHelperText>
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
                  sx={{
                    background:
                      "linear-gradient(45deg, rgb(106, 61, 232) 30%, rgb(158, 127, 249) 90%)",
                    color: "white",
                    boxShadow: "0 3px 5px 2px rgba(106, 61, 232, 0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, rgb(106, 61, 232) 10%, rgb(158, 127, 249) 100%)",
                    },
                  }}
                  className="w-fit flex items-center gap-1"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <CircularProgress color="inherit" className="!h-5 !w-5" />
                  )}
                  Tạo
                </Button>
              </div>
            </FormProvider>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default memo(CreateRoomDialog);
