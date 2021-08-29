"use strict";

/**
 * get-post.js controller
 *
 * @description: A set of functions called "actions" of the `get-post` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: "ok",
    });
  },

  create: async (ctx) => {
    // Add your own logic here.
    const post = ctx.request.body;
    console.log(post);
    const result = await strapi.services.post.create(post);
    // Send 200 `ok`
    ctx.send({
      message: "save post success",
      data: result,
    });
  },
};
