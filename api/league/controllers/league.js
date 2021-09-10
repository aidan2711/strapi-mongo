const { omitFieldData } = require("../../utils/dataUtils");
const { appAxios } = require("../../appAxios");

module.exports = {
  async findOne(ctx) {
    let league = await strapi.services.league.findOne(ctx.query);
    return ctx.send({
      league: omitFieldData(league),
    });
  },

  async sync(ctx) {
    const response = await appAxios.get("/leagues");
    const data = response.data.response;
    await Promise.all(
      data.map(async ({ league, seasons, country }) => {
        let existLeague = await strapi.services.league.findOne({
          league_id: league.id,
        });
        if (!existLeague) {
          await strapi.services.league.create({
            league_id: league.id,
            name: league.name,
            type: league.type,
            logo: league.logo,
            flag: country.flag,
            country: country.name,
            season: seasons[0].year,
          });
          leagues.push(existLeague);
        }
      })
    );

    ctx.send({
      message: "sync leagues success",
    });
  },
};
