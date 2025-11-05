const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BotSettingsSchema = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String },
  birthdays: [{ type: Schema.Types.ObjectId, ref: "Birthday" }],
  timezone: { type: String, required: true },
  roleId: { type: String, required: true },
}).set("timestamps", true);

// Compile model from schema
module.exports = mongoose.model("BotSettings", BotSettingsSchema);
