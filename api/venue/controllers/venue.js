
module.exports = {
  async findOne(ctx) {
    let venue = await strapi.services.venue.findOne(ctx.query);
    return ctx.send({
        venue: omitFieldData(venue),
    });
  },
};
