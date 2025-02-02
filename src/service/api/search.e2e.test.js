'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const initDB = require(`../lib/init-db`);
const passwordUtils = require(`../lib/password`);
const search = require(`./search`);
const DataService = require(`../data-service/search`);

const {HttpCode} = require(`../../constants`);

const mockCategories = [
  `Книги`,
  `Цветы`,
  `Животные`,
  `Разное`
];

const mockUsers = [
  {
    name: `Иван Иванов`,
    email: `ivanov@example.com`,
    passwordHash: passwordUtils.hashSync(`ivanov`),
    avatar: `avatar01.jpg`
  },
  {
    name: `Пётр Петров`,
    email: `petrov@example.com`,
    passwordHash: passwordUtils.hashSync(`petrov`),
    avatar: `avatar02.jpg`
  }
];

const mockOffers = [
  {
    "user": `ivanov@example.com`,
    "categories": [
      `Книги`,
      `Разное`
    ],
    "description": `Кажется, что это хрупкая вещь. Пользовались бережно и только по большим праздникам. Это настоящая находка для коллекционера! Продаю с болью в сердце...`,
    "picture": `item07.jpg`,
    "title": `Продам новую приставку Sony Playstation 5.`,
    "type": `SALE`,
    "sum": 72577,
    "comments": [
      {
        "user": `petrov@example.com`,
        "text": `А где блок питания? А сколько игр в комплекте? Неплохо, но дорого.`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Неплохо, но дорого.`
      },
      {
        "user": `petrov@example.com`,
        "text": `С чем связана продажа? Почему так дешёво? Вы что?! В магазине дешевле. Совсем немного...`
      }
    ]
  },
  {
    "user": `petrov@example.com`,
    "categories": [
      `Цветы`
    ],
    "description": `Если товар не понравится — верну всё до последней копейки. Кому нужен этот новый телефон если тут такое... Не пытайтесь торговаться. Цену вещам я знаю. Кажется, что это хрупкая вещь.`,
    "picture": `item03.jpg`,
    "title": `Продам коллекцию журналов «Огонёк».`,
    "type": `OFFER`,
    "sum": 19457,
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": `Совсем немного... Продаю в связи с переездом. Отрываю от сердца.`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Вы что?! В магазине дешевле.`
      },
      {
        "user": `petrov@example.com`,
        "text": `Продаю в связи с переездом. Отрываю от сердца. Вы что?! В магазине дешевле.`
      }
    ]
  },
  {
    "user": `ivanov@example.com`,
    "categories": [
      `Цветы`
    ],
    "description": `Бонусом отдам все аксессуары. Мой дед не мог её сломать. Две страницы заляпаны свежим кофе. Даю недельную гарантию.`,
    "picture": `item07.jpg`,
    "title": `Продам книги Стивена Кинга.`,
    "type": `SALE`,
    "sum": 79773,
    "comments": [
      {
        "user": `petrov@example.com`,
        "text": `Почему в таком ужасном состоянии?`
      },
      {
        "user": `petrov@example.com`,
        "text": `Неплохо, но дорого. А где блок питания?`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Вы что?! В магазине дешевле. Продаю в связи с переездом. Отрываю от сердца.`
      }
    ]
  }
];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, offers: mockOffers, users: mockUsers});
  search(app, new DataService(mockDB));
});

describe(`API returns offer based on search query`, () => {
  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/search`)
      .query({
        query: `Продам новую приставку`
      });
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`1 offer found`, () => expect(response.body.length).toBe(1));

  test(`Offer has correct title`, () => expect(response.body[0].title).toBe(`Продам новую приставку Sony Playstation 5.`));
});

test(`API returns code 404 if nothing is found`,
    () => request(app)
      .get(`/search`)
      .query({
        query: `Продам свою душу`
      })
      .expect(HttpCode.NOT_FOUND)
);

test(`API returns 400 when query string is absent`,
    () => request(app)
     .get(`/search`)
      .expect(HttpCode.BAD_REQUEST)
);
