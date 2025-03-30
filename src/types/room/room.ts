import { Player } from "../player/player";

export type Room = {
    id: string;
    roomId: string;
    roomName: string;
    roomPassword?: string;
    players: Player[];
    currentQuestionId: string;
    currentPlayerTurn: string;
    status: string;
    createdBy: string;
    createdAt: Date;
    inActive: boolean;
    ttlExpiry: Date;
    isDeleted: boolean;
    playerCount: number;
    maxPlayer: number;
    hasPassword: boolean;
    hostName: string;
}

export type FilterRoomRequest = {
    filter?: IRoomFilters | null;
  };

  export type IRoomFilters = {
    roomId: string | null;
  };

  export type IFilterValue = number | number[] | null | string | Date | { id: number }[];