const axios = require('axios');

const rickMortyClient = axios.create({
  baseURL: 'https://rickandmortyapi.com/api',
  timeout: 5000
});

rickMortyClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    throw new Error(error.response?.data?.error || 'Error llamando Rick & Morty API');
  }
);

module.exports = rickMortyClient;