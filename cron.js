const cron = require("node-cron");
const BotSettingsService = require("./services/BotSettingsService");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const BirthdayService = require("./services/BirthdayService");
const { userMention } = require("@discordjs/formatters");
const Birthday = require("./models/Birthday");
const { blockQuote } = require("@discordjs/formatters");

dayjs.extend(utc);
dayjs.extend(timezone);

const getCurrentDate = (timezone) => {
  const now = dayjs().tz(timezone);
  const month = now.month() + 1;
  const day = now.date();
  const year = now.year();
  const startOfYear = now.startOf("year");

  return { year, month, day, now, startOfYear };
};

const calculateAge = (birthYear, currentYear) => {
  return Math.floor(currentYear - birthYear);
};
const checkForBirthdays = async (client) => {
  try {
    const botSettingsService = new BotSettingsService({ queryObj: {} });
    const configs = await botSettingsService.getResources();
    for (let config of configs) {
      const { month, day, year, startOfYear } = getCurrentDate(config.timezone);

      const birthdayService2 = new BirthdayService({
        queryObj: {
          lastNotified: { $gte: startOfYear.toDate() },
          $or: [{ "date.month": { $ne: month } }, { "date.day": { $ne: day } }],
          markedBday: true,
        },
        body: {
          markedBday: false,
        },
      });
      const expiredBirthdays = await birthdayService2.getResources();
      for (let birthday of expiredBirthdays) {
        if (config.roleId) {
          const guild = await client.guilds.fetch(config.guildId);
          const member = await guild.members.fetch(birthday.userId);
          if (guild && member) await member.roles.remove(config.roleId);
        }
        birthdayService2.fetchedResource = birthday;
        birthdayService2.updateResource();
      }

      const birthdayService = new BirthdayService({
        queryObj: {
          "date.month": month,
          "date.day": day,
          guildId: config.guildId,
          $or: [
            { lastNotified: { $exists: false } },
            { lastNotified: { $lt: startOfYear.toDate() } },
          ],
        },
        body: {
          lastNotified: new Date(),
          markedBday: true,
        },
      });
      const foundBirthdays = await birthdayService.getResources();
      if (foundBirthdays && foundBirthdays.length) {
        const channel = await client.channels.fetch(config.channelId);
        for (let birthday of foundBirthdays) {
          if (config.roleId) {
            const guild = await client.guilds.fetch(config.guildId);
            const member = await guild.members.fetch(birthday.userId);
            if (guild && member) await member.roles.add(config.roleId);
          }
          await channel.send(
            blockQuote(
              `Today is ${userMention(
                birthday.userId
              )}'s birthday! They are ${calculateAge(
                birthday.date.year,
                year
              )} years old today. Happy birthday from me (Markiplier) and everyone else (Not Markiplier)!`
            )
          );
          birthdayService.fetchedResource = birthday;
          await birthdayService.updateResource();
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const startCronJob = (client) => {
  cron.schedule("* * * * *", () => {
    checkForBirthdays(client);
  });
};

module.exports = { startCronJob };
