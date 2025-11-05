const {
  SlashCommandBuilder,
  ChannelType,
  blockQuote,
  channelMention,
} = require("discord.js");
const BotSettingsService = require("../services/BotSettingsService");
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
    const focusedValue = interaction.options.getFocused();
    const filtered = timeZones
      .filter((tz) => tz.toLowerCase().includes(focusedValue.toLowerCase()))
      .slice(0, 25);
    await interaction.respond(filtered.map((tz) => ({ name: tz, value: tz })));
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
    });

    const existingSettings = await botSettingsService.getResource();
    if (!existingSettings) await botSettingsService.createResource();
    else botSettingsService.updateResource();
    interaction.reply(
      blockQuote(
        `Hello everybody my name is Markiplier! I'll send automatic birthday messages to ${channelMention(
          channelId
        )} at around midnight ${timezone} time.`
      )
    );
  },
};
