"use client";

import { useGetRoomListQuery } from "@/api/rooms";
import { Button, Card, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { IoHomeOutline } from "react-icons/io5";
import { LuRefreshCw } from "react-icons/lu";

export default function RoomList() {
  const router = useRouter();
  // Ensure rooms is always an array
  const { rooms, roomTableRefetch } = useGetRoomListQuery({});
  const roomsArray = Array.isArray(rooms) ? rooms : [];

  return (
    <Card className="w-full max-w-md bg-white p-3 shadow-lg relative">
      <div className="flex items-center justify-between">
        <IconButton onClick={router.back} className="!text-black">
          <IoHomeOutline className="h-5 w-5" />
        </IconButton>
        <div className="flex items-center gap-2">
          {/* Thêm nút hiển thị lịch sử */}
          <Button
            onClick={() => roomTableRefetch}
            className="relative flex h-10 w-10 items-center hover:text-primary !min-w-auto hover:!bg-purple-50 !text-black !rounded-full"
          >
            <LuRefreshCw className="h-5 w-5" />
          </Button>
          <div className="rounded-xl bg-purple-100 p-1">
            <h2 className={`text-sm font-normal text-purple-800`}>
              Danh sách phòng
            </h2>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-6">
        {/* <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Available Rooms</h3>
          <Button
            onClick={() => roomTableRefetch}
            className="p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Refresh room list"
          >
            <LuRefreshCw className="h-10 w-10" />
          </Button>
        </div> */}

        {roomsArray.length === 0 ? (
          <p className="text-center py-4">No rooms available. Create one!</p>
        ) : (
          <ul className="space-y-2 border rounded-md border-gray-200 shadow">
            {roomsArray.map((room) => (
              <li
                key={room.roomId}
                className="bg-white/5 rounded-lg overflow-hidden"
              >
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{room.roomName}</h4>
                    <p className="text-sm text-gray-300">
                      {room.players?.length || 0} người chơi
                    </p>
                  </div>
                  <Button
                    //   onClick={() => onJoinRoom(room.id)}
                    variant="contained"
                    className="px-3 py-1.5 !bg-purple-600 hover:!bg-purple-700 rounded-lg transition"
                  >
                    Tham gia
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
