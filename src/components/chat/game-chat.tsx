"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Badge,
  Button,
  Card,
  IconButton,
  TextField,
  Popover,
} from "@mui/material";
import { LuCrown, LuMessageCircle, LuSend, LuUsers } from "react-icons/lu";
import { FaTimes } from "react-icons/fa";
import { cn } from "@/utils/cn";
import { signalRMethods, useGameStore } from "@/lib/signalr-connection";
import { useSnackbar } from "notistack";
import { Event } from "@/types/event/event";

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

type Props = {
  roomName: string;
  roomId: string;
  playerId: string;
  playerHost: string;
};

export default function GameChat({
  roomName,
  roomId,
  playerId,
  playerHost,
}: Props) {
  const connection = useGameStore((state) => state.connection);
  const { enqueueSnackbar } = useSnackbar();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Popover open/close
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "game-chat-popover" : undefined;

  // Hàm gửi tin nhắn qua SignalR
  const handleSendMessage = useCallback(
    async ({ message }: { message: string }) => {
      if (!connection) {
        enqueueSnackbar("Kết nối không thành công. Vui lòng thử lại sau.", {
          variant: "error",
        });
        return;
      }

      if (!roomId || !playerId) {
        enqueueSnackbar("Room ID và player ID là bắt buộc.", {
          variant: "error",
        });
        return;
      }

      if (!message.trim()) {
        return;
      }

      try {
        await signalRMethods.sendMessage(
          connection,
          roomId,
          playerId,
          message.trim()
        );
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        enqueueSnackbar("Gửi tin nhắn thất bại!", { variant: "error" });
      }
    },
    [connection, roomId, playerId, enqueueSnackbar]
  );

  // Xử lý nhận tin nhắn từ SignalR
  useEffect(() => {
    if (!connection) return;

    connection.on(
      Event.ReceiveMessage,
      ({
        message,
        playerId,
        playerName,
        messTime,
      }: {
        message: string;
        playerId: string;
        playerName: string;
        messTime: string;
      }) => {
        const chatMessage: ChatMessage = {
          playerId,
          playerName,
          message,
          timestamp: messTime,
        };

        setMessages((prevMessages) => [...prevMessages, chatMessage]);

        if (!open) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    );

    return () => {
      connection.off(Event.ReceiveMessage);
    };
  }, [connection, open, playerId]);

  // Cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus vào input khi mở chat
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  // Xử lý khi nhấn phím Enter
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage({
          message: newMessage.trim(),
        });
      }
    },
    [handleSendMessage, newMessage]
  );

  // Limit displayed messages for performance
  const displayedMessages = useMemo(() => messages.slice(-50), [messages]);

  const filteredData = displayedMessages.filter(
    (item) => Object.keys(item).length > 0
  );

  // Style cho TextField
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
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleOpen}
          className="!min-w-auto relative w-14 h-14 !rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200"
          size="large"
        >
          <LuMessageCircle className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Chat Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            className: "w-80 h-96 shadow-2xl !rounded-lg",
          },
        }}
      >
        <Card className="h-full bg-white/95 backdrop-blur-sm border-0">
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg">
              <div className="flex items-center gap-2">
                <LuUsers className="w-5 h-5 text-white" />
                <h3 className="font-semibold text-white">Chat phòng</h3>
                <Badge
                  variant="standard"
                  className="bg-white/20 text-white border-0 px-2 rounded-md"
                >
                  {roomName}
                </Badge>
              </div>
              <IconButton
                onClick={handleClose}
                className="!text-white !absolute !right-2 !top-2 !text-sm"
              >
                <FaTimes />
              </IconButton>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {filteredData.map((message, index) => {
                  const isCurrentUser = message.playerId === playerId;
                  const isHost = message.playerId === playerHost;

                  return (
                    <motion.div
                      key={`${message?.playerId}-${message?.timestamp}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          isCurrentUser ? "order-2" : "order-1"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {!isCurrentUser && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-600">
                                {message.playerName}
                              </span>
                              {isHost && (
                                <LuCrown className="w-3 h-3 text-yellow-600" />
                              )}
                            </div>
                          )}
                          {isCurrentUser && (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-xs font-medium text-gray-600">
                                {message.playerName}
                              </span>
                              {isHost && (
                                <LuCrown className="w-3 h-3 text-yellow-600" />
                              )}
                            </div>
                          )}
                        </div>
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            isCurrentUser
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isCurrentUser ? "text-white/70" : "text-gray-500"
                            }`}
                          >
                            {message?.timestamp}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-gray-50 border-gray-300">
              <div className="flex gap-2">
                <TextField
                  sx={sxFormControl}
                  inputRef={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 border-gray-200 focus:!border-purple-400 focus:!ring-purple-400"
                />
                <IconButton
                  onClick={() => handleSendMessage({ message: newMessage })}
                  disabled={!newMessage.trim()}
                  className={cn(
                    "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 !text-white w-10 h-10 !rounded-md",
                    {
                      "opacity-50": !newMessage.trim(),
                    }
                  )}
                >
                  <LuSend className="w-4 h-4" />
                </IconButton>
              </div>

              {/* Quick Reactions */}
              <div className="flex gap-1 mt-2">
                {["😂", "👍", "❤️", "😮", "🔥"].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="outlined"
                    size="small"
                    onClick={() => setNewMessage((prev) => prev + emoji)}
                    className="!text-lg p-1 !w-fit hover:!bg-purple-100 !border-0 !min-w-auto"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Popover>
    </>
  );
}
