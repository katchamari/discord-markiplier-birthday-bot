const {
  SlashCommandBuilder,
  ChannelType,
  blockQuote,
  channelMention,
} = require("discord.js");
const BotSettingsService = require("../services/BotSettingsService");
const timezones = require("../helpers/timezones");
const timeZones = Intl.supportedValuesOf("timeZone");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("configure-settings")
    .setDescription("Set the channel for this bot")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("text channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("Select your time zone (e.g., America/New_York)")
        .setAutocomplete(true) // Enable autocomplete
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("birthdayrole")
        .setDescription("The role to give the birthday person.")
        .setRequired(true)
    ),
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const results = timezones
      .filter(
        (tz) =>
          tz.label.toLowerCase().includes(focused) ||
          tz.value.toLowerCase().includes(focused) ||
          tz.aliases.some((a) => a.includes(focused))
      )
      .slice(0, 25);
    return interaction.respond(
      results.map((tz) => ({ name: tz.label, value: tz.value }))
    );
  },
  async execute(interaction) {
    const channelId = interaction.options.getChannel("channel").id;
    const guildId = interaction.guildId;
    const timezone = interaction.options.getString("timezone");
    const roleId = interaction.options.getRole("birthdayrole").id;
    const botSettingsService = new BotSettingsService({
      queryObj: {
        guildId: interaction.guildId,
      },
      body: {
        channelId,
        guildId,
        timezone,
        roleId,
      },
      select: "_id",
    });

    botSettingsService.fetchedResource = await botSettingsService.getResource();
    if (!botSettingsService.fetchedResource)
      await botSettingsService.createResource();
    else botSettingsService.updateResource();
    interaction.reply(
      blockQuote(
        `Hello everybody my name is Markiplier! I'll send automatic birthday messages to ${channelMention(
          channelId
        )} at around midnight ${timezone} time. Make sure my role is higher than the set birthday role, and make sure that I have the correct permissions to send messages to the set channel.`
      )
    );
  },
};
