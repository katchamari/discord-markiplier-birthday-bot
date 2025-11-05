const { SlashCommandBuilder, blockQuote, userMention } = require("discord.js");
const BirthdayService = require("../services/BirthdayService");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const ErrorClass = require("../ErrorClass");
const BotSettingsService = require("../services/BotSettingsService");
dayjs.extend(customParseFormat);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-user-birthday")
    .setDescription("Set user birthday")
    .addUserOption((option) =>
      option
        .setName("targetuser")
        .setDescription("Select a user to set birthday for.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("month")
        .setDescription("Enter month of birth")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("day")
        .setDescription("Enter day of birth")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("year")
        .setDescription("Enter year of birth")
        .setRequired(true)
    ),
  async execute(interaction) {
    const month = interaction.options.getInteger("month");
    const day = interaction.options.getInteger("day");
    const year = interaction.options.getInteger("year");
    const parsedDate = dayjs(new Date(year, month - 1, day));
    const userId = interaction.options.getUser("targetuser").id;
    if (
      !parsedDate.isValid() ||
      parsedDate.date() !== day ||
      parsedDate.month() !== month - 1
    ) {
      throw new ErrorClass("Please enter a valid date");
    }
    const botSettingsService = new BotSettingsService({
      queryObj: { guildId: interaction.guildId },
      useLean: true,
    });
    const config = await botSettingsService.getResource();
    const now = dayjs().tz(config.timezone);
    if (parsedDate.isAfter(now, "day")) {
      throw new ErrorClass("Date cannot be in the future");
    }

    const birthdayService = new BirthdayService({
      queryObj: {
        guildId: interaction.guildId,
        userId,
      },
      body: {
        guildId: interaction.guildId,
        userId,
        date: {
          month,
          day,
          year,
        },
      },
    });
    const existingBirthday = await birthdayService.getResource();
    if (!existingBirthday) await birthdayService.createResource();
    else await birthdayService.updateResource();
    interaction.reply(
      blockQuote(
        `My name is Markiplier and I successfully set ${userMention(
          userId
        )}'s birthday to ${month}/${day}/${year}`
      )
    );
  },
};
