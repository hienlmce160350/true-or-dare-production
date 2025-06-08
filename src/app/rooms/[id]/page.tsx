"use client";

import { useGetRoomByIdReactQuery } from "@/api/rooms";
import { getStorage } from "@/hooks/use-local-storage";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import {
  MdEdit,
  MdExitToApp,
  MdMoreVert,
  MdPerson,
  MdPlayArrow,
  MdStars,
} from "react-icons/md";
import { Player } from "@/types/player/player";
import ChangePlayerNameDialog from "@/components/room/dialog/change-player-name-dialog";
import LeaveRoomDialog from "@/components/room/dialog/exit-room-dialog";
import GameScreen from "@/components/game/page";
import { enqueueSnackbar } from "notistack";
import {
  CommonAPIErrors,
  PlayerErrors,
  RoomErrors,
} from "@/api/common/types/common-errors";
import { signalRMethods, useGameStore } from "@/lib/signalr-connection";
import { Event } from "@/types/event/event";
import { IoStopOutline } from "react-icons/io5";
import { RoomStatusEnum } from "@/types/room/room-status-enum";

type RequestChangePlayerName = {
  playerId?: string;
  roomId?: string;
  playerName?: string;
};

const RoomPage = () => {
  const params = useParams();
  const roomId = params?.id as string;
  const connection = useGameStore((state) => state.connection);
  const [gameStarted, setGameStarted] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);

  const [gameEndDialogOpen, setGameEndDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  const playerState = getStorage("player");
  const isCheckYourTurn = currentPlayerId === playerState?.state?.playerId;

  const [changeNameDialogOpen, setChangeNameDialogOpen] = useState(false);
  const [playerMenuAnchorEl, setPlayerMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<RequestChangePlayerName>(
    {}
  );

  const { room, roomLoading, roomRefetch } = useGetRoomByIdReactQuery(
    roomId,
    !!roomId
  );

  const handlePlayerMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    player: Player
  ) => {
    setPlayerMenuAnchorEl(event.currentTarget);
    setSelectedPlayer({
      roomId,
      playerId: player.playerId,
      playerName: player.playerName,
    });
  };

  const handleClosePlayerMenu = () => {
    setPlayerMenuAnchorEl(null);
    setSelectedPlayer({});
  };

  const handleOpenChangeNameDialog = useCallback(() => {
    setChangeNameDialogOpen(true);
  }, []);

  const handleCloseChangeNameDialog = useCallback(() => {
    setChangeNameDialogOpen(false);
    handleClosePlayerMenu();
  }, []);

  const handleOpenExitRoomDialog = useCallback(() => {
    setExitDialogOpen(true);
    setSelectedPlayer({
      roomId,
      playerId: playerState?.state?.playerId,
      playerName: playerState?.state?.playerName,
    });
  }, [playerState?.state?.playerId, playerState?.state?.playerName, roomId]);

  const handleCloseExitRoomDialog = useCallback(() => {
    setExitDialogOpen(false);
    setSelectedPlayer({});
  }, []);

  const handleOpenEndGameDialog = useCallback(() => {
    setEndGameDialogOpen(true);
    setSelectedPlayer({
      roomId,
      playerId: playerState?.state?.playerId,
      playerName: playerState?.state?.playerName,
    });
  }, [playerState?.state?.playerId, playerState?.state?.playerName, roomId]);

  const handleCloseEndGameDialog = useCallback(() => {
    setEndGameDialogOpen(false);
    setSelectedPlayer({});
  }, []);

  const reconnectPlayerSignalR = useCallback(async () => {
    if (
      connection &&
      roomId &&
      playerState?.state?.playerId &&
      playerState?.state?.playerName
    ) {
      try {
        await signalRMethods.reconnectPlayer(
          connection,
          roomId,
          playerState.state.playerId,
          playerState.state.playerName
        );
      } catch (error) {
        console.error("Error reconnecting player:", error);
        enqueueSnackbar({
          variant: "error",
          message: "Không thể kết nối lại người chơi.",
        });
      }
    }
  }, [
    connection,
    roomId,
    playerState?.state?.playerId,
    playerState?.state?.playerName,
  ]);

  const handleStartGame = useCallback(async () => {
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
      await signalRMethods.startGame(
        connection,
        roomId,
        playerState.state.playerId
      );
      roomRefetch();
    } catch (error) {
      const customError = error as CommonAPIErrors;
      if (customError?.errors?.errorCode === RoomErrors.RoomRequiredHost) {
        enqueueSnackbar({
          variant: "error",
          message: "Bạn không phải là chủ phòng",
        });
      } else if (
        customError?.errors?.errorCode === RoomErrors.RoomStartStatusException
      ) {
        enqueueSnackbar({
          variant: "error",
          message: "Trò chơi đã bắt đầu",
        });
      } else {
        enqueueSnackbar({
          variant: "error",
          message: "Không thể bắt đầu trò chơi",
        });
      }
    }
  }, [connection, roomId, playerState?.state?.playerId]);

  const handleContinueGame = useCallback(async () => {
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
      await signalRMethods.resetGame(
        connection,
        roomId,
        playerState.state.playerId
      );
      roomRefetch();
    } catch (error) {
      const customError = error as CommonAPIErrors;
      if (customError?.errors?.errorCode === RoomErrors.RoomRequiredHost) {
        enqueueSnackbar({
          variant: "error",
          message: "Bạn không phải là chủ phòng",
        });
      } else {
        enqueueSnackbar({
          variant: "error",
          message: "Không thể bắt đầu lại trò chơi",
        });
      }
    }
  }, [connection, roomId, playerState.state.playerId, roomRefetch]);

  const handleEndGame = useCallback(async () => {
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
      await signalRMethods.endGame(
        connection,
        roomId,
        playerState.state.playerId
      );
    } catch (error) {
      const customError = error as CommonAPIErrors;
      if (customError?.errors?.errorCode === RoomErrors.RoomRequiredHost) {
        enqueueSnackbar({
          variant: "error",
          message: "Bạn không phải là chủ phòng",
        });
      } else {
        enqueueSnackbar({
          variant: "error",
          message: "Không thể kết thúc trò chơi",
        });
      }
    }
  }, [connection, roomId, playerState?.state?.playerId]);

  useEffect(() => {
    connection?.on(Event.GameReset, () => {
      setGameEndDialogOpen(false);
      setGameStarted(false);
      setCurrentPlayerId(null);
      showSnackbar("Bắt đầu lại trò chơi!");
      roomRefetch();
    });
    return () => {
      connection?.off(Event.GameReset);
    };
  }, [connection, roomRefetch]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    reconnectPlayerSignalR();
  }, [reconnectPlayerSignalR]);

  useEffect(() => {
    connection?.on(Event.PlayerJoined, (playerName: string) => {
      enqueueSnackbar({
        message: `Người chơi ${playerName} đã vào phòng`,
        variant: "info",
      });
      roomRefetch();
    });

    connection?.on(Event.PlayerListUpdated, () => {
      roomRefetch();
    });

    connection?.on(Event.StartGameSuccess, () => {
      setGameStarted(true);
      showSnackbar("Trò chơi bắt đầu!");
      roomRefetch();
    });

    connection?.on(Event.GameStarted, (result) => {
      enqueueSnackbar({
        message: `Trò chơi bắt đầu!`,
        variant: "info",
      });
      roomRefetch();
      setGameStarted(true);
      setCurrentPlayerId(result.currentPlayerId);
    });

    connection?.on(Event.NextPlayerTurn, (result) => {
      setCurrentPlayerId(result.nextPlayerId);
      enqueueSnackbar({
        variant: "info",
        message: `Lượt của ${result.nextPlayerName}`,
      });
    });

    return () => {
      connection?.off(Event.PlayerJoined);
      connection?.off(Event.PlayerListUpdated);
      connection?.off(Event.StartGameSuccess);
      connection?.off(Event.GameStarted);
      connection?.off(Event.NextPlayerTurn);
    };
  }, [connection, roomRefetch]);

  useEffect(() => {
    connection?.on(Event.EndGameSuccess, () => {
      handleCloseEndGameDialog();
      setGameEndDialogOpen(true);
    });
    return () => {
      connection?.off(Event.EndGameSuccess);
    };
  }, [connection, handleCloseEndGameDialog]);

  const handleFailed = useCallback((error: CommonAPIErrors) => {
    const customError = error as CommonAPIErrors;
    console.log("customError: ", JSON.stringify(customError));
    if (customError?.errors?.errorCode === RoomErrors.RoomRequiredHost) {
      enqueueSnackbar({
        variant: "error",
        message: "Bạn không phải là chủ phòng",
      });
    } else if (
      customError?.errors?.errorCode === PlayerErrors.PlayerIdNotFound
    ) {
      enqueueSnackbar({
        variant: "error",
        message: "Người chơi không tồn tại",
      });
    } else if (
      customError?.errors?.errorCode === PlayerErrors.PlayerNameExisted
    ) {
      enqueueSnackbar({
        message: "Tên người chơi đã tồn tại",
        variant: "error",
      });
    } else if (
      customError?.errors?.errorCode === PlayerErrors.PlayerNameLength
    ) {
      enqueueSnackbar({
        message: "Tên người chơi không được quá 50 ký tự",
        variant: "error",
      });
    } else if (customError?.errors?.errorCode === RoomErrors.RoomRequiredHost) {
      enqueueSnackbar({
        variant: "error",
        message: "Bạn không phải là chủ phòng",
      });
    } else if (
      customError?.errors?.errorCode === RoomErrors.RoomStartStatusException
    ) {
      enqueueSnackbar({
        variant: "error",
        message: "Trò chơi đã bắt đầu",
      });
    } else {
      enqueueSnackbar({
        variant: "error",
        message: "Đã có lỗi xảy ra, hãy liên hệ với đội ngũ hỗ trợ",
      });
    }
  }, []);

  useEffect(() => {
    connection?.on(Event.OperationFailed, handleFailed);
    return () => {
      connection?.off(Event.OperationFailed);
    };
  }, [connection, handleFailed]);

  const playerHost = room?.players?.find((player) => player.isHost);
  const checkHost = playerHost?.playerId === playerState?.state?.playerId;
  const playerList = room?.players?.filter((player) => player.isActive);

  return (
    <Container maxWidth="lg">
      {roomLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <CircularProgress color="inherit" className="!text-white" />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography className="text-white">Phòng: {roomId}</Typography>
            <div className="flex items-center gap-2">
              {checkHost && room?.status === RoomStatusEnum.Playing && (
                <Button
                  className="!text-white !border-rose-500 flex-none !bg-rose-600 border hover:!bg-rose-500"
                  variant="contained"
                  color="inherit"
                  startIcon={<IoStopOutline />}
                  onClick={handleOpenEndGameDialog}
                >
                  Kết thúc
                </Button>
              )}

              <Button
                className="!text-white !border-white flex-none"
                variant="outlined"
                color="inherit"
                startIcon={<MdExitToApp />}
                onClick={handleOpenExitRoomDialog}
                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              >
                Rời phòng
              </Button>
            </div>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                width: { xs: "100%", md: "35%" },
                height: "fit-content",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Người chơi ({playerList?.length || 0})
              </Typography>
              <List sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
                {playerList?.map((player, index) => (
                  <Box key={player.playerId}>
                    <ListItem
                      className="flex-wrap gap-2"
                      secondaryAction={
                        player.playerId === playerState?.state?.playerId && (
                          <Tooltip title="Tùy chọn">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={(e) => handlePlayerMenuClick(e, player)}
                            >
                              <MdMoreVert fontSize="large" />
                            </IconButton>
                          </Tooltip>
                        )
                      }
                    >
                      <ListItemAvatar className="flex justify-center items-center gap-2">
                        {player.playerId === playerState?.state?.playerId && (
                          <Chip label="Bạn" size="small" color="primary" />
                        )}
                        <Avatar className="player-avatar">
                          <MdPerson />
                        </Avatar>
                      </ListItemAvatar>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {player.playerName}
                        {player.playerId === currentPlayerId && (
                          <Chip
                            label="Lượt hiện tại"
                            size="small"
                            color="success"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      {player.isHost && (
                        <IconButton edge="end" size="medium" color="warning">
                          <MdStars />
                        </IconButton>
                      )}
                    </ListItem>
                    {index < (playerList?.length || 0) - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </Box>
                ))}
              </List>
            </Paper>

            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                width: { xs: "100%", md: "65%" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              {!gameStarted ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
                    {checkHost
                      ? "Bạn là chủ phòng. Bắt đầu trò chơi khi mọi người đã sẵn sàng!"
                      : "Đang chờ chủ phòng bắt đầu trò chơi..."}
                  </Typography>
                  {checkHost && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<MdPlayArrow />}
                      onClick={handleStartGame}
                      sx={{ py: 1.5, px: 4 }}
                    >
                      Bắt đầu
                    </Button>
                  )}
                </Box>
              ) : (
                <GameScreen
                  mode={room?.mode}
                  players={room?.players || []}
                  roomId={roomId}
                  setGameEndDialogOpen={setGameEndDialogOpen}
                  currentPlayerIdTurn={currentPlayerId}
                  isCheckYourTurn={isCheckYourTurn}
                  setCurrentPlayerIdTurn={setCurrentPlayerId}
                />
              )}
            </Paper>
          </Box>
        </>
      )}

      <LeaveRoomDialog
        open={exitDialogOpen}
        onClose={handleCloseExitRoomDialog}
        requestData={selectedPlayer}
      />

      <Dialog
        open={gameEndDialogOpen}
        onClose={() => setGameEndDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
        disableScrollLock
      >
        <DialogTitle>Trò chơi kết thúc</DialogTitle>
        <DialogContent>
          <Typography>
            Đã hết câu hỏi! Bạn có muốn chơi lại từ đầu không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleOpenExitRoomDialog} color="inherit">
            Kết thúc
          </Button>
          {checkHost && (
            <Button
              onClick={handleContinueGame}
              variant="contained"
              color="primary"
            >
              Chơi lại
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={endGameDialogOpen}
        onClose={handleCloseEndGameDialog}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
        disableScrollLock
      >
        <DialogTitle>Xác nhận kết thúc game</DialogTitle>
        <DialogContent>
          <Typography>Bạn có muốn kết thúc game không?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseEndGameDialog} color="inherit">
            Hủy
          </Button>
          {checkHost && (
            <Button onClick={handleEndGame} variant="contained" color="primary">
              Kết thúc
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Menu
        anchorEl={playerMenuAnchorEl}
        open={Boolean(playerMenuAnchorEl)}
        onClose={handleClosePlayerMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleOpenChangeNameDialog}>
          <MdEdit fontSize="small" className="mr-1" />
          Đổi tên
        </MenuItem>
      </Menu>
      <ChangePlayerNameDialog
        open={changeNameDialogOpen}
        onClose={handleCloseChangeNameDialog}
        requestData={selectedPlayer}
      />
    </Container>
  );
};

export default memo(RoomPage);
