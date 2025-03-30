import HTTP_CODES_ENUM from "@/api/common/types/http-codes";
import { useJoinRoomPostMutation } from "@/api/rooms";
import FormProvider from "@/components/hook-form/form-provider";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { setStorage } from "@/hooks/use-local-storage";
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
import { memo, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import * as Yup from "yup";

type Props = {
  open: boolean;
  onClose: () => void;
  room?: Room;
};

function JoinRoomDialog({ open, onClose, room }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const router = useRouter();
  const { joinRoomAsync } = useJoinRoomPostMutation(room?.roomId as string);
  const defaultValues = useMemo(
    () => ({
      playerName: "",
      roomPassword: "",
    }),
    []
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

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (dataSubmit) => {
    try {
      setShouldRefetch(true);

      const roomInfo = {
        playerName: dataSubmit.playerName ? dataSubmit.playerName.trim() : "",
        roomPassword: dataSubmit.roomPassword ? dataSubmit.roomPassword : "",
      };

      const { data, status } = await joinRoomAsync(roomInfo);
      if (data.roomId && status === HTTP_CODES_ENUM.OK) {
        enqueueSnackbar({
          message: "Vào phòng thành công",
          variant: "success",
        });
        const state = {
          state: {
            playerId: data.playerId,
            playerName: data.playerName,
          },
        };
        setStorage("player", state);
        setShouldRefetch(false);
        router.push(`/rooms/${data?.roomId}`);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar({
        message: "Vào phòng thất bại",
        variant: "error",
      });
      setShouldRefetch(false);
    }
  });

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
              <FormControl sx={sxFormControl}>
                <RHFTextField
                  name="playerName"
                  label="Tên người chơi"
                  placeholder="Nhập tên"
                  variant="outlined"
                />
              </FormControl>

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
              >
                {shouldRefetch && (
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
