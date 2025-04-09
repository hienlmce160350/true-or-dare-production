"use client";

import { memo, useMemo, useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRoomPostMutation } from "@/api/rooms";
import FormProvider from "../hook-form/form-provider";
import {
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
import HTTP_CODES_ENUM from "@/api/common/types/http-codes";
import { setStorage } from "@/hooks/use-local-storage";
import { QuestionModeEnum } from "@/types/question/question-mode-enum";
import { RoomAgeGroupEnum } from "@/types/room/room-age-group-enum";
import { RHFSelect } from "../hook-form/rhf-select";
import { CommonAPIErrors, RoomErrors } from "@/api/common/types/common-errors";

const CreateRoom = () => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const { postRoomAsync } = useRoomPostMutation();
  const defaultValues = useMemo(
    () => ({
      roomName: "",
      playerName: "",
      roomPassword: "",
      maxPlayer: 2,
      mode: QuestionModeEnum.Party,
      ageGroup: RoomAgeGroupEnum.All,
    }),
    []
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
    setError,
  } = methods;

  const onSubmit = handleSubmit(async (dataSubmit) => {
    try {
      setShouldRefetch(true);
      const roomInfo = {
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
      const { data, status } = await postRoomAsync(roomInfo);
      if (data.roomId && status === HTTP_CODES_ENUM.OK) {
        enqueueSnackbar({
          message: "Tạo phòng thành công",
          variant: "success",
        });
        const state = {
          state: {
            playerId: data?.players[data?.players.length - 1]?.playerId,
            playerName: data?.players[data?.players.length - 1]?.playerName,
          },
        };
        setStorage("player", state);
        setShouldRefetch(false);
        router.push(`/rooms/${data?.roomId}`);
      }
    } catch (error) {
      const customError = error as CommonAPIErrors;
      console.error(error);
      if (customError?.errors?.errorCode === RoomErrors.RoomAlreadyExists) {
        setError("roomName", {
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
      setShouldRefetch(false);
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

            <FormControl sx={sxFormControl}>
              <RHFTextField
                name="playerName"
                label="Tên người chơi"
                placeholder="Nhập tên"
                variant="outlined"
              />
            </FormControl>

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

            <FormControl sx={sxFormControl}>
              <RHFTextField
                name="maxPlayer"
                label="Số lượng người chơi"
                placeholder="Nhập số lượng"
                type="number"
              />
            </FormControl>
          </div>
          <div className="flex w-full justify-end mt-3">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="w-fit"
            >
              {shouldRefetch && (
                <CircularProgress color="inherit" className="!h-5 !w-5" />
              )}
              Tạo
            </Button>
          </div>
        </FormProvider>
      </div>
    </>
  );
};

export default memo(CreateRoom);
