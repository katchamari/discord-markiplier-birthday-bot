const ErrorClass = require("../ErrorClass");

class BaseService {
  constructor(config, Model) {
    this.body = config.body;
    this.queryObj = config.queryObj || {};
    this.Model = Model;
    this.populateFields = config.populateFields || [];
    this.fetchedResource = config.fetchedResource;
    this.guildId = config.guildId;
  }

  async getResources() {
    const {
      queryObj = {},
      sort,
      select = "",
      populateFields = [],
      useLean = false,
    } = this || {};
    let queryResult = this.Model.find(queryObj).sort(sort).select(select);
    if (useLean) queryResult = queryResult.lean({ virtuals: true });
    if (populateFields.length)
      queryResult = queryResult.populate(populateFields);
    return await queryResult;
  }

  async getResource() {
    const {
      queryObj = {},
      select = "",
      populateFields = [],
      useLean = false,
    } = this || {};
    let query = this.Model.findOne(queryObj);
    if (populateFields.length) {
      query = query.populate(populateFields);
    }

    if (select) {
      query = query.select(select);
    }

    if (useLean) {
      query = query.lean({ virtuals: true });
    }

    const resource = await query;
    if (!resource) {
      return;
    }
    this.fetchedResource = resource;
    return resource;
  }

  async createResource() {
    const [resource] = await this.Model.create([this.body]);
    return resource;
  }

  async updateResource() {
    const resource = await this.Model.findOneAndUpdate(
      this.queryObj,
      this.body,
      { new: true }
    );
    if (!resource)
      throw new ErrorClass("Resource not found", "This item doesn't exist!");
    return resource;
  }

  async deleteResource() {
    const resource =
      this?.fetchedResource || (await this.Model.findOne(this.queryObj));
    if (!resource)
      throw new ErrorClass("Resource not found", "This item doesn't exist!");
    await resource.deleteOne();
  }

  addToPipeline(newPipeline) {
    this.pipeline.push(...newPipeline);
  }
}

module.exports = BaseService;
