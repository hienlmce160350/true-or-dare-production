export type Player = {
    id: string;
    playerId: string;
    playerName: string;
    ageGroup: string;
    totalPoints: number;
    createdAt: Date;
    lastActive: Date;
    isHost: boolean;
    isDeleted: boolean
}
