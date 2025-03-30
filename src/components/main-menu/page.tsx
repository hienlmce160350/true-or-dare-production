import { Button, Card } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";

const MainMenuGame = () => {
  const router = useRouter();
  const renderScreen = useCallback(() => {
    return (
      <Card className="w-full max-w-md bg-white p-6 shadow-lg">
        <div className="space-y-4">
          {/* <motion.h2
            className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Chào mừng các bạn đến với thế giới của sự thật và thách thức
          </motion.h2> */}
          <div className="flex justify-center gap-4 flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 font-medium !text-white"
                onClick={() => router.push("/rooms")}
              >
                {/* <GoPeople className="text-lg text-purple-500" /> */}
                <div className="flex flex-col items-start">
                  <div className="font-medium">Chơi ngay</div>
                  {/* <div className="text-sm text-gray-500">
                          Chơi cùng bạn thân
                        </div> */}
                </div>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 font-medium !text-white"
                onClick={() => router.push("/create-room")}
              >
                {/* <TbMessageHeart className="text-lg text-pink-500" /> */}
                <div className="flex flex-col items-start">
                  <div className="font-medium">Tạo phòng</div>
                  {/* <div className="text-sm text-gray-500">
                          Dành cho người yêu
                        </div> */}
                </div>
              </Button>
            </motion.div>
          </div>
          {/* <div className="flex items-center justify-between w-full">
                  <Button
                    variant="outlined"
                    className=" !border-purple-700 hover:!bg-purple-600 !text-purple-700 hover:!text-white !font-medium !text-md items-center gap-2"
                  >
                    <FaPlus />
                    Thêm người chơi
                  </Button>
    
                  <Button
                    variant="contained"
                    className=" !bg-purple-700 hover:!bg-purple-600 !text-white-700 hover:!text-white !font-medium !text-md items-center gap-2"
                  >
                    Bắt đầu
                  </Button>
                </div> */}
        </div>
      </Card>
    );
  }, [router]);
  return <>{renderScreen()}</>;
};

export default memo(MainMenuGame);
