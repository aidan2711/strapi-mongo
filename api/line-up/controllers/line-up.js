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
        const { team, coach, formation, startXI, subtitutes } = data;
        const { teamInfo } = await strapi.services["team-info"].findOne({
          team_id: team.id,
        });
        const coachResponse = await strapi.services.coach.findOne({
          coach_id: coach.id,
        });

        const startFormation = null;
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

        const sub = null;
        if (subtitutes.length !== 0) {
          sub = await Promise.all(
            subtitutes.map(async (data) => {
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

        lineUp = await strapi.query("line-up").create({
          formation,
          team: teamInfo,
          coach: coachResponse.coach,
          startXI: startFormation,
          subtitutes: sub,
        });
      }
    }
    if(lineUp) return ctx.send({ data: lineUp });
    else return ctx.send({ message: "line up is not set yet" });
  },
};
