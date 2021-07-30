declare namespace Express {
  export interface Request {
    user?: {
      opaque_user_id: string;
      role: 'broadcaster' | 'moderator' | 'viewer';
      channel_id: string;
      user_id: string;
    };
  }
}
