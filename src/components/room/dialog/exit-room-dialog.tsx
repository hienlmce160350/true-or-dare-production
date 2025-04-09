import { useLeaveRoomPatchMutation } from "@/api/rooms";
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
import { memo, useCallback, useEffect, useState } from "react";

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
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const { leaveRoom, leaveRoomSuccess, leaveRoomError } =
    useLeaveRoomPatchMutation(requestData?.roomId as string);

  const onSubmit = useCallback(() => {
    try {
      setShouldRefetch(true);
      const roomInfo = {
        playerId: requestData?.playerId,
      };
      leaveRoom(roomInfo);
      enqueueSnackbar({
        message: "Rời phòng thành công",
        variant: "success",
      });
      router.push("/rooms");
    } catch (error) {
      console.error(error);
      enqueueSnackbar({
        message: "Rời phòng thất bại",
        variant: "error",
      });
    }
  }, [enqueueSnackbar, leaveRoom, requestData?.playerId, router]);

  useEffect(() => {
    if (leaveRoomSuccess && shouldRefetch) {
      enqueueSnackbar({
        message: "Rời phòng thành công",
        variant: "success",
      });
      onClose();
      setShouldRefetch(false);
    }
  }, [enqueueSnackbar, leaveRoomSuccess, onClose, shouldRefetch]);

  useEffect(() => {
    if (leaveRoomError && shouldRefetch) {
      enqueueSnackbar({
        message: "Rời phòng thất bại",
        variant: "error",
      });
      setShouldRefetch(false);
    }
  }, [enqueueSnackbar, leaveRoomError, shouldRefetch]);

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
