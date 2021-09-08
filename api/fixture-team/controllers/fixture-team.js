const { omitFieldData } = require("../../utils/dataUtils");

module.exports = {
  async findOne(ctx) {
    let fixtureTeam = await strapi.services["fixture-team"].findOne(ctx.query);
    return omitFieldData(fixtureTeam);
  },
};
