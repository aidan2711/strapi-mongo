const { sanitizeEntity } = require("strapi-utils");
const { omitFieldData, removeDuplicate } = require("../../utils/dataUtils");
const moment = require("moment");
const { appAxios } = require("../../appAxios");
module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.fixture.search(ctx.query);
    } else {
      entities = await strapi.services.fixture.find(ctx.query);
    }
    const data = await Promise.all(
      entities.map(async (entity) => {
        const fixture = sanitizeEntity(entity, {
          model: strapi.models.fixture,
        });
        fixture.venue = omitFieldData(fixture.venue);
        fixture.league = omitFieldData(fixture.league);
        const teams = await strapi.services.team.findOne({
          fixture_id: fixture.fixture_id,
        });
        fixture.teams = omitFieldData(teams);
        return omitFieldData(fixture);
      })
    );
    return data;
  },

  async sync(ctx) {
    try {
      const params = {
        date: moment(new Date()).format("YYYY-MM-DD"),
      };
      const response = await appAxios.get("/fixtures", {
        params,
      });

      const data = response.data.response;

      await Promise.all(
        data.map(async ({ fixture, teams, league }) => {
          const fixtureExist = await strapi.services.fixture.findOne({
            fixture_id: fixture.id,
          });

          const leagueExist = await strapi.services.league.findOne({
            league_id: league.id,
          });

          let venue;
          if (fixture.venue.id != null) {
            venue = await strapi.services.venue.findOne({
              venue_id: fixture.venue.id,
            });
            if (!venue) {
              venue = await strapi.services.venue.create({
                venue_id: fixture.venue.id,
                name: fixture.venue.name,
                city: fixture.venue.city,
              });
            }
          }

          let teamsExist = await strapi.services.team.findOne({
            fixture_id: fixture.id,
          });
          if (!teamsExist) {
            let home = await strapi.services["fixture-team"].findOne({
              team_id: teams.home.id,
            });
            if (!home) {
              home = await strapi.services["fixture-team"].create({
                team_id: teams.home.id,
                name: teams.home.name,
                logo: teams.home.logo,
                winner: teams.home.winner,
              });
            }

            let away = await strapi.services["fixture-team"].findOne({
              team_id: teams.away.id,
            });
            if (!away) {
              away = await strapi.services["fixture-team"].create({
                team_id: teams.away.id,
                name: teams.away.name,
                logo: teams.away.logo,
                winner: teams.away.winner,
              });
            }

            teamsExist = await strapi.services.team.create({
              fixture_id: fixture.id,
              home: sanitizeEntity(home, {
                model: strapi.models["fixture-team"],
              }),
              away: sanitizeEntity(away, {
                model: strapi.models["fixture-team"],
              }),
            });
          }

          if (!fixtureExist) {
            await strapi.services.fixture.create({
              fixture_id: fixture.id,
              referee: fixture.referee,
              timezone: fixture.timezone,
              date: fixture.date,
              timestamp: fixture.timestamp,
              venue: sanitizeEntity(venue, {
                model: strapi.models.venue,
              }),
              league: sanitizeEntity(leagueExist, {
                model: strapi.models.league,
              }),
            });
          } else {
            await strapi.services.fixture.update(
              { fixture_id: fixture.id },
              {
                referee: fixture.referee,
                timezone: fixture.timezone,
                date: fixture.date,
                timestamp: fixture.timestamp,
              }
            );
          }
        })
      );

      return ctx.send({
        message: "sync data successfully",
      });
    } catch (error) {
      console.log(error);
    }
  },

  // async sync(ctx) {
  //   const response = await appAxios.get("/fixtures", {
  //     params: {
  //       league: "870",
  //       season: "2021",
  //     },
  //   });
  //   const data = response.data.response;

  //   await Promise.all(
  //     data.map(async (item) => {
  //       const { league } = await strapi.services.league.findOne({
  //         league_id: item.league.id,
  //       });

  //       const teamResponse = await strapi.services.team.findOne({
  //         fixture_id: item.fixture.id,
  //       });

  //       let team;
  //       if (!teamResponse) {
  //         const teams = await strapi.services["fixture-team"].findTeams({
  //           home_id: item.teams.home.id,
  //           away_id: item.teams.away.id,
  //         });
  //         console.log(teams);
  //         let home = teams.home;
  //         let away = teams.away;

  //         if (!home) {
  //           home = await strapi.services["fixture-team"].create({
  //             team_id: item.teams.home.id,
  //             name: item.teams.home.name,
  //             logo: item.teams.home.logo,
  //             winner: item.teams.home.winner,
  //           });
  //         }

  //         if (!away) {
  //           away = await strapi.services["fixture-team"].create({
  //             team_id: item.teams.away.id,
  //             name: item.teams.away.name,
  //             logo: item.teams.away.logo,
  //             winner: item.teams.away.winner,
  //           });
  //         }

  //         team = await strapi.services.team.create({
  //           fixture_id: item.fixture.id,
  //           home: sanitizeEntity(home, {
  //             model: strapi.models["fixture-team"],
  //           }),
  //           away: sanitizeEntity(away, {
  //             model: strapi.models["fixture-team"],
  //           }),
  //         });
  //       }

  //       let venue;
  //       if (item.fixture.venue.id !== null) {
  //         const venueResponse = await strapi.services.venue.findOne({
  //           venue_id: item.fixture.venue.id,
  //         });
  //         if (!venueResponse) {
  //           venue = await strapi.services.venue.create({
  //             venue_id: item.fixture.venue.id,
  //             name: item.fixture.venue.name,
  //             city: item.fixture.venue.city,
  //           });
  //         }
  //       }
  //       const fixtureExist = await strapi.services.fixture.findOne({
  //         fixture_id: item.fixture.id,
  //       });
  //       if (!fixtureExist) {
  //         await strapi.services.fixture.create({
  //           fixture_id: item.fixture.id,
  //           referee: item.fixture.referee,
  //           timezone: item.fixture.timezone,
  //           date: item.fixture.date,
  //           timestamp: item.fixture.timestamp,
  //           venue: sanitizeEntity(venue, {
  //             model: strapi.models.venue,
  //           }),
  //           league: sanitizeEntity(league, {
  //             model: strapi.models.league,
  //           }),
  //         });
  //       } else {
  //         await strapi.services.fixture.update(
  //           { fixture_id: item.fixture.id },
  //           {
  //             referee: item.fixture.referee,
  //             timezone: item.fixture.timezone,
  //             date: item.fixture.date,
  //             timestamp: item.fixture.timestamp,
  //           }
  //         );
  //       }
  //     })
  //   );

  //   ctx.send({
  //     message: "sync fixture success",
  //   });
  // },
};
