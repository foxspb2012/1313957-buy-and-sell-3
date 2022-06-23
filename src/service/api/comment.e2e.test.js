'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const comment = require(`./comment`);
const DataService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);
const initDB = require(`../lib/init-db`);
const passwordUtils = require(`../lib/password`);

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
        "user": `petrov@example.com`,
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
        "user": `ivanov@example.com`,
        "text": `Неплохо, но дорого. А где блок питания?`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Вы что?! В магазине дешевле. Продаю в связи с переездом. Отрываю от сердца.`
      }
    ]
  }
];

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {categories: mockCategories, offers: mockOffers, users: mockUsers});
  const app = express();

  app.use(express.json());
  comment(app, new DataService(mockDB), new CommentService(mockDB));
  return app;
};

describe(`API returns a list of comments to given offer`, () => {

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers/2/comments`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 3 comments`, () => expect(response.body.length).toBe(3));

  test(`First comment's text is "Совсем немного... Продаю в связи с переездом. Отрываю от сердца."`,
      () => expect(response.body[0].text).toBe(`Совсем немного... Продаю в связи с переездом. Отрываю от сердца.`));

});


describe(`API creates a comment if data is valid`, () => {

  const newComment = {
    text: `Валидному комментарию достаточно этого поля`,
    userId: 1
  };

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers/3/comments`)
      .send(newComment);
  });


  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Comments count is changed`, () => request(app)
    .get(`/offers/3/comments`)
    .expect((res) => expect(res.body.length).toBe(4))
  );

});

test(`API refuses to create a comment to non-existent offer and returns status code 404`, async () => {

  const app = await createAPI();

  return request(app)
    .post(`/offers/20/comments`)
    .send({
      text: `Неважно`
    })
    .expect(HttpCode.NOT_FOUND);

});

test(`API refuses to create a comment when data is invalid, and returns status code 400`, async () => {

  const invalidComment = {
    text: `Не указан userId`
  };

  const app = await createAPI();

  return request(app)
    .post(`/offers/2/comments`)
    .send({})
    .send(invalidComment)
    .expect(HttpCode.BAD_REQUEST);

});

describe(`API correctly deletes a comment`, () => {

  let app; let response;
  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/1/comments/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Comments count is 3 now`, () => request(app)
    .get(`/offers/1/comments`)
    .expect((res) => expect(res.body.length).toBe(2))
  );

});

test(`API refuses to delete non-existent comment`, async () => {

  const app = await createAPI();

  return request(app)
    .delete(`/offers/4/comments/100`)
    .expect(HttpCode.NOT_FOUND);

});

test(`API refuses to delete a comment to non-existent offer`, async () => {

  const app = await createAPI();

  return request(app)
    .delete(`/offers/20/comments/1`)
    .expect(HttpCode.NOT_FOUND);

});
