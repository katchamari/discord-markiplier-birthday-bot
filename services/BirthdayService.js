const Birthday = require("../models/Birthday");
const BaseService = require("./BaseService");

class BirthdayService extends BaseService {
  constructor(req) {
    super(req, Birthday);
  }
}
module.exports = BirthdayService;
