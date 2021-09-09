'use strict';

const chalk = require(`chalk`);
const express = require(`express`);
const {HttpCode, API_PREFIX} = require(`../../constants`);
const routes = require(`../api`);

const DEFAULT_PORT = 3000;

const app = express();
app.use(express.json());

module.exports = {
  name: `--server`,
  async run(args) {
    const [customPort] = args;
    const port = Number.parseInt(customPort, 10) || DEFAULT_PORT;

    app.use((req, res, next) => {
      console.info(chalk.green(`Request on route ${req.url}`));
      res.on(`finish`, () => {
        console.info(`Response status code ${res.statusCode}`);
      });
      next();
    });

    app.use(API_PREFIX, await routes());

    app.use((req, res) => {
      res.status(HttpCode.NOT_FOUND)
        .send(`Not found`);
      console.error(`Route not found: ${req.url}`);
    });

    app.use((err, _req, _res, _next) => {
      console.error(`An error occured on processing request: ${err.message}`);
    });

    try {
      app.listen(port, (err) => {
        if (err) {
          return console.error(`Ошибка при создании сервера`, err);
        }

        return console.info(chalk.green(`Ожидаю соединений на ${port}`));
      });
    } catch (err) {
      return console.error(`An error occured: ${err.message}`);
      process.exit(1);
    }
  }
};
