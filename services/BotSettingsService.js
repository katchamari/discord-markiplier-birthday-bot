const BotSettings = require("../models/BotSettings");
const BaseService = require("./BaseService");
const mongoose = require("mongoose");

class BotSettingsService extends BaseService {
  constructor(req) {
    super(req, BotSettings);
  }
}
module.exports = BotSettingsService;
