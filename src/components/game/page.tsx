"use client";

import { Badge, Button, Card, CardContent, IconButton } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { LuHistory, LuRefreshCw } from "react-icons/lu";
import { format } from "date-fns";
import { FaTimes } from "react-icons/fa";
import { QuestionModeEnum } from "@/types/question/question-mode-enum";
import { QuestionTypeEnum } from "@/types/question/question-type-enum";
import { Question } from "@/types/question/question";
import { Player } from "@/types/player/player";
import { cn } from "@/utils/cn";
import { signalRMethods, useGameStore } from "@/lib/signalr-connection";
import { getStorage } from "@/hooks/use-local-storage";
import { enqueueSnackbar } from "notistack";
import { Event } from "@/types/event/event";

interface GameScreenProps {
  mode: QuestionModeEnum;
  players: Player[];
  roomId?: string;
  setGameEndDialogOpen: (open: boolean) => void;
  currentPlayerIdTurn?: string | null;
  isCheckYourTurn?: boolean;
  setCurrentPlayerIdTurn?: (id: string | null) => void;

  isHost?: boolean;
}

interface QuestionHistory {
  playerName: string;
  questionType: QuestionTypeEnum;
  questionText: string;
  timestamp: Date;
}

export default function GameScreen({
  mode,
  players,
  roomId,
  setGameEndDialogOpen,
  currentPlayerIdTurn,
  isCheckYourTurn,
  setCurrentPlayerIdTurn,
  isHost
}: GameScreenProps) {
  const playerState = getStorage("player");
  const connection = useGameStore((state) => state.connection);
  const playerIndex = players.findIndex(
    (player) =>
      player.playerId === (currentPlayerIdTurn || players[0]?.playerId)
  );
  const [questionType, setQuestionType] = useState<QuestionTypeEnum | null>(
    null
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<QuestionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSelectQuestionType = useCallback(
    async (type: QuestionTypeEnum) => {
      if (!connection) {
        enqueueSnackbar({
          variant: "error",
          message: "Connection not established. Please refresh the page.",
        });
        return;
      }

      if (!roomId || !playerState?.state?.playerId) {
        enqueueSnackbar({
          variant: "error",
          message: "Room ID and player ID are required.",
        });
        return;
      }

      try {
        await signalRMethods.getRandomQuestion(
          connection,
          roomId,
          playerState?.state?.playerId,
          type
        );
      } catch (error) {
        console.error("Error fetching question:", error);
        enqueueSnackbar({
          variant: "error",
          message: "Không thể lấy câu hỏi.",
        });
      }
    },
    [connection, playerState?.state?.playerId, roomId]
  );

  const handleNextPlayer = useCallback(
    async (isLast: boolean = false) => {
      if (!connection) {
        enqueueSnackbar({
          variant: "error",
          message: "Connection not established. Please refresh the page.",
        });
        return;
      }

      if (!roomId || !playerState?.state?.playerId) {
        enqueueSnackbar({
          variant: "error",
          message: "Room ID and player ID are required.",
        });
        return;
      }

      try {
        await signalRMethods.nextPlayer(
          connection,
          roomId,
          playerState?.state?.playerId
        );
        if (isLast && isHost) {
          setGameEndDialogOpen(true);
        }
      } catch (error) {
        console.error("Error next player:", error);
        enqueueSnackbar({
          variant: "error",
          message: "Không thể chuyển lượt.",
        });
      }
    },
    [connection, playerState?.state?.playerId, roomId, setGameEndDialogOpen]
  );

  const selectQuestionType = useCallback(
    async (type: QuestionTypeEnum) => {
      setQuestionType(type);
      setIsRevealing(true);
      await handleSelectQuestionType(type);
    },
    [handleSelectQuestionType]
  );

  const nextTurn = useCallback(async () => {
    await handleNextPlayer();
  }, [handleNextPlayer]);

  const lastTurn = useCallback(async () => {
    await handleNextPlayer(true);
  }, [handleNextPlayer]);

  useEffect(() => {
    connection?.on(Event.GetQuestionSuccess, (result) => {
      setCurrentQuestion(result);
      setIsRevealing(false);
      if (result?.isGameEnded) {
        setGameEndDialogOpen(true);
      }

      if (questionType && result && playerIndex >= 0) {
        const historyItem: QuestionHistory = {
          playerName: players[playerIndex]?.playerName || "Unknown",
          questionType: questionType,
          questionText: result.text,
          timestamp: new Date(),
        };
        setQuestionHistory((prev) => [...prev, historyItem]);
      }
    });

    connection?.on(Event.QuestionAssigned, (result) => {
      setQuestionType(result.type);
      setCurrentQuestion(result);
      setIsLastQuestion(result.isLastQuestion);
    });

    connection?.on(Event.NextPlayerTurn, (result) => {
      setCurrentPlayerIdTurn?.(result.nextPlayerId);
      setQuestionType(null);
      setCurrentQuestion(null);
      enqueueSnackbar({
        variant: "info",
        message: `Lượt của ${result.nextPlayerName}`,
      });
    });

    connection?.on(Event.StartGameSuccess, () => {});

    return () => {
      connection?.off(Event.QuestionAssigned);
      connection?.off(Event.GetQuestionSuccess);
      connection?.off(Event.NextPlayerTurn);
      connection?.off(Event.StartGameSuccess);
    };
  }, [
    connection,
    playerIndex,
    players,
    questionType,
    setCurrentPlayerIdTurn,
    setGameEndDialogOpen,
  ]);

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  const clearHistory = useCallback(() => {
    setQuestionHistory([]);
  }, []);

  const getModeColor = () => {
    switch (mode) {
      case "friends":
        return "from-purple-600 to-blue-600";
      case "couples":
        return "from-pink-500 to-purple-600";
      case "party":
        return "from-blue-600 to-purple-600";
      case "special":
        return "from-rose-500 to-purple-600";
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case "friends":
        return "Bạn bè";
      case "couples":
        return "Cặp đôi";
      case "party":
        return "Buổi tiệc";
      case "special":
        return "Cặp đôi đặc biệt";
    }
  };

  const renderGameContent = useCallback(() => {
    if (
      !questionType &&
      // isNotYourTurn &&
      playerState?.state?.playerId !== currentPlayerIdTurn
    ) {
      return (
        <motion.div
          key="selection"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <motion.div
            className="rounded-lg bg-gray-100 p-4 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <p className="text-sm text-gray-500">Lượt của</p>
            <p className="text-xl font-bold text-gray-800">
              {playerIndex >= 0
                ? players.find(
                    (player) => player.playerId === currentPlayerIdTurn
                  )?.playerName
                : "Đang chờ..."}
            </p>
          </motion.div>

          <motion.p
            className={cn(
              "text-center text-gray-700",
              isCheckYourTurn ? "" : "hidden"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Bạn chọn gì?
          </motion.p>

          <motion.div
            className={cn(
              "flex items-center justify-center gap-3",
              isCheckYourTurn ? "" : "hidden"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              className="!bg-blue-500 py-8 text-lg font-medium hover:!bg-blue-600 !text-white w-fit !rounded-lg"
              onClick={() => selectQuestionType(QuestionTypeEnum.Truth)}
              disabled={!isCheckYourTurn}
            >
              Thật
            </Button>
            <Button
              className="!bg-orange-400 py-8 text-lg font-medium hover:!bg-orange-600 !text-white w-fit !rounded-lg"
              onClick={() => selectQuestionType(QuestionTypeEnum.Dare)}
              disabled={!isCheckYourTurn}
            >
              Thách
            </Button>
          </motion.div>
        </motion.div>
      );
    }

    if (
      questionType &&
      // isNotYourTurn &&
      playerState?.state?.playerId !== currentPlayerIdTurn
    ) {
      return (
        <motion.div
          key="question"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6 p-2 md:p-6"
        >
          <motion.div
            className="rounded-lg bg-gray-100 p-4 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <p className="text-sm text-gray-500">Lượt của</p>
            <p className="text-xl font-bold text-gray-800">
              {playerIndex >= 0
                ? players.find(
                    (player) => player.playerId === currentPlayerIdTurn
                  )?.playerName
                : "Waiting..."}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600">
              Đã chọn:{" "}
              <span
                className={
                  questionType === "truth" ? "text-blue-600" : "text-purple-600"
                }
              >
                {questionType === "truth" ? "Thật" : "Thách"}
              </span>
            </p>
          </motion.div>

          <AnimatePresence>
            {isRevealing ? (
              <motion.div
                key="revealing"
                className={`flex h-32 items-center justify-center rounded-lg border-2 ${
                  questionType === "truth"
                    ? "border-blue-200 bg-blue-50"
                    : "border-purple-200 bg-purple-50"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <LuRefreshCw
                    className={`h-10 w-10 ${
                      questionType === "truth"
                        ? "text-blue-400"
                        : "text-purple-400"
                    }`}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="question-revealed"
                className={`rounded-lg border-2 ${
                  questionType === "truth"
                    ? "border-blue-200 bg-blue-50"
                    : "border-purple-200 bg-purple-50"
                } p-6 text-center`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <p className="text-lg font-medium text-gray-800">
                  {currentQuestion?.text || "Loading..."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }

    if (!questionType) {
      return (
        <motion.div
          key="selection"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <motion.div
            className="rounded-lg bg-gray-100 p-4 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <p className="text-sm text-gray-500">Lượt của</p>
            <p className="text-xl font-bold text-gray-800">
              {playerIndex >= 0
                ? players.find(
                    (player) => player.playerId === currentPlayerIdTurn
                  )?.playerName
                : "Đang chờ..."}
            </p>
          </motion.div>

          <motion.p
            className={cn(
              "text-center text-gray-700",
              isCheckYourTurn ? "" : "hidden"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Bạn chọn gì?
          </motion.p>

          <motion.div
            className={cn(
              "flex items-center justify-center gap-3",
              isCheckYourTurn ? "" : "hidden"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              className="!bg-blue-500 py-8 text-lg font-medium hover:!bg-blue-600 !text-white w-fit !rounded-lg"
              onClick={() => selectQuestionType(QuestionTypeEnum.Truth)}
              disabled={!isCheckYourTurn}
            >
              Thật
            </Button>
            <Button
              className="!bg-orange-400 py-8 text-lg font-medium hover:!bg-orange-600 !text-white w-fit !rounded-lg"
              onClick={() => selectQuestionType(QuestionTypeEnum.Dare)}
              disabled={!isCheckYourTurn}
            >
              Thách
            </Button>
          </motion.div>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          key="question"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6 p-2 md:p-6"
        >
          <motion.div
            className="rounded-lg bg-gray-100 p-4 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <p className="text-sm text-gray-500">Lượt của</p>
            <p className="text-xl font-bold text-gray-800">
              {playerIndex >= 0
                ? players.find(
                    (player) => player.playerId === currentPlayerIdTurn
                  )?.playerName
                : "Đang chờ..."}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600">
              Đã chọn:{" "}
              <span
                className={
                  questionType === "truth" ? "text-blue-600" : "text-purple-600"
                }
              >
                {questionType === "truth" ? "Thật" : "Thách"}
              </span>
            </p>
          </motion.div>

          <AnimatePresence>
            {isRevealing ? (
              <motion.div
                key="revealing"
                className={`flex h-32 items-center justify-center rounded-lg border-2 ${
                  questionType === "truth"
                    ? "border-blue-200 bg-blue-50"
                    : "border-purple-200 bg-purple-50"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <LuRefreshCw
                    className={`h-10 w-10 ${
                      questionType === "truth"
                        ? "text-blue-400"
                        : "text-purple-400"
                    }`}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="question-revealed"
                className={`rounded-lg border-2 ${
                  questionType === "truth"
                    ? "border-blue-200 bg-blue-50"
                    : "border-purple-200 bg-purple-50"
                } p-6 text-center`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <p className="text-lg font-medium text-gray-800">
                  {currentQuestion?.text || "Loading..."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isLastQuestion ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                className={`w-full !text-white ${
                  questionType === "truth"
                    ? "!bg-blue-600 hover:!bg-blue-700"
                    : "!bg-purple-600 hover:!bg-purple-700"
                }`}
                onClick={lastTurn}
                disabled={isRevealing || !isCheckYourTurn}
              >
                Kết thúc
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                className={`w-full !text-white ${
                  questionType === "truth"
                    ? "!bg-blue-600 hover:!bg-blue-700"
                    : "!bg-purple-600 hover:!bg-purple-700"
                }`}
                onClick={nextTurn}
                disabled={isRevealing || !isCheckYourTurn}
              >
                Lượt tiếp theo
              </Button>
            </motion.div>
          )}
        </motion.div>
      );
    }
  }, [
    questionType,
    playerState?.state?.playerId,
    currentPlayerIdTurn,
    playerIndex,
    players,
    isCheckYourTurn,
    selectQuestionType,
    isRevealing,
    currentQuestion?.text,
    isLastQuestion,
    lastTurn,
    nextTurn,
  ]);

  return (
    <Card className="w-full max-w-auto bg-white p-3 shadow-lg relative">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleHistory}
            className="relative flex h-10 w-10 items-center hover:text-primary !min-w-auto hover:!bg-purple-50 !text-black !rounded-full"
          >
            <LuHistory className="h-5 w-5" />
            {questionHistory.length > 0 && (
              <span className="absolute right-0 top-[4px] flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-purple-500 text-white text-xs items-center justify-center">
                  {questionHistory.length}
                </span>
              </span>
            )}
          </Button>
          <div className="rounded-xl bg-purple-100 p-1">
            <h2 className={`text-sm font-normal text-purple-800`}>
              {getModeTitle()}
            </h2>
          </div>
        </div>
      </div>

      {!questionType ? (
        <h2
          className={`bg-gradient-to-r ${getModeColor()} bg-clip-text text-xl md:text-2xl lg:text-3xl font-bold text-transparent text-center mt-4`}
        >
          Thật hay Thách
        </h2>
      ) : null}

      <CardContent className="p-6 !pb-3">
        <AnimatePresence mode="wait">{renderGameContent()}</AnimatePresence>
      </CardContent>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="absolute inset-0 z-10 flex flex-col bg-white"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-b-gray-300 p-4">
              <h3 className="text-lg font-semibold">Lịch sử câu hỏi</h3>
              <div className="flex gap-2">
                {questionHistory.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={clearHistory}
                    className="!text-xs !text-black !border-gray-300 hover:!bg-gray-100"
                  >
                    Xóa lịch sử
                  </Button>
                )}
                <IconButton
                  onClick={toggleHistory}
                  className="flex-shrink-0 !min-w-auto !text-black"
                >
                  <FaTimes className="text-sm" />
                </IconButton>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              {questionHistory.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có câu hỏi nào</p>
              ) : (
                <div className="space-y-4">
                  {questionHistory.map((item, index) => (
                    <motion.div
                      key={index}
                      className="rounded-lg border p-3 border-gray-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              item.questionType === "truth"
                                ? "!bg-blue-500 text-white rounded-sm text-sm p-1"
                                : "!bg-orange-500 text-white rounded-sm text-sm p-1"
                            }
                          >
                            {item.questionType === "truth" ? "Thật" : "Thách"}
                          </Badge>
                          <span className="font-medium">{item.playerName}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.timestamp), "hh:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {item.questionText}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
