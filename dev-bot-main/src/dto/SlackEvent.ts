export interface SlackEventAuthorization {
  enterprise_id: string | null;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
}

export interface SlackMessageEvent {
  subtype: string;
  text: string;
  username: string;
  type: string;
  ts: string;
  bot_id: string;
  app_id: string;
  trigger_id: string;
  blocks: any[];
  channel: string;
  event_ts: string;
  channel_type: string;
}

export interface SlackEventPayload {
  token: string;
  team_id: string;
  enterprise_id?: string;
  context_team_id: string;
  context_enterprise_id?: string | null;
  api_app_id: string;
  event: SlackMessageEvent;
  type: string;
  event_id: string;
  event_time: number;
  authorizations: SlackEventAuthorization[];
  is_ext_shared_channel: boolean;
  event_context: string;
}
