"use client";

import { Button, Card } from "@mui/material";
import React, { memo, useCallback, useState } from "react";
import { GoPeople } from "react-icons/go";
import FriendsSetup from "../friends-setup/page";
import GameScreen from "../game/page";
import CouplesSetup from "../couple/page";
import PartySetup from "../party/page";
import SpeicalCoupleSetup from "../special-couple/page";

import { motion, AnimatePresence } from "framer-motion";
import { LuPartyPopper } from "react-icons/lu";
import { TbMessageHeart } from "react-icons/tb";
import { BsBox2Heart } from "react-icons/bs";
import { QuestionModeEnum } from "@/types/question/question-mode-enum";
import { Player } from "@/types/player/player";

type GameMode = "menu" | "friends" | "couples" | "party" | "game" | "special";

type Props = {
  players: Player[];
};
const TruthOrDareGame = ({ players }: Props) => {
  const [currentScreen, setCurrentScreen] = useState<GameMode>("menu");
  // const [players, setPlayers] = useState<Player[]>([]);
  const [currentMode, setCurrentMode] = useState<QuestionModeEnum>(
    QuestionModeEnum.Friends
  );

  const [direction, setDirection] = useState(1);

  const handleModeSelect = (mode: QuestionModeEnum) => {
    setDirection(1);
    setCurrentMode(mode);
    setCurrentScreen(mode);
  };

  const startGame = () => {
    setDirection(1);
    // setPlayers(playerNames);
    setCurrentScreen("game");
  };

  const backToMenu = () => {
    setDirection(-1);
    setCurrentScreen("menu");
    // setPlayers([]);
  };

  const renderScreen = useCallback(() => {
    if (currentScreen === "friends") {
      return <FriendsSetup onStart={startGame} onBack={backToMenu} />;
    }

    if (currentScreen === "couples") {
      return <CouplesSetup onStart={startGame} onBack={backToMenu} />;
    }

    if (currentScreen === "party") {
      return (
        <PartySetup onStart={startGame} onBack={backToMenu} players={players} />
      );
    }

    if (currentScreen === "special") {
      return <SpeicalCoupleSetup onStart={startGame} onBack={backToMenu} />;
    }

    if (currentScreen === "game") {
      return <GameScreen mode={currentMode} players={players} />;
    }

    if (currentScreen === "menu") {
      return (
        <Card className="w-full max-w-md bg-white p-6 shadow-lg">
          <div className="space-y-4">
            <motion.h2
              className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Chọn chế độ chơi
            </motion.h2>
            <div className="flex justify-center gap-4 flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outlined"
                  className=" hover:!bg-purple-100 !text-black !font-medium !text-md items-center gap-4 w-full !justify-start !border-gray-200"
                  onClick={() => handleModeSelect(QuestionModeEnum.Friends)}
                >
                  <GoPeople className="text-lg text-purple-500" />
                  <div className="flex flex-col items-start">
                    <div className="font-medium">Bạn bè</div>
                    <div className="text-sm text-gray-500">
                      Chơi cùng bạn thân
                    </div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="outlined"
                  className=" hover:!bg-pink-100 !text-black !font-medium !text-md items-center gap-4 w-full !justify-start !border-gray-200"
                  onClick={() => handleModeSelect(QuestionModeEnum.Couples)}
                >
                  <TbMessageHeart className="text-lg text-pink-500" />
                  <div className="flex flex-col items-start">
                    <div className="font-medium">Cặp đôi</div>
                    <div className="text-sm text-gray-500">
                      Dành cho người yêu
                    </div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outlined"
                  className="!text-black !font-medium !text-md items-center gap-4 w-full !justify-start !border-gray-200"
                  onClick={() => handleModeSelect(QuestionModeEnum.Party)}
                >
                  <LuPartyPopper className="text-lg text-blue-500" />
                  <div className="flex flex-col items-start">
                    <div className="font-medium">Buổi tiệc</div>
                    <div className="text-sm text-gray-500">
                      Chơi nhóm vui vẻ
                    </div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outlined"
                  className="!text-black !font-medium !text-md items-center gap-4 w-full !justify-start !border-gray-200"
                  onClick={() => handleModeSelect(QuestionModeEnum.Special)}
                >
                  <BsBox2Heart className="text-lg text-rose-500" />
                  <div className="flex flex-col items-start">
                    <div className="font-medium">Cặp đôi đặc biệt</div>
                    <div className="text-sm text-gray-500">
                      Dành cho người yêu đặc biệt
                    </div>
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
    }
  }, [currentMode, currentScreen, players]);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        initial={{
          opacity: 0,
          x: direction * 100,
        }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
        }}
        exit={{
          opacity: 0,
          x: direction * -100,
          transition: {
            duration: 0.2,
          },
        }}
        className="w-full flex justify-center"
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
};

export default memo(TruthOrDareGame);
