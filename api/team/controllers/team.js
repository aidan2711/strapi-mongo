const { omitFieldData } = require("../../utils/dataUtils");

module.exports = {
  async findOne(ctx) {
    let team = await strapi.services.team.findOne(ctx.query);
    return ctx.send({
      team: omitFieldData(team),
    });
  },
};
