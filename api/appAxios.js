const axios = require("axios");

let BASE_URL = process.env.API_URL;

const appAxios = axios.create({
  baseURL: BASE_URL,
});

appAxios.interceptors.request.use(
  async (config) => {
    config.headers = {
      "x-rapidapi-host": process.env.API_HOST,
      "x-rapidapi-key": process.env.API_KEY,
    };
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

module.exports = {
  appAxios
};
