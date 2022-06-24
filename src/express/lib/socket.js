'use strict';

const {Server} = require(`socket.io`);

module.exports = (server) => {
  return new Server(server, {
    cors: {
      methods: `GET`
    }
  });
};
