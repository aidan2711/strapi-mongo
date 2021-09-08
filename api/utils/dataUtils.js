const { omit } = require("lodash");

module.exports = {
  omitFieldData(data) {
    return omit(data, "id", "createdAt", "updatedAt", "published_at", "__v");
  },

  removeDuplicate(data) {
    return data.reduce((unique, o) => {
      if (!unique.some((obj) => obj.id === o.id && obj.id !== null)) {
        unique.push(o);
      }
      return unique;
    }, [])
  },
};
