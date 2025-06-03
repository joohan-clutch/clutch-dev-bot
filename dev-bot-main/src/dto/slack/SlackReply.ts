export type SlackReply = {
  type?: string;
  ts?: string;
  text: string;
  subtype?: string;
  username?: string;
  user?: string;
  team?: string;
  bot_id?: string;
  app_id?: string;
  trigger_id?: string;
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  reply_users?: string[];
  is_locked?: boolean;
  subscribed?: boolean;
  blocks?: {
    type: string;
    block_id: string;
    elements: {
      type: string;
      elements: { type: string; user_id: string; text: string }[];
    }[];
  }[];
  client_msg_id?: string;
};
