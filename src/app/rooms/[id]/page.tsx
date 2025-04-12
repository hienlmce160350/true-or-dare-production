"use client";

import {
  useGetRoomByIdReactQuery,
  useResetGamePatchMutation,
  useStartGamePatchMutation,
} from "@/api/rooms";
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
import { memo, useCallback, useState } from "react";
import {
  MdEdit,
  MdExitToApp,
  MdMoreVert,
  MdPerson,
  MdPlayArrow,
  MdStars,
} from "react-icons/md";
// import TruthOrDareGame from "../../../components/menu/page";
import { Player } from "@/types/player/player";
import ChangePlayerNameDialog from "@/components/room/dialog/change-player-name-dialog";
import LeaveRoomDialog from "@/components/room/dialog/exit-room-dialog";
import GameScreen from "@/components/game/page";
import HTTP_CODES_ENUM from "@/api/common/types/http-codes";
import { enqueueSnackbar } from "notistack";
import { CommonAPIErrors, RoomErrors } from "@/api/common/types/common-errors";

type RequestChangePlayerName = {
  playerId?: string;
  roomId?: string;
  playerName?: string;
};

const RoomPage = () => {
  const params = useParams();
  const roomId = params?.id;
  // const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  // const [timeLeft, setTimeLeft] = useState(30);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [gameEndDialogOpen, setGameEndDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const playerState = getStorage("player");

  // Xử lý đổi tên người chơi
  const [changeNameDialogOpen, setChangeNameDialogOpen] = useState(false);
  const [playerMenuAnchorEl, setPlayerMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const [selectedPlayer, setSelectedPlayer] = useState<RequestChangePlayerName>(
    {
      playerId: "",
      roomId: "",
      playerName: "",
    }
  );

  const { startRoomAsync } = useStartGamePatchMutation(roomId as string);

  const { resetRoomAsync } = useResetGamePatchMutation(roomId as string);

  const handlePlayerMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    player: Player
  ) => {
    setPlayerMenuAnchorEl(event.currentTarget);
    const requestData: RequestChangePlayerName = {
      roomId: roomId as string,
      playerId: player.playerId,
      playerName: player.playerName,
    };
    setSelectedPlayer(requestData);
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
    const requestData: RequestChangePlayerName = {
      roomId: roomId as string,
      playerId: playerState?.state?.playerId,
      playerName: playerState?.state?.playerName,
    };
    setExitDialogOpen(true);
    setSelectedPlayer(requestData);
  }, [playerState?.state?.playerId, playerState?.state?.playerName, roomId]);

  const handleCloseExitRoomDialog = useCallback(() => {
    setExitDialogOpen(false);
    setSelectedPlayer({});
  }, []);

  const { room, roomLoading } = useGetRoomByIdReactQuery(
    roomId as string,
    !!roomId
  );

  const playerHost = room?.players?.find((player) => player.isHost);

  const checkHost = playerHost?.playerId === playerState?.state?.playerId;

  // Timer effect
  // useEffect(() => {
  //   let timer: NodeJS.Timeout;

  //   if (gameStarted && timeLeft > 0) {
  //     timer = setTimeout(() => {
  //       setTimeLeft(timeLeft - 1);
  //     }, 1000);
  //   } else if (gameStarted && timeLeft === 0) {
  //     // Move to next question or end game
  //     if (questionIndex < questions.length - 1) {
  //       setQuestionIndex(questionIndex + 1);
  //       setCurrentQuestion(questions[questionIndex + 1].text);
  //       setTimeLeft(30);
  //       showSnackbar("Câu hỏi tiếp theo!");
  //     } else {
  //       setGameStarted(false);
  //       setGameEndDialogOpen(true);
  //     }
  //   }

  //   return () => {
  //     if (timer) clearTimeout(timer);
  //   };
  // }, [gameStarted, timeLeft, questionIndex, questions]);

  const startGame = useCallback(async () => {
    try {
      const { data, status } = await startRoomAsync({
        playerId: playerState?.state?.playerId,
      });
      if (data?.message && status === HTTP_CODES_ENUM.OK) {
        setGameStarted(true);
        // setTimeLeft(30);
        showSnackbar("Trò chơi bắt đầu!");
      }
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
      console.error("Error starting game:", error);
    }
  }, [playerState?.state?.playerId, startRoomAsync]);

  const continueGame = useCallback(async () => {
    try {
      const { data, status } = await resetRoomAsync({
        playerId: playerState?.state?.playerId,
      });
      if (data?.message && status === HTTP_CODES_ENUM.OK) {
        setGameEndDialogOpen(false);
        // setTimeLeft(30);
        setGameStarted(false);
        showSnackbar("Bắt đầu lại trò chơi!");
      }
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
      console.error("Error reseting game:", error);
    }
  }, [playerState?.state?.playerId, resetRoomAsync]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

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
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            {/* Players list */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                width: { xs: "100%", md: "35%" },
                height: "fit-content",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Người chơi ({room?.players?.length})
              </Typography>
              <List sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
                {room?.players?.map((player, index) => (
                  <Box key={player.playerId}>
                    <ListItem
                      className="flex-wrap gap-2"
                      secondaryAction={
                        player.playerName === playerState.state.playerName && (
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
                        {player.playerId === playerState.state.playerId && (
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
                      </Box>
                      {player.isHost && (
                        <IconButton edge="end" size="medium" color="warning">
                          <MdStars />
                        </IconButton>
                      )}
                    </ListItem>
                    {index < room?.players?.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </Box>
                ))}
              </List>
            </Paper>

            {/* Game area */}
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
                      onClick={startGame}
                      sx={{ py: 1.5, px: 4 }}
                    >
                      Bắt đầu
                    </Button>
                  )}
                </Box>
              ) : (
                // <Box sx={{ textAlign: "center" }}>
                //   {/* <Box
                //     sx={{
                //       display: "flex",
                //       justifyContent: "center",
                //       alignItems: "center",
                //       mb: 3,
                //     }}
                //   >
                //     <MdAccessTime className="mr-1" />
                //     <Typography variant="h6" component="span">
                //       Thời gian còn lại:
                //     </Typography>
                //     <Typography
                //       variant="h6"
                //       component="span"
                //       sx={{
                //         ml: 1,
                //         color: timeLeft <= 10 ? "error.main" : "inherit",
                //         fontWeight: "bold",
                //       }}
                //     >
                //       {timeLeft}s
                //     </Typography>
                //   </Box> */}

                //   <Box className="question-card">
                //     <Typography className="question-text">
                //       {currentQuestion}
                //     </Typography>
                //     {checkHost && (
                //       <Button
                //         variant="outlined"
                //         startIcon={<MdRefresh />}
                //         onClick={() => {
                //           if (questionIndex < questions.length - 1) {
                //             setQuestionIndex(questionIndex + 1);
                //             setCurrentQuestion(
                //               questions[questionIndex + 1].text
                //             );
                //             // setTimeLeft(30);
                //             showSnackbar("Đã chuyển câu hỏi!");
                //           }
                //         }}
                //       >
                //         Câu hỏi tiếp theo
                //       </Button>
                //     )}
                //   </Box>
                // </Box>
                <GameScreen
                  mode={room?.mode}
                  players={room?.players}
                  roomId={roomId as string}
                  setGameEndDialogOpen={setGameEndDialogOpen}
                />
              )}
            </Paper>
          </Box>
        </>
      )}

      {/* Exit Room Dialog */}
      <LeaveRoomDialog
        open={exitDialogOpen}
        onClose={handleCloseExitRoomDialog}
        requestData={selectedPlayer}
      />

      {/* Game End Dialog */}
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
            <Button onClick={continueGame} variant="contained" color="primary">
              Chơi lại
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
