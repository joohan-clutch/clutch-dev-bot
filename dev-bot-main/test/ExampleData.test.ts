import { SlackEventPayload } from "../src/dto/SlackEvent";

export const event: SlackEventPayload = {
  token: "p9ItglkHULj1TSugEqGYILH9",
  team_id: "T3MDDK1FV",
  context_team_id: "T3MDDK1FV",
  context_enterprise_id: null,
  api_app_id: "A07M0P98ZL3",
  event: {
    subtype: "bot_message",
    text: "New Bug Report\n\nFrom:\n<@U07AHB36G22>\n\nCategory:\nSTC Tasks&amp;Docs, STC, Lifecycle &amp; Recon &amp; Vehicle - Admin\n\nRequest:\nzxczczc\n\nUrgency:\n:large_blue_circle: Not urgent\n\nReproducing the Issue:\nxxxxx\n\nLink to Customer Profile:\nzx\n\nIs there a workaround:\n:x: No\n\nDetails and possible workaround:\n",
    username: "Bug Reporting Flow",
    type: "message",
    ts: "1732814169.078629",
    bot_id: "B0839H9QK4Z",
    app_id: "A08394KPUD7",
    trigger_id: "Ft082TJB2VEZ",
    blocks: [
      {
        type: "rich_text",
        block_id: "qtbfh",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "New Bug Report\n\nFrom:\n" },
              { type: "user", user_id: "U07AHB36G22" },
              { type: "text", text: "\n\nCategory:\n" },
              {
                type: "text",
                text: "STC Tasks&Docs, STC, Lifecycle & Recon & Vehicle - Admin",
              },
              { type: "text", text: "\n\nRequest:\n" },
              { type: "text", text: "zxczczc" },
              { type: "text", text: "\n\nUrgency:\n" },
              {
                type: "emoji",
                name: "large_blue_circle",
                unicode: "1f535",
              },
              { type: "text", text: " Not urgent" },
              { type: "text", text: "\n\nReproducing the Issue:\n" },
            ],
          },
          {
            type: "rich_text_section",
            elements: [{ type: "text", text: "xxxxx" }],
          },
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "\n\nLink to Customer Profile:\n" },
              { type: "text", text: "zx" },
              { type: "text", text: "\n\nIs there a workaround:\n" },
              { type: "emoji", name: "x", unicode: "274c" },
              { type: "text", text: " No" },
              {
                type: "text",
                text: "\n\nDetails and possible workaround:\n",
              },
            ],
          },
        ],
      },
    ],
    channel: "C082GAZSMDM",
    event_ts: "1732814169.078629",
    channel_type: "channel",
  },
  type: "event_callback",
  event_id: "Ev082X1C2ZLJ",
  event_time: 1732814169,
  authorizations: [
    {
      enterprise_id: null,
      team_id: "T3MDDK1FV",
      user_id: "U07LUCS53QE",
      is_bot: true,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context:
    "4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUM01EREsxRlYiLCJhaWQiOiJBMDdNMFA5OFpMMyIsImNpZCI6IkMwODJHQVpTTURNIn0",
};
