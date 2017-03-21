'use strict';

require('dotenv').load({ silent: true });


const Cfenv = require('cfenv');
const Hapi = require('hapi');
const Fs = require('fs');

// Setup Hapi
const appEnv = Cfenv.getAppEnv();
const server = new Hapi.Server()
server.connection({
  port: appEnv.port
});

// Register Hapi Plugins
server.register([
  require('hapi-pino'),
  require('inert'),
  require('vision'),
  {
    register: require('hapi-swagger'),
    options: {
      info: {
        title: 'Contact List React Test',
        version: require('./package').version,
      }
    }
  }
], (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  // Dynamically add routes
  const routePath = __dirname + '/routes/';
  Fs.readdir(routePath, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      server.route(require(routePath + file));
    });
  });

  server.start((err) => {
    if (err) {
      console.error('Error: %s', err)
      process.exit(1)
    } else {
      console.log('Server running at:', server.info.uri);
    }
  })
});
