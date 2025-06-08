// Định nghĩa kiểu CustomError bằng type
export type CommonAPIErrors = Error & {
  errors?: {
    errorCode?: number;
    message?: string;
    [key: string]: unknown; // Cho phép thêm các thuộc tính tùy chọn khác
  };
};

/**
 * Room errors
 * Code format: 10xx
 */
export enum RoomErrors {
  /**
   * Password is wrong
   */
  RoomPasswordIsWrong = 1000,
  /**
   * Room already exists
   */
  RoomAlreadyExists = 1001,
  /**
   * RoomId is required
   */
  RoomIdIsRequired = 1002,
  /**
   * RoomId not found
   */
  RoomIdNotFound = 1003,
  /**
   * Password is required for rooms with a password
   */
  RoomPasswordRequired = 1004,
  /**
   * Host is required
   */
  RoomRequiredHost = 1006,
  /**
   * Invalid room mode: party, friends, couples
   */
  RoomModeException = 1007,
  /**
   * Game must be in a playing state
   */
  GameMustbePlaying = 1008,
  /**
   * PlayerId is not in the room
   */
  RoomNotFoundPlayerIdException = 1009,
  /**
   * Invalid question type: dare or truth
   */
  QuestionTypeWrong = 1010,
  /**
   * Game must be in a playing state
   */
  RoomEndStatusException = 1011,
  /**
   * Game must be in an ended state
   */
  RoomResetStatusException = 1012,
  /**
   * Invalid age group: kids, teen, adult, all
   */
  RoomAgeGroupException = 1013,
  /**
   * Room name is required
   */
  RoomNameRequiredException = 1014,
  /**
   * Game can only start in a waiting state
   */
  RoomStartStatusException = 1015,
  /**
   * It is not your turn
   */
  RoomNotYourTurn = 1016,
  /**
   * Either not your turn or question already fetched
   */
  RoomNextPlayerException = 1017,
  /**
   * Timestamp error for auto-next player (to prevent AFK)
   */
  RoomNoTimestampException = 1018,
  /**
   * Need to wait 1 second to next player
   */
  RoomNeedMoreTimeException = 1019,

  /**
   * Room is full
   */
  RoomFull = 1022,

  /**
   * Room have been started
   */
  RoomHaveBeenStarted = 1023,
}

/**
 * Player errors
 * Code format: 20xx
 */
export enum PlayerErrors {
  /**
   * Player name length is too long
   */
  PlayerNameLength = 2001,

  /**
   * Room is full
   */
  FullPlayer = 2002,

  /**
   * Player ID not found
   */
  PlayerIdNotFound = 2003,

  /**
   * Player name already exists
   */
  PlayerNameExisted = 2004,

  /**
   * Player name is required
   */
  PlayerNameRequiredException = 2005,
}
