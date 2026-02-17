const cron = require("node-cron");
const BotSettingsService = require("./services/BotSettingsService");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const BirthdayService = require("./services/BirthdayService");
const { userMention } = require("@discordjs/formatters");
const Birthday = require("./models/Birthday");
const { blockQuote } = require("@discordjs/formatters");
const { activities, Activity } = require("./Activities");

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
    const botSettingsService = new BotSettingsService({
      queryObj: {},
      useLean: true,
      select: "timezone roleId guildId channelId",
    });
    const configs = await botSettingsService.getResources();
    for (let config of configs) {
      const { month, day, year, startOfYear, guildId } = getCurrentDate(
        config.timezone,
      );

      const expiredBirthdayService = new BirthdayService({
        queryObj: {
          markedBday: true,
          guildId,
          $or: [{ "date.month": { $ne: month } }, { "date.day": { $ne: day } }],
        },
        body: {
          markedBday: false,
        },
        select: "userId guildId",
      });
      const expiredBirthdays = await expiredBirthdayService.getResources();
      for (let birthday of expiredBirthdays) {
        if (config.roleId) {
          const guild = await client.guilds.fetch(config.guildId);
          const member = await guild.members.fetch(birthday.userId);
          if (guild && member) await member.roles.remove(config.roleId);
        }
        expiredBirthdayService.fetchedResource = birthday;
        expiredBirthdayService.updateResource();
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
          markedBday: false,
        },
        body: {
          lastNotified: new Date(),
          markedBday: true,
        },
        select: "userId date.year guildId",
      });
      const foundBirthdays = await birthdayService.getResources();
      if (foundBirthdays && foundBirthdays.length) {
        const channel = await client.channels.fetch(config.channelId);
        if (!channel.permissionsFor(client.user).has("SendMessages")) {
          console.error("Bot cannot send messages in this channel!");
        }

        for (let birthday of foundBirthdays) {
          if (config.roleId) {
            const guild = await client.guilds.fetch(config.guildId);
            const member = await guild.members.fetch(birthday.userId);
            if (guild && member) {
              try {
                await member.roles.add(config.roleId);
              } catch (err) {
                console.error(
                  "Permission error due to birthday role being above bot role",
                  err,
                );
              }
            }
          }
          await channel.send(
            blockQuote(
              `Today is ${userMention(
                birthday.userId,
              )}'s birthday! They are ${calculateAge(
                birthday.date.year,
                year,
              )} years old today. Happy birthday from me (Markiplier) and everyone else (Not Markiplier)!`,
            ),
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

const setActivity = (client) => {
  try {
    const numberOfActivities = activities.length;
    const randomActivity =
      activities[Math.floor(Math.random() * numberOfActivities)];
    client.user.setPresence(new Activity(randomActivity));
  } catch (err) {
    console.error(err);
  }
};

const startCronJob = (client) => {
  cron.schedule("* * * * *", () => {
    checkForBirthdays(client);
  });
  cron.schedule("*/25 * * * *", () => {
    setActivity(client);
  });
};

module.exports = { startCronJob };
