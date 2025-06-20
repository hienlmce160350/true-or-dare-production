"use client";

import { RoomStatusEnum } from "@/types/room/room-status-enum";
import { memo } from "react";

type Props = {
  status: RoomStatusEnum;
  className?: string;
};
function ChipRoomStatus({ status, className }: Props) {
  switch (status) {
    case RoomStatusEnum.Waiting:
      return (
        <div className={className}>
          <div
            className={`flex h-fit w-fit items-center justify-center rounded-md bg-green-200 p-1 text-xs font-normal text-black ${className}`}
          >
            Đang chờ
          </div>
        </div>
      );

    case RoomStatusEnum.Playing:
      return (
        <div className={className}>
          <div
            className={`flex h-fit w-fit items-center justify-center rounded-md bg-blue-200 p-1 text-xs font-normal text-black ${className}`}
          >
            Đang chơi
          </div>
        </div>
      );

    case RoomStatusEnum.Ended:
      return (
        <div className={className}>
          <div
            className={`flex h-fit w-fit items-center justify-center rounded-md bg-red-100 p-1 text-xs font-normal text-black ${className}`}
          >
            Kết thúc
          </div>
        </div>
      );

    default:
      return <div className={className}>Unknown</div>;
  }
}

export default memo(ChipRoomStatus);
