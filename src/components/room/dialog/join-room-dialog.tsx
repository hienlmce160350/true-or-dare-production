import {
  CommonAPIErrors,
  PlayerErrors,
  RoomErrors,
} from "@/api/common/types/common-errors";
import { JoinPostRoomRequest } from "@/api/rooms";
import FormProvider from "@/components/hook-form/form-provider";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { getStorage, setStorage } from "@/hooks/use-local-storage";
import { Room } from "@/types/room/room";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { memo, useMemo, useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import * as Yup from "yup";
import { signalRMethods, useGameStore } from "@/lib/signalr-connection";
import { Event } from "@/types/event/event";

type Props = {
  open: boolean;
  onClose: () => void;
  room?: Room;
};

function JoinRoomDialog({ open, onClose, room }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const connection = useGameStore((state) => state.connection);
  const updateGameState = useGameStore((state) => state.updateGameState);
  const [isLoading, setIsLoading] = useState(false);
  const playerState = getStorage("player");

  const defaultValues = useMemo(
    () => ({
      playerName: (playerState?.state?.playerName as string) || "",
      roomPassword: "",
    }),
    [playerState?.state?.playerName]
  );

  const JoinRoomSchema = Yup.object().shape({
    playerName: Yup.string().nullable(),
    roomPassword: room?.hasPassword
      ? Yup.string().required("Mật khẩu phòng là bắt buộc")
      : Yup.string().nullable(),
  });

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(JoinRoomSchema),
  });

  const { handleSubmit, setError, getValues } = methods;

  const handleJoinRoom = useCallback(
    async ({ playerId, playerName, roomPassword }: JoinPostRoomRequest) => {
      if (!connection) {
        alert("Kết nối không thành công. Vui lòng thử lại sau.");
        return;
      }

      if (!room?.roomId || !playerName) {
        alert("Room ID và player name là bắt buộc.");
        return;
      }

      try {
        // Update local state first
        updateGameState({
          roomId: room?.roomId,
          playerId,
          playerName,
          isHost: false,
        });

        // Join room via SignalR
        await signalRMethods.joinRoom(
          connection,
          room?.roomId,
          playerId as string,
          playerName,
          (roomPassword as string) || ""
        );
      } catch (error) {
        const customError = error as CommonAPIErrors;
        if (customError?.errors?.errorCode === RoomErrors.RoomPasswordIsWrong) {
          setError("roomPassword", {
            type: "manual",
            message: "Mật khẩu không đúng",
          });
          enqueueSnackbar({
            message: "Mật khẩu không đúng",
            variant: "error",
          });
        } else if (
          customError?.errors?.errorCode === PlayerErrors.PlayerNameExisted
        ) {
          enqueueSnackbar({
            message: "Tên người chơi đã tồn tại",
            variant: "error",
          });
          setError("playerName", {
            type: "manual",
            message: "Tên người chơi đã tồn tại",
          });
        } else if (
          customError?.errors?.errorCode === PlayerErrors.PlayerNameLength
        ) {
          enqueueSnackbar({
            message: "Tên người chơi không được quá 50 ký tự",
            variant: "error",
          });
          setError("playerName", {
            type: "manual",
            message: "Tên người chơi không được quá 50 ký tự",
          });
        } else {
          enqueueSnackbar({
            message: "Vào phòng thất bại",
            variant: "error",
          });
        }
        setIsLoading(false);
      }
    },
    [connection, enqueueSnackbar, room?.roomId, setError, updateGameState]
  );

  const onSubmit = handleSubmit(async (dataSubmit) => {
    try {
      const roomInfo = {
        playerId: playerState?.state?.playerId,
        playerName: dataSubmit.playerName ? dataSubmit.playerName.trim() : "",
        roomPassword: dataSubmit.roomPassword ? dataSubmit.roomPassword : "",
      };

      await handleJoinRoom(roomInfo);
    } catch (error) {
      const customError = error as CommonAPIErrors;
      if (customError?.errors?.errorCode === RoomErrors.RoomPasswordIsWrong) {
        setError("roomPassword", {
          type: "manual",
          message: "Mật khẩu không đúng",
        });
        enqueueSnackbar({
          message: "Mật khẩu không đúng",
          variant: "error",
        });
      } else if (
        customError?.errors?.errorCode === PlayerErrors.PlayerNameExisted
      ) {
        enqueueSnackbar({
          message: "Tên người chơi đã tồn tại",
          variant: "error",
        });
        setError("playerName", {
          type: "manual",
          message: "Tên người chơi đã tồn tại",
        });
      } else if (
        customError?.errors?.errorCode === PlayerErrors.PlayerNameLength
      ) {
        enqueueSnackbar({
          message: "Tên người chơi không được quá 50 ký tự",
          variant: "error",
        });
        setError("playerName", {
          type: "manual",
          message: "Tên người chơi không được quá 50 ký tự",
        });
      } else {
        enqueueSnackbar({
          message: "Vào phòng thất bại",
          variant: "error",
        });
      }
      setIsLoading(false);
    }
  });

  useEffect(() => {
    connection?.on(Event.JoinRoomSuccess, () => {
      let state;
      if (playerState?.state?.playerName) {
        state = {
          state: {
            playerId: playerState?.state?.playerId,
            playerName: playerState?.state?.playerName,
          },
        };
      } else {
        state = {
          state: {
            playerId: playerState?.state?.playerId,
            playerName: getValues("playerName"),
          },
        };
      }
      setStorage("player", state);
      setIsLoading(false);
      router.push(`/rooms/${room?.roomId}`);
      enqueueSnackbar({
        message: "Vào phòng thành công",
        variant: "success",
      });
    });
  }, [
    connection,
    router,
    room?.roomId,
    playerState?.state?.playerName,
    playerState?.state?.playerId,
    enqueueSnackbar,
    getValues,
  ]);

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
        Tham gia phòng {room?.roomName}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <FaTimes size={12} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ overflow: "visible", p: "20px" }}>
        <Box sx={{ py: 0, bgcolor: "background.paper", borderRadius: 2 }}>
          <FormProvider methods={methods} onSubmit={onSubmit} className="mt-4">
            <div className="flex flex-col gap-2">
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

              {room?.hasPassword && (
                <FormControl sx={sxFormControl}>
                  <RHFTextField
                    name="roomPassword"
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu"
                    variant="outlined"
                    type="password"
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
                Tham gia
              </Button>
            </div>
          </FormProvider>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default memo(JoinRoomDialog);
