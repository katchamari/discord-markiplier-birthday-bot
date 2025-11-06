const mongoose = require("mongoose");
const ErrorClass = require("../ErrorClass");
const BotSettingsService = require("../services/BotSettingsService");
const Schema = mongoose.Schema;

const BirthdaySchema = new Schema({
  date: {
    month: { type: Number, required: true },
    day: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  lastNotified: { type: Date },
  markedBday: { type: Boolean, default: false },
}).set("timestamps", true);

BirthdaySchema.pre("save", function (next) {
  if (!this.lastNotified) this.lastNotified = undefined;
  this.wasNew = this.isNew;
  return next();
});
BirthdaySchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc, next) {
    const botSettingsService = new BotSettingsService({
      queryObj: {
        guildId: doc.guildId,
        birthdays: { $in: doc._id },
      },
      body: {
        $pull: { birthdays: doc._id },
      },
      select: "_id",
    });
    await botSettingsService.updateResource();
    return next();
  }
);
BirthdaySchema.post("save", async function (doc, next) {
  const botSettingsService = new BotSettingsService({
    queryObj: {
      guildId: doc.guildId,
    },
    body: {
      $push: {
        birthdays: doc._id,
      },
    },
    select: "_id",
  });
  botSettingsService.fetchedResource = await botSettingsService.getResource();
  if (!botSettingsService.fetchedResource) {
    return next(
      new ErrorClass(
        "Guild settings not found",
        "You must configure settings with /configure-settings before you can set birthdays."
      )
    );
  }
  if (this.wasNew) {
    await botSettingsService.updateResource();
  }
  return next();
});
// Compile model from schema
module.exports = mongoose.model("Birthday", BirthdaySchema);
