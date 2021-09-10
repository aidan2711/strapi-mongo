const { appAxios } = require("../../appAxios");

module.exports = {
  async find(ctx) {
    let lineUp = await strapi.query("line-up").findOne(ctx.query);
    const params = {
      fixture: ctx.query.fixture_id,
      team: ctx.query.team_id,
    };
    if (!lineUp) {
      const response = await appAxios.get("/fixtures/lineups", {
        params,
      });
      const data = response.data.response;
      if (data.length !== 0) {
        const { team, coach, formation, startXI, substitutes } = data[0];

        let startFormation;
        if (startXI.length !== 0) {
          startFormation = await Promise.all(
            startXI.map(async (data) => {
              const playerData = data.player;
              const player = await strapi.services.player.create({
                player_id: playerData.id,
                name: playerData.name,
                number: playerData.number,
                pos: playerData.pos,
                grid: playerData.grid,
              });
              return player;
            })
          );
        }

        let sub;
        if (substitutes.length !== 0) {
          sub = await Promise.all(
            substitutes.map(async (data) => {
              const playerData = data.player;
              const player = await strapi.services.player.create({
                player_id: playerData.id,
                name: playerData.name,
                number: playerData.number,
                pos: playerData.pos,
                grid: playerData.grid,
              });
              return player;
            })
          );
        }

        let coachExist = await strapi.services.coach.findOne({
          coach_id: coach.id,
        });

        if(!coachExist) {
          coachExist = await strapi.services.coach.create({
            coach_id: coach.id,
            name: coach.name,
            photo: coach.photo,
            country: coach.country,
          });
        }

       
        let teamInfo = await strapi.services["team-info"].findOne({
          team_id: team.id,
        });
        
        if(!teamInfo) {
          teamInfo = await strapi.services["team-info"].create({
            team_id: team.id,
            name: team.name,
            logo: team.logo,
            colors: team.colors,
          });
        }

        lineUp = await strapi.query("line-up").create({
          formation,
          team: teamInfo,
          coach: coachExist,
          startXI: startFormation,
          substitutes: sub,
        });
      }
    }
    if (lineUp) return ctx.send({ data: lineUp });
    else return ctx.send({ message: "line up is not set yet" });
  },
};
