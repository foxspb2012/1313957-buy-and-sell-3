'use strict';

const express = require(`express`);
const request = require(`supertest`);

const search = require(`./search`);
const DataService = require(`../data-service/search`);

const {HttpCode} = require(`../../constants`);

const mockData = [
  {
    "id": `FvF5Dk`,
    "category": [
      `Животные`
    ],
    "description": `Кажется, что это хрупкая вещь. Пользовались бережно и только по большим праздникам. Это настоящая находка для коллекционера! Продаю с болью в сердце...`,
    "picture": `item07.jpg`,
    "title": `Продам новую приставку Sony Playstation 5.`,
    "type": `offer`,
    "sum": 72577,
    "comments": [
      {
        "id": `uZiI7E`,
        "text": `А где блок питания? А сколько игр в комплекте? Неплохо, но дорого.`
      },
      {
        "id": `8QHab0`,
        "text": `Неплохо, но дорого.`
      },
      {
        "id": `KzhDud`,
        "text": `С чем связана продажа? Почему так дешёво? Вы что?! В магазине дешевле. Совсем немного...`
      }
    ]
  },
  {
    "id": `5JSFlI`,
    "category": [
      `Посуда`
    ],
    "description": `Если товар не понравится — верну всё до последней копейки. Кому нужен этот новый телефон если тут такое... Не пытайтесь торговаться. Цену вещам я знаю. Кажется, что это хрупкая вещь.`,
    "picture": `item03.jpg`,
    "title": `Продам коллекцию журналов «Огонёк».`,
    "type": `offer`,
    "sum": 19457,
    "comments": [
      {
        "id": `RC1BMG`,
        "text": `Совсем немного... Продаю в связи с переездом. Отрываю от сердца.`
      },
      {
        "id": `wlVDUB`,
        "text": `Вы что?! В магазине дешевле.`
      },
      {
        "id": `AHW4EE`,
        "text": `Продаю в связи с переездом. Отрываю от сердца. Вы что?! В магазине дешевле.`
      }
    ]
  },
  {
    "id": `5j1SB_`,
    "category": [
      `Посуда`
    ],
    "description": `Бонусом отдам все аксессуары. Мой дед не мог её сломать. Две страницы заляпаны свежим кофе. Даю недельную гарантию.`,
    "picture": `item07.jpg`,
    "title": `Продам книги Стивена Кинга.`,
    "type": `sale`,
    "sum": 79773,
    "comments": [
      {
        "id": `4IuZki`,
        "text": `Почему в таком ужасном состоянии?`
      },
      {
        "id": `_N8X67`,
        "text": `Неплохо, но дорого. А где блок питания?`
      },
      {
        "id": `QHIMAV`,
        "text": `Вы что?! В магазине дешевле. Продаю в связи с переездом. Отрываю от сердца.`
      }
    ]
  }
];

const app = express();
app.use(express.json());
search(app, new DataService(mockData));

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

  test(`Offer has correct id`, () => expect(response.body[0].id).toBe(`FvF5Dk`));
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
