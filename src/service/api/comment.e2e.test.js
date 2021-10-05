'use strict';

const express = require(`express`);
const request = require(`supertest`);

const comment = require(`./comment`);
const DataService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);

const {HttpCode} = require(`../../constants`);

const mockData = [
  {
    "id": `bUAlOA`,
    "category": [
      `Животные`
    ],
    "comments": [
      {
        "id": `nTTBf0`,
        "text": `Неплохо, но дорого. Оплата наличными или перевод на карту? Продаю в связи с переездом. Отрываю от сердца.`
      },
      {
        "id": `1Zos2U`,
        "text": `А где блок питания? Неплохо, но дорого.`
      },
      {
        "id": `XSpI5z`,
        "text": `Оплата наличными или перевод на карту?`
      },
      {
        "id": `ooeYVR`,
        "text": `Продаю в связи с переездом. Отрываю от сердца. С чем связана продажа? Почему так дешёво? Оплата наличными или перевод на карту?`
      }
    ],
    "description": `Продаю с болью в сердце... Даю недельную гарантию. Если найдёте дешевле — сброшу цену. Если товар не понравится — верну всё до последней копейки.`,
    "picture": `item02.jpg`,
    "title": `Куплю антиквариат`,
    "type": `OFFER`,
    "sum": 10405
  },
  {
    "id": `ptkZyI`,
    "category": [
      `Посуда`
    ],
    "comments": [
      {
        "id": `0DWOxR`,
        "text": `Почему в таком ужасном состоянии?`
      },
      {
        "id": `7ouDWO`,
        "text": `Продаю в связи с переездом. Отрываю от сердца.`
      },
      {
        "id": `k3H8Jj`,
        "text": `С чем связана продажа? Почему так дешёво? Вы что?! В магазине дешевле. Оплата наличными или перевод на карту?`
      }
    ],
    "description": `Если товар не понравится — верну всё до последней копейки. Если найдёте дешевле — сброшу цену. При покупке с меня бесплатная доставка в черте города. Бонусом отдам все аксессуары.`,
    "picture": `item12.jpg`,
    "title": `Продам слона`,
    "type": `SALE`,
    "sum": 96693
  },
  {
    "id": `GxdTgz`,
    "category": [
      `Марки`
    ],
    "comments": [
      {
        "id": `kqME9j`,
        "text": `А сколько игр в комплекте? Почему в таком ужасном состоянии?`
      },
      {
        "id": `V_Icd5`,
        "text": `Продаю в связи с переездом. Отрываю от сердца. Вы что?! В магазине дешевле.`
      },
      {
        "id": `uX3tD9`,
        "text": `Совсем немного... Почему в таком ужасном состоянии?`
      },
      {
        "id": `BTvHLX`,
        "text": `А где блок питания?`
      }
    ],
    "description": `Таких предложений больше нет! Даю недельную гарантию. Это настоящая находка для коллекционера! Если товар не понравится — верну всё до последней копейки.`,
    "picture": `item12.jpg`,
    "title": `Продам отличную подборку фильмов на VHS`,
    "type": `OFFER`,
    "sum": 54666
  },
  {
    "id": `XMlMSs`,
    "category": [
      `Разное`
    ],
    "comments": [
      {
        "id": `avVlR3`,
        "text": `А сколько игр в комплекте? Продаю в связи с переездом. Отрываю от сердца.`
      }
    ],
    "description": `Если найдёте дешевле — сброшу цену. При покупке с меня бесплатная доставка в черте города. Таких предложений больше нет! Бонусом отдам все аксессуары.`,
    "picture": `item13.jpg`,
    "title": `Продам отличную подборку фильмов на VHS`,
    "type": `OFFER`,
    "sum": 29392
  },
  {
    "id": `lP5Raq`,
    "category": [
      `Книги`
    ],
    "comments": [
      {
        "id": `W-zdkL`,
        "text": `Продаю в связи с переездом. Отрываю от сердца.`
      }
    ],
    "description": `Продаю с болью в сердце... Бонусом отдам все аксессуары. Это настоящая находка для коллекционера! Даю недельную гарантию.`,
    "picture": `item16.jpg`,
    "title": `Продам отличную подборку фильмов на VHS`,
    "type": `SALE`,
    "sum": 46020
  }
];

const createAPI = () => {
  const app = express();
  const cloneData = JSON.parse(JSON.stringify(mockData));
  app.use(express.json());
  comment(app, new DataService(cloneData), new CommentService());
  return app;
};

describe(`API returns a list of comments to given offer`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers/GxdTgz/comments`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 4 comments`, () => expect(response.body.length).toBe(4));

  test(`First comment's id is "kqME9j"`, () => expect(response.body[0].id).toBe(`kqME9j`));

});


describe(`API creates a comment if data is valid`, () => {

  const newComment = {
    text: `Валидному комментарию достаточно этого поля`
  };
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/offers/GxdTgz/comments`)
      .send(newComment);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Returns comment created`, () => expect(response.body).toEqual(expect.objectContaining(newComment)));

  test(`Comments count is changed`, () => request(app)
    .get(`/offers/GxdTgz/comments`)
    .expect((res) => expect(res.body.length).toBe(5))
  );

});

test(`API refuses to create a comment to non-existent offer and returns status code 404`, () => {

  const app = createAPI();

  return request(app)
    .post(`/offers/NOEXST/comments`)
    .send({
      text: `Неважно`
    })
    .expect(HttpCode.NOT_FOUND);

});

test(`API refuses to create a comment when data is invalid, and returns status code 400`, () => {

  const app = createAPI();

  return request(app)
    .post(`/offers/GxdTgz/comments`)
    .send({})
    .expect(HttpCode.BAD_REQUEST);

});

describe(`API correctly deletes a comment`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/offers/GxdTgz/comments/kqME9j`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns comment deleted`, () => expect(response.body.id).toBe(`kqME9j`));

  test(`Comments count is 3 now`, () => request(app)
    .get(`/offers/GxdTgz/comments`)
    .expect((res) => expect(res.body.length).toBe(3))
  );

});

test(`API refuses to delete non-existent comment`, () => {

  const app = createAPI();

  return request(app)
    .delete(`/offers/GxdTgz/comments/NOEXST`)
    .expect(HttpCode.NOT_FOUND);

});

test(`API refuses to delete a comment to non-existent offer`, () => {

  const app = createAPI();

  return request(app)
    .delete(`/offers/NOEXST/comments/kqME9j`)
    .expect(HttpCode.NOT_FOUND);

});
