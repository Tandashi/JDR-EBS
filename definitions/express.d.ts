interface TwitchUser {
  opaque_user_id: string;
  role: 'broadcaster' | 'moderator' | 'viewer';
  channel_id: string;
  user_id: string;
}

declare namespace Express {
  export interface Request {
    user: TwitchUser;
  }
}
