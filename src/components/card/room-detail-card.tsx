"use client";

import { Card, CardContent, Divider, Typography, Box } from "@mui/material";
import { memo } from "react";
import { MdLock, MdLockOpen } from "react-icons/md";
import { format } from "date-fns";
import { Room } from "@/types/room/room";
import CopyButton from "../copy-button/copy-button";
import ChipRoomStatus from "../chip/chip-room-status";
import { IoMdPeople } from "react-icons/io";

type Props = {
  room: Room;
  isFull?: boolean;
  handleRoomClick: (room: Room) => void;
};
function RoomDetailCard({ room, isFull, handleRoomClick }: Props) {
  const sxCard = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    cursor: isFull ? "default" : "pointer",
    opacity: isFull ? 0.6 : 1,
    position: "relative", // Cho lớp phủ
    transition: "transform 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: 4,
    },
  };

  const sxCardContent = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };
  return (
    <Card sx={sxCard} onClick={() => !isFull && handleRoomClick(room)}>
      <CardContent sx={sxCardContent} className="!p-4">
        {/* Header */}
        <div className="grid w-full grid-cols-10 justify-between gap-2 items-center">
          <div className="col-span-6 flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Typography noWrap color="primary" className="!text-md">
                <span className="w-full overflow-hidden text-ellipsis">
                  ID: {room.roomId}
                </span>
              </Typography>
              <CopyButton textToCopy={room.roomId} />
            </div>
            <Typography className="!text-sm !font-normal">
              {room.createdAt
                ? format(new Date(`${room.createdAt}`), "HH:mm dd/MM/yyyy")
                : ""}
            </Typography>
          </div>
          <div className="col-span-4 flex items-end justify-end overflow-hidden">
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                className="!w-full !text-sm !font-normal"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {room.hostName}
              </Typography>
            </Box>
          </div>
        </div>

        <Divider className="my-1" />

        {/* Customer Info */}
        <div className="flex w-full justify-between text-sm">
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IoMdPeople className="mr-1 text-base" />
            <Typography className="text-base">
              {room.playerCount}/{room.maxPlayer}
            </Typography>
          </Box>
          <Box>
            {room.hasPassword ? (
              <MdLock className="text-base" />
            ) : (
              <MdLockOpen className="text-emerald-600 text-base" />
            )}
          </Box>
        </div>

        <Divider className="my-1" />

        {/* Status */}
        <div className="flex w-full items-center justify-between gap-2">
          <ChipRoomStatus status={room.status} className="w-fit !text-sm" />
        </div>
      </CardContent>

      {/* Thêm lớp phủ với nội dung "Phòng đã đầy" */}
      {isFull && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <Typography variant="body1" color="error" sx={{ fontWeight: "bold" }}>
            Phòng đã đủ người
          </Typography>
        </Box>
      )}
    </Card>
  );
}

export default memo(RoomDetailCard);
