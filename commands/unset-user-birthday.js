const { SlashCommandBuilder, blockQuote, userMention } = require("discord.js");
const BirthdayService = require("../services/BirthdayService");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const BotSettingsService = require("../services/BotSettingsService");
dayjs.extend(customParseFormat);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unset-user-birthday")
    .setDescription("Remove user birthday")
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription("Id of user whose birthday you want to remove")
        .setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.options.getString("userid");
    const guildId = interaction.guildId;
    const birthdayService = new BirthdayService({
      queryObj: {
        guildId,
        userId,
      },
    });
    await birthdayService.deleteResource();
    const botSettingsService = new BotSettingsService({
      queryObj: {
        guildId,
      },
      useLean: true,
      select: "roleId",
    });
    const config = await botSettingsService.getResource();
    if (config.roleId) {
      const guild = await interaction.client.guilds.fetch(guildId);
      const member = await guild.members.fetch(userId);
      await member.roles.remove(config.roleId);
    }
    interaction.reply(
      blockQuote(
        `Removed birthday for ${userMention(userId)}. Markiplier eated it.`
      )
    );
  },
};
