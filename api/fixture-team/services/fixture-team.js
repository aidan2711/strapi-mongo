"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async findTeams(params, populate) {
    console.log(params);
    const home = await strapi
      .query("fixture-team")
      .findOne({ ...params.home_id }, populate);
    const away = await strapi
      .query("fixture-team")
      .findOne({ ...params.away_id }, populate);
    return {
      home,
      away,
    };
  },
};
