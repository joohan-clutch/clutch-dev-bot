export class SlackCommand {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  is_enterprise_install: string;
  enterprise_id: string;
  enterprise_name: string;
  response_url: string;
  trigger_id: string;

  constructor(data: any) {
    this.token = data.token;
    this.team_id = data.team_id;
    this.team_domain = data.team_domain;
    this.channel_id = data.channel_id;
    this.channel_name = data.channel_name;
    this.user_id = data.user_id;
    this.user_name = data.user_name;
    this.command = data.command;
    this.text = data.text;
    this.api_app_id = data.api_app_id;

    this.is_enterprise_install = data.is_enterprise_install; // Convert string to boolean
    this.enterprise_id = data.enterprise_id;
    this.enterprise_name = data.enterprise_name;
    this.response_url = data.response_url;
    this.trigger_id = data.trigger_id;
  }
}
