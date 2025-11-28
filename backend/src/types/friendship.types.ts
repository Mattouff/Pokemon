export interface Friendship {
  id: number;
  user_id: number;
  friend_id: number;
  status: FriendshipStatus;
  created_at: Date;
  updated_at: Date;
}

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

export interface FriendWithDetails {
  id: number;
  friendship_id: number;
  username: string;
  email: string;
  status: FriendshipStatus;
  created_at: Date;
}

export interface SendFriendRequestDTO {
  friend_username: string;
}

export interface UpdateFriendshipDTO {
  status: FriendshipStatus;
}
