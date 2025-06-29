"use client";

import { useGetRoomListQuery } from "@/api/rooms";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { IFilterValue, IRoomFilters, Room } from "@/types/room/room";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import { IoMdPeople } from "react-icons/io";
import {
  MdAdd,
  MdArrowBack,
  MdLock,
  MdLockOpen,
  MdPersonAdd,
  MdRefresh,
} from "react-icons/md";
import CreateRoomDialog from "./dialog/create-room-dialog";
import JoinRoomDialog from "./dialog/join-room-dialog";
import Iconify from "../iconify";
import { RoomStatusEnum } from "@/types/room/room-status-enum";
import ChipRoomStatus from "../chip/chip-room-status";
import RoomDetailCard from "../card/room-detail-card";

const RoomList = () => {
  const router = useRouter();
  const isMobile = useCheckMobile();
  const [selectedRoom, setSelectedRoom] = useState<Room>();
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const [joinRoomDialogOpen, setJoinRoomDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const defaultFilters: IRoomFilters = useMemo(
    () => ({
      roomId: "",
    }),
    []
  );

  const [filters, setFilters] = useState(defaultFilters);

  const handleFilters = useCallback((name: string, value: IFilterValue) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const filterRoomRequest = useMemo(
    () => ({
      filter: filters,
    }),
    [filters]
  );
  const { rooms, roomsLoading, roomTableRefetch } =
    useGetRoomListQuery(filterRoomRequest);

  const roomsArray = Array.isArray(rooms) ? rooms : [];

  // Phân trang
  const paginatedRooms = roomsArray.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setJoinRoomDialogOpen(true);
  };

  // const handlePasswordSubmit = () => {
  //   if (password === selectedRoom?.roomPassword) {
  //     setPasswordDialogOpen(false);
  //     setNameDialogOpen(true);
  //     setPasswordError(false);
  //   } else {
  //     setPasswordError(true);
  //   }
  // };

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Filter by Room ID

  const handleChangeRoomIdInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFilters("roomId", event.target.value);
    },
    [handleFilters]
  );

  const sxFormControl = useMemo(
    () => ({
      width: "100%",
      "& .MuiInputBase-root": {
        height: "46px",
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
      //   "& .MuiOutlinedInput-notchedOutline": {
      //     borderColor: "rgba(0, 0, 0, 0.23)"
      //   },
      //  "& .Mui-focused": {
      //     borderColor: "transparent",
      //     boxShadow: "none",
      //   },
      //   "& fieldset": {
      //     borderColor: "transparent",
      //   },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent !important",
        borderStyle: "solid",
      },
      "& .Mui-focused:hover": {
        borderColor: "rgba(0, 0, 0, 0.23) !important",
      },
    }),
    []
  );

  const memoSxList = useMemo(
    () => ({
      overflowY: "auto",
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }),
    []
  );

  return (
    <div className="game-container w-full">
      <Container
        maxWidth="lg"
        className="rounded-lg border text-card-foreground bg-white/10 backdrop-blur-md border-none shadow-xl p-6"
      >
        <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => router.push("/")}
            sx={{ color: "white", mr: 2 }}
          >
            <MdArrowBack />
          </IconButton>
          <Typography
            sx={{ flexGrow: 1 }}
            className="text-white !text-xl md:!text-2xl"
          >
            Danh sách phòng
          </Typography>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={() => roomTableRefetch()}
              sx={{ color: "white", mr: 1 }}
              disabled={roomsLoading}
            >
              <MdRefresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tạo phòng mới">
            {/* <Fab
              className="!bg-rose-200"
              aria-label="add"
              onClick={() => setCreateRoomDialogOpen(true)}
              size="medium"
            >
              <MdAdd className="text-2xl" />
            </Fab> */}
            <Button
              className="!bg-pink-500 hover:!bg-pink-600 !text-white !rounded-full !shadow-lg !min-w-auto"
              onClick={() => setCreateRoomDialogOpen(true)}
            >
              <MdAdd className="h-5 w-5" />
              <p className="my-0 hidden md:block">Tạo phòng</p>
            </Button>
          </Tooltip>
        </Box>

        <div className="mb-4">
          <FormControl sx={sxFormControl}>
            <TextField
              className="bg-white/20 border-white/30 rounded-md"
              placeholder="Tìm kiếm theo Room ID"
              value={filters?.roomId}
              onChange={handleChangeRoomIdInput}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      sx={{ color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </div>
        {roomsLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <CircularProgress className="!text-white" />
          </Box>
        ) : (
          <>
            {isMobile ? (
              // Mobile view - Card list
              <Box sx={{ mb: 3 }}>
                {paginatedRooms.length > 0 ? (
                  <List sx={memoSxList}>
                    {paginatedRooms.map((room) => {
                      const isFull = room.playerCount === room.maxPlayer;
                      return (
                        <ListItem key={room.roomId} className="!px-0">
                          <RoomDetailCard
                            room={room}
                            handleRoomClick={handleRoomClick}
                            isFull={isFull}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ mb: 2 }}>
                      Không tìm thấy phòng nào phù hợp
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<MdAdd />}
                      onClick={() => setCreateRoomDialogOpen(true)}
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
                      Tạo phòng mới
                    </Button>
                  </Paper>
                )}
              </Box>
            ) : (
              // Desktop view - Table
              <TableContainer
                component={Paper}
                sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}
              >
                <Table>
                  <TableHead
                    className="bg-white/10"
                    sx={{
                      background: "#955FEF", // Gradient tím
                    }}
                  >
                    <TableRow>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        ID
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Tên phòng
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Người chơi
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Chủ phòng
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Mật khẩu
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRooms.length > 0 ? (
                      paginatedRooms.map((room) => (
                        <TableRow
                          key={room.roomId}
                          hover
                          sx={{
                            "&:hover": { cursor: "pointer" },
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Typography fontWeight="medium">
                              {room.roomId}
                            </Typography>
                          </TableCell>
                          <TableCell component="th" scope="row">
                            <Typography fontWeight="medium">
                              {room.roomName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <ChipRoomStatus status={room.status} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <IoMdPeople className="mr-1 text-xl" />
                              <Typography className="text-xl">
                                {room.playerCount}/{room.maxPlayer}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{room.hostName}</TableCell>
                          <TableCell>
                            {room.hasPassword ? (
                              <Tooltip title="Có mật khẩu">
                                <MdLock className="text-xl" />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Không mật khẩu">
                                <MdLockOpen className="text-emerald-600 text-xl" />
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<MdPersonAdd />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRoomClick(room);
                              }}
                              sx={
                                room.maxPlayer !== room.playerCount &&
                                room.status !== RoomStatusEnum.Playing &&
                                room.status !== RoomStatusEnum.Ended
                                  ? {
                                      background:
                                        "linear-gradient(45deg, rgb(106, 61, 232) 30%, rgb(158, 127, 249) 90%)",
                                      color: "white",
                                      boxShadow:
                                        "0 3px 5px 2px rgba(106, 61, 232, 0.3)",
                                      "&:hover": {
                                        background:
                                          "linear-gradient(45deg, rgb(106, 61, 232) 10%, rgb(158, 127, 249) 100%)",
                                      },
                                    }
                                  : {}
                              }
                              disabled={
                                room.maxPlayer === room.playerCount ||
                                room.status === RoomStatusEnum.Playing ||
                                room.status === RoomStatusEnum.Ended
                              }
                            >
                              Tham gia
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography sx={{ mb: 2 }}>
                            Không tìm thấy phòng nào phù hợp
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<MdAdd />}
                            onClick={() => setCreateRoomDialogOpen(true)}
                            sx={{
                              background:
                                "linear-gradient(45deg, rgb(106, 61, 232) 30%, rgb(158, 127, 249) 90%)",
                              color: "white",
                              boxShadow:
                                "0 3px 5px 2px rgba(106, 61, 232, 0.3)",
                              "&:hover": {
                                background:
                                  "linear-gradient(45deg, rgb(106, 61, 232) 10%, rgb(158, 127, 249) 100%)",
                              },
                            }}
                            className="w-fit flex items-center gap-1"
                          >
                            Tạo phòng mới
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {roomsArray.length > rowsPerPage && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                  mb: 4,
                }}
              >
                <Pagination
                  count={Math.ceil(roomsArray.length / rowsPerPage)}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px", // Khoảng cách giữa các nút
                    "& .MuiPaginationItem-root": {
                      //   background: "linear-gradient(45deg, #6a11cb, #8e44ad)", // Gradient tím
                      color: "white", // Màu chữ trắng
                      fontWeight: "bold", // Chữ đậm
                      borderRadius: "50%", // Nút bo tròn
                      "&:hover": {
                        background: "rgba(0, 0, 0, 0.04)", // Đảo gradient khi hover
                        boxShadow: "0px 4px 10px rgba(106, 61, 232, 0.5)", // Hiệu ứng bóng
                      },
                      "&.Mui-selected": {
                        background: "rgb(106, 61, 232)", // Màu tím đậm cho nút được chọn
                        color: "white",
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Join Room Dialog */}
        <JoinRoomDialog
          open={joinRoomDialogOpen}
          onClose={() => setJoinRoomDialogOpen(false)}
          room={selectedRoom}
        />
      </Container>
      <CreateRoomDialog
        open={createRoomDialogOpen}
        onClose={() => setCreateRoomDialogOpen(false)}
      />
    </div>
  );
};

export default memo(RoomList);
