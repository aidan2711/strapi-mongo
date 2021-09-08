const { omitFieldData } = require("../../utils/dataUtils");

module.exports = {
  async findOne(ctx) {
    let teamInfo = await strapi.query("team-info").findOne(ctx.query);
    if (!teamInfo) {
      const params = {
        id: ctx.query.team_id,
      };
      const response = await appAxios.get("/teams", {
        params,
      });
      const data = response.response;
      if (data.length !== 0) {
        const { team } = data[0];
        teamInfo = await strapi.query("team-info").create({
          team_id: team.id,
          country: team.country,
          founded: team.founded,
          logo: team.logo,
          name: team.name,
          national: team.national,
        });
      }
    }
    return omitFieldData(teamInfo);
  },
};
