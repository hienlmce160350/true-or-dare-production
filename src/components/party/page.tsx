import { Player } from "@/types/player/player";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  TextField,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
// import { FaTimes } from "react-icons/fa";
// import { FiPlus } from "react-icons/fi";
import { LuCircleArrowLeft, LuPartyPopper } from "react-icons/lu";

interface PartySetupProps {
  onStart: () => void;
  onBack: () => void;
  players: Player[];
}

export default function PartySetup({
  onStart,
  onBack,
  players,
}: PartySetupProps) {
  // const [players, setPlayers] = useState<string[]>(["", ""]);
  // const [error, setError] = useState("");

  // const addPlayer = () => {
  //   setPlayers([...players, ""]);
  // };

  // const removePlayer = (index: number) => {
  //   if (players.length <= 2) {
  //     setError("Cần ít nhất 2 người chơi");
  //     return;
  //   }

  //   const newPlayers = [...players];
  //   newPlayers.splice(index, 1);
  //   setPlayers(newPlayers);
  // };

  // const updatePlayer = (index: number, name: string) => {
  //   const newPlayers = [...players];
  //   newPlayers[index] = name;
  //   setPlayers(newPlayers);
  // };

  const handleStart = () => {
    // const trimmedPlayers = players.map((p) => p.playerName.trim()).filter((p) => p !== "");
    // if (trimmedPlayers.length < 2) {
    //   setError("Cần ít nhất 2 người chơi");
    //   return;
    // }

    // // Check for duplicate names
    // const uniquePlayers = new Set(trimmedPlayers);
    // if (uniquePlayers.size !== trimmedPlayers.length) {
    //   setError("Tên của người chơi không được trùng nhau");
    //   return;
    // }

    onStart();
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
          <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent flex items-center md:text-2xl">
            Chế độ Buổi tiệc{" "}
            <LuPartyPopper className="ml-2 inline-block h-5 w-5 text-blue-500" />
          </h2>
        </motion.div>
      </div>

      <CardContent className="space-y-4 p-6">
        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Thêm tên của tất cả người chơi (tối thiểu 2 người)
        </motion.p>

        <AnimatePresence>
          {players.map((player, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FormControl sx={sxFormControl}>
                <TextField
                  id={`player${index + 1}`}
                  label={`Người chơi ${index + 1}`}
                  value={player.playerName}
                  // onChange={(e) => updatePlayer(index, e.target.value)}
                  className="w-full"
                />
              </FormControl>

              {/* <IconButton
                onClick={() => removePlayer(index)}
                className="flex-shrink-0 !min-w-auto !text-black"
              >
                <FaTimes className="text-sm" />
              </IconButton> */}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outlined"
            className="flex w-full items-center justify-center gap-2 !border-gray-300 !text-black hover:!bg-gray-100"
            onClick={addPlayer}
          >
            <FiPlus className="h-4 w-4" />
            Thêm người chơi
          </Button>
        </motion.div> */}

        {/* <AnimatePresence>
          {error && (
            <motion.p
              className="text-sm font-medium text-red-500"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence> */}
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
