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

interface FriendsSetupProps {
  onStart: (players: string[]) => void;
  onBack: () => void;
}

export default function FriendsSetup({ onStart, onBack }: FriendsSetupProps) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!player1.trim() || !player2.trim()) {
      setError("Vui lòng nhập tên của cả hai người chơi");
      return;
    }

    if (player1.trim() === player2.trim()) {
      setError("Tên của hai người chơi không được trùng nhau");
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
        <h2 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl text-center">
          Chế độ Bạn bè
        </h2>
      </div>

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
                label="Tên người chơi 1"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                className="w-full"
              />
            </FormControl>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <FormControl sx={sxFormControl}>
              <TextField
                id="player1"
                label="Tên người chơi 2"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                className="w-full"
              />
            </FormControl>
          </motion.div>
        </motion.div>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
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
    </Card>
  );
}
