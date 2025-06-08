import {
  CommonAPIErrors,
  PlayerErrors,
} from "@/api/common/types/common-errors";
import FormProvider from "@/components/hook-form/form-provider";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { setStorage } from "@/hooks/use-local-storage";
import { signalRMethods, useGameStore } from "@/lib/signalr-connection";
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
import { useSnackbar } from "notistack";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import * as Yup from "yup";
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

function ChangePlayerNameDialog({ open, onClose, requestData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const connection = useGameStore((state) => state.connection);
  const defaultValues = useMemo(
    () => ({
      newName: requestData.playerName as string,
    }),
    [requestData.playerName]
  );

  const ChangePlayerNameSchema = Yup.object().shape({
    newName: Yup.string().trim().required("Tên người chơi không được để trống"),
  });

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(ChangePlayerNameSchema),
  });

  const { handleSubmit, setValue, setError, getValues } = methods;

  useEffect(() => {
    if (requestData.playerName) {
      setValue("newName", requestData.playerName);
    }
  }, [requestData.playerName, setValue]);

  const handleChangePlayerName = async ({
    roomId,
    playerId,
    newName,
  }: {
    roomId: string;
    playerId: string;
    newName: string;
  }) => {
    if (!connection) {
      alert("Kết nối không thành công. Vui lòng thử lại sau.");
      return;
    }

    try {
      setIsLoading(true);
      await signalRMethods.changePlayerName(
        connection,
        roomId,
        playerId,
        newName
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = handleSubmit(async (dataSubmit) => {
    try {
      setIsLoading(true);
      await handleChangePlayerName({
        roomId: requestData.roomId as string,
        playerId: requestData.playerId as string,
        newName: dataSubmit.newName.trim(),
      });
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    connection?.on(Event.ChangePlayerNameSuccess, () => {
      enqueueSnackbar({
        message: "Đổi tên thành công",
        variant: "success",
      });
      const state = {
        state: {
          playerId: requestData.playerId,
          playerName: getValues("newName"),
        },
      };
      setStorage("player", state);
      setIsLoading(false);
      onClose();
    });
  }, [connection, enqueueSnackbar, getValues, onClose, requestData.playerId]);

  const handleFailed = useCallback(
    (error: CommonAPIErrors) => {
      const customError = error as CommonAPIErrors;
      if (customError?.errors?.errorCode === PlayerErrors.PlayerNameExisted) {
        setError("newName", {
          type: "manual",
          message: "Tên người chơi đã tồn tại",
        });
      } else if (
        customError?.errors?.errorCode === PlayerErrors.PlayerNameLength
      ) {
        setError("newName", {
          type: "manual",
          message: "Tên người chơi không được quá 50 ký tự",
        });
      }

      setIsLoading(false);
    },
    [setError]
  );

  useEffect(() => {
    connection?.on(Event.OperationFailed, handleFailed);
    return () => {
      connection?.off(Event.OperationFailed);
    };
  }, [connection, handleFailed]);

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
        {`Đổi tên người chơi ${requestData.playerName}`}
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
                  name="newName"
                  label="Tên mới"
                  placeholder="Nhập tên"
                  variant="outlined"
                />
              </FormControl>
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
                Đổi tên
              </Button>
            </div>
          </FormProvider>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ChangePlayerNameDialog);
