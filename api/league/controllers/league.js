const { omitFieldData } = require("../../utils/dataUtils");

module.exports = {
  async findOne(ctx) {
    let league = await strapi.services.league.findOne(ctx.query);
    return omitFieldData(league);
  },
};
