import {
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  TextField,
} from "@mui/material";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { LuCircleArrowLeft } from "react-icons/lu";
import { TbMessageHeart } from "react-icons/tb";

interface CouplesSetupProps {
  onStart: (players: string[]) => void;
  onBack: () => void;
}

export default function CouplesSetup({ onStart, onBack }: CouplesSetupProps) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [error, setError] = useState("");

  const [errorPassword, setErrorPassword] = useState("");

  // Show screen to play
  const [isValid, setIsValid] = useState(false);

  const [password, setPassword] = useState("");

  const handleCheckStart = () => {
    if (password.trim() === "22032025") {
      setIsValid(true);
    } else {
      setErrorPassword("Sai mật khẩu ròi nhaaa !!!");
      return;
    }
  };

  const handleStart = () => {
    if (!player1.trim() || !player2.trim()) {
      setError("Vui lòng nhập tên của cả hai người");
      return;
    }

    if (player1.trim() === player2.trim()) {
      setError("Tên của hai người không được trùng nhau");
      return;
    }

    onStart([player1.trim(), player2.trim()]);
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Card className="w-full max-w-md bg-white p-6 shadow-lg">
      <div className="flex items-center">
        <IconButton className="" onClick={onBack}>
          <LuCircleArrowLeft className="text-2xl" />
        </IconButton>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-xl font-bold text-transparent flex items-center md:text-2xl">
            Chế độ Cặp đôi Đặc Biệt{" "}
            <TbMessageHeart className="ml-2 inline-block h-5 w-5 text-pink-500" />
          </h2>
        </motion.div>
      </div>

      {isValid ? (
        <>
          <CardContent className="space-y-4 p-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <FormControl sx={sxFormControl}>
                  <TextField
                    id="player1"
                    label="Tên người thứ nhất"
                    value={player1}
                    onChange={(e) => setPlayer1(e.target.value)}
                    className="w-full"
                  />
                </FormControl>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <FormControl sx={sxFormControl}>
                  <TextField
                    id="player2"
                    label="Tên người thứ hai"
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                    className="w-full"
                  />
                </FormControl>
              </motion.div>
              {error && (
                <motion.p
                  className="text-sm font-medium text-red-500"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          </CardContent>
          <div>
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 font-medium !text-white"
                onClick={handleStart}
              >
                Bắt đầu chơi
              </Button>
            </motion.div>
          </div>
        </>
      ) : (
        <>
          <CardContent className="space-y-4 p-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <p className="border-l-2 border-yellow-400 pl-1 font-medium text-yellow-600 mb-5">
                  Hãy nhập đúng mật khẩu để tham gia vào chế độ này
                </p>
                <FormControl sx={sxFormControl}>
                  <TextField
                    id="password"
                    label="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    placeholder="Ngày bắt đầu quen nhau"
                    type="password"
                    // slotProps={{
                    //   input: (
                    //     <InputAdornment position="end">
                    //       <IconButton
                    //         onClick={() => setOpenPassword(!openPassword)}
                    //         edge="end"
                    //       >
                    //         {openPassword ? <LuEyeClosed /> : <LuEye />}
                    //       </IconButton>
                    //     </InputAdornment>
                    //   ),
                    // }}
                  />
                </FormControl>
              </motion.div>

              {errorPassword && (
                <motion.p
                  className="text-sm font-medium text-red-500"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {errorPassword}
                </motion.p>
              )}
            </motion.div>
          </CardContent>
          <div>
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 font-medium !text-white"
                onClick={handleCheckStart}
              >
                Xác nhận
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </Card>
  );
}
