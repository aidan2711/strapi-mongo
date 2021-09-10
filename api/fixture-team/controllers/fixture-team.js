const { omitFieldData } = require("../../utils/dataUtils");

module.exports = {
  async findTeams(ctx) {
    console.log("TEST: " + ctx.query);
    let home = await strapi.services["fixture-team"].findTeams({
      home_id: ctx.query.home_id,
      away_id: ctx.query.away_id,
    });
    return ctx.send({
      home: omitFieldData(home),
      away: omitFieldData(away),
    });
  },
};
