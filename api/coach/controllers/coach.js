"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findOne(ctx) {
    let coach = await strapi.services.coach.findOne(ctx.query);
    if (!coach) {
      const params = {
        id: ctx.query.coach_id,
      };
      const response = await appAxios.get("/coachs", {
        params,
      });
      const data = response.response;
      if (data.length !== 0) {
        const coachData = data[0];
        coach = await strapi.services.coach.create({
          coach_id: coachData.id,
          country: coachData.birth.country,
          photo: coachData.photo,
          name: coachData.name,
        });
      }
    }

    return ctx.send({
      coach,
    });
  },
};
