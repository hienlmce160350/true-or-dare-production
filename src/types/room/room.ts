import { Player } from "../player/player";
import { QuestionModeEnum } from "../question/question-mode-enum";
import { RoomAgeGroupEnum } from "./room-age-group-enum";
import { RoomStatusEnum } from "./room-status-enum";

export type Room = {
  roomId: string;
  roomName: string;
  players: Player[];
  currentQuestionId: string;
  currentPlayerIdTurn: string;
  status: RoomStatusEnum;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  ttlExpiry: Date;
  isDeleted: boolean;
  playerCount: number;
  maxPlayer: number;
  hasPassword: boolean;
  hostName: string;
  ageGroup: RoomAgeGroupEnum;
  mode: QuestionModeEnum;
};

export type FilterRoomRequest = {
  filter?: IRoomFilters | null;
};

export type IRoomFilters = {
  roomId: string | null;
};

export type IFilterValue =
  | number
  | number[]
  | null
  | string
  | Date
  | { id: number }[];
