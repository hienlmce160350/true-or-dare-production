"use client";

import { useCheckMobile } from "@/hooks/use-check-screen-type";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { memo, useCallback, useEffect } from "react";
import { signalRMethods, useGameStore } from "@/lib/signalr-connection";
import { Event } from "@/types/event/event";
type Props = {
  open: boolean;
  onClose: () => void;
  requestData: RequestChangePlayerName;
};

type RequestChangePlayerName = {
  playerId?: string;
  roomId?: string;
  playerName?: string;
};

function LeaveRoomDialog({ open, onClose, requestData }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const connection = useGameStore((state) => state.connection);

  const handleLeaveRoomSuccess = useCallback(() => {
    enqueueSnackbar({
      message: "Rời phòng thành công",
      variant: "success",
    });
    router.push("/rooms");
  }, [enqueueSnackbar, router]);

  const handleLeaveRoom = useCallback(
    async ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      if (!connection) {
        alert("Kết nối không thành công. Vui lòng thử lại sau.");
        return;
      }

      if (!roomId || !playerId) {
        alert("Room ID và player ID là bắt buộc.");
        return;
      }

      try {
        await signalRMethods.leaveRoom(connection, roomId, playerId);
      } catch (error) {
        console.error(error);
      }
    },
    [connection]
  );

  const onSubmit = useCallback(async () => {
    try {
      await handleLeaveRoom({
        roomId: requestData?.roomId as string,
        playerId: requestData?.playerId as string,
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar({
        message: "Rời phòng thất bại",
        variant: "error",
      });
    }
  }, [
    enqueueSnackbar,
    handleLeaveRoom,
    requestData?.playerId,
    requestData?.roomId,
  ]);

  useEffect(() => {
    connection?.on(Event.LeaveRoomSuccess, handleLeaveRoomSuccess);

    return () => {
      connection?.off(Event.LeaveRoomSuccess);
    };
  }, [connection, handleLeaveRoomSuccess]);

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
      <DialogTitle>Xác nhận rời phòng</DialogTitle>
      <DialogContent>
        <Typography>Bạn có chắc chắn muốn rời khỏi phòng này?</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button onClick={onSubmit} autoFocus variant="contained" color="error">
          Rời phòng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(LeaveRoomDialog);
