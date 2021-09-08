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

      const leagues = removeDuplicate(data.map(({ league }) => league));
      await Promise.all(
        leagues.map(async (item) => {
          const league = await strapi.services.league.findOne({
            league_id: item.id,
          });

          if (!league) {
            await strapi.services.league.create({
              league_id: item.id,
              name: item.name,
              country: item.country,
              logo: item.logo,
              flag: item.flag,
              season: item.season,
              round: item.round,
            });
          } else {
            await strapi.services.league.update(
              { league_id: item.id },
              {
                name: item.name,
                country: item.country,
                logo: item.logo,
                flag: item.flag,
                season: item.season,
                round: item.round,
              }
            );
          }
        })
      );

      await Promise.all(
        data.map(async ({ fixture, teams, league }) => {
          const fixtureExist = await strapi.services.fixture.findOne({
            fixture_id: fixture.id,
          });

          const teamsExist = await strapi.services.team.findOne({
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

          if (!teamsExist) {
            let home = await strapi.query("fixture-team").findOne({
              team_id: teams.home.id,
            });
            if (!home) {
              home = await strapi.query("fixture-team").create({
                team_id: teams.home.id,
                name: teams.home.name,
                logo: teams.home.logo,
                winner: teams.home.winner,
              });
            }

            let away = await strapi.query("fixture-team").findOne({
              team_id: teams.away.id,
            });
            if (!away) {
              away = await strapi.query("fixture-team").create({
                team_id: teams.away.id,
                name: teams.away.name,
                logo: teams.away.logo,
                winner: teams.away.winner,
              });
            }

            await strapi.services.team.create({
              fixture_id: fixture.id,
              home: sanitizeEntity(home, {
                model: strapi.models["fixture-team"],
              }),
              away: sanitizeEntity(away, {
                model: strapi.models["fixture-team"],
              }),
            });
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
};
