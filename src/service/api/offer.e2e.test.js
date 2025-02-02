'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const initDB = require(`../lib/init-db`);
const passwordUtils = require(`../lib/password`);
const offer = require(`./offer`);
const DataService = require(`../data-service/offer`);

const {HttpCode} = require(`../../constants`);

const mockCategories = [
  `Животные`,
  `Посуда`,
  `Марки`,
  `Разное`,
  `Книги`,
  `Цветы`,
  `Марки`
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
      `Животные`,
      `Марки`,
    ],
    "comments": [
      {
        "user": `petrov@example.com`,
        "text": `Неплохо, но дорого. Оплата наличными или перевод на карту? Продаю в связи с переездом. Отрываю от сердца.`
      },
      {
        "user": `ivanov@example.com`,
        "text": `А где блок питания? Неплохо, но дорого.`
      },
      {
        "user": `petrov@example.com`,
        "text": `Оплата наличными или перевод на карту?`
      },
      {
        "user": `ivanov@example.com`,
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
    "user": `petrov@example.com`,
    "categories": [
      `Посуда`
    ],
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": `Почему в таком ужасном состоянии?`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Продаю в связи с переездом. Отрываю от сердца.`
      },
      {
        "user": `petrov@example.com`,
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
    "user": `petrov@example.com`,
    "categories": [
      `Марки`
    ],
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": `А сколько игр в комплекте? Почему в таком ужасном состоянии?`
      },
      {
        "user": `petrov@example.com`,
        "text": `Продаю в связи с переездом. Отрываю от сердца. Вы что?! В магазине дешевле.`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Совсем немного... Почему в таком ужасном состоянии?`
      },
      {
        "user": `petrov@example.com`,
        "text": `А где блок питания?`
      }
    ],
    "description": `Таких предложений больше нет! Даю недельную гарантию. Это настоящая находка для коллекционера! Если товар не понравится — верну всё до последней копейки.`,
    "picture": `item12.jpg`,
    "title": `Продам новую приставку Sony Playstation 5`,
    "type": `OFFER`,
    "sum": 54666
  },
  {
    "user": `ivanov@example.com`,
    "categories": [
      `Разное`,
      `Марки`,
      `Посуда`
    ],
    "comments": [
      {
        "user": `petrov@example.com`,
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
    "user": `ivanov@example.com`,
    "categories": [
      `Книги`
    ],
    "comments": [
      {
        "user": `petrov@example.com`,
        "text": `Продаю в связи с переездом. Отрываю от сердца.`
      }
    ],
    "description": `Продаю с болью в сердце... Бонусом отдам все аксессуары. Это настоящая находка для коллекционера! Даю недельную гарантию.`,
    "picture": `item16.jpg`,
    "title": `Продам книги Стивена Кинга`,
    "type": `SALE`,
    "sum": 46020
  }
];

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {categories: mockCategories, offers: mockOffers, users: mockUsers});
  const app = express();

  app.use(express.json());
  offer(app, new DataService(mockDB));
  return app;
};

describe(`API returns a list of all offers`, () => {

  let response;

  beforeAll(async () => {
    let app = await createAPI();
    response = await request(app)
      .get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns a list of 5 offers`, () => expect(response.body.recent.length).toBe(5));

  test(`First offer's title equals "Продам книги Стивена Кинга"`, () => expect(response.body.recent[0].title).toBe(`Продам книги Стивена Кинга`));

});

describe(`API returns an offer with given id`, () => {

  let response;

  const data = {
    userId: 1
  };

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers/1`)
      .send(data);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Offer's title is "Куплю антиквариат"`, () => expect(response.body.title).toBe(`Куплю антиквариат`));

});

describe(`API creates an offer if data is valid`, () => {

  const newOffer = {
    categories: [1, 2],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500,
    userId: 1
  };
  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers`)
      .send(newOffer);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Offers count is changed`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.recent.length).toBe(6))
  );

});

describe(`API refuses to create an offer if data is invalid`, () => {

  const newOffer = {
    categories: [1, 2],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500,
    userId: 1
  };
  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(newOffer)) {
      const badOffer = {...newOffer};
      delete badOffer[key];
      await request(app)
        .post(`/offers`)
        .send(badOffer)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When field type is wrong response code is 400`, async () => {
    const badOffers = [
      {...newOffer, sum: true},
      {...newOffer, picture: 12345},
      {...newOffer, categories: `Котики`}
    ];
    for (const badOffer of badOffers) {
      await request(app)
        .post(`/offers`)
        .send(badOffer)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When field value is wrong response code is 400`, async () => {
    const badOffers = [
      {...newOffer, sum: -1},
      {...newOffer, title: `too short`},
      {...newOffer, categories: []}
    ];
    for (const badOffer of badOffers) {
      await request(app)
        .post(`/offers`)
        .send(badOffer)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

});

describe(`API changes existent offer`, () => {

  const newOffer = {
    categories: [2],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф. К лотку приучен.`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500,
    userId: 2
  };

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/offers/2`)
      .send(newOffer);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Offer is really changed`, () => request(app)
    .get(`/offers/2`)
    .expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );

});

test(`API returns status code 404 when trying to change non-existent offer`, async () => {

  const app = await createAPI();

  const validOffer = {
    categories: [3],
    title: `Это вполне валидный`,
    description: `объект объявления, однако поскольку такого объявления в базе нет`,
    picture: `мы получим 404`,
    type: `SALE`,
    sum: 404,
    userId: 1
  };

  return request(app)
    .get(`/offers/20`)
    .send(validOffer)
    .expect(HttpCode.NOT_FOUND);
});

test(`API returns status code 400 when trying to change an offer with invalid data`, async () => {

  const app = await createAPI();

  const invalidOffer = {
    category: `Это`,
    title: `невалидный`,
    description: `объект`,
    picture: `объявления`,
    type: `нет поля sum`,
    userId: 1
  };

  return request(app)
    .put(`/offers/2`)
    .send(invalidOffer)
    .expect(HttpCode.BAD_REQUEST);
});

describe(`API correctly deletes an offer`, () => {

  let app; let response;

  const data = {
    userId: 1
  };

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/1`)
      .send(data);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Offer count is 4 now`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.recent.length).toBe(4))
  );

});

test(`API refuses to delete non-existent offer`, async () => {

  const app = await createAPI();

  return request(app)
    .delete(`/offers/20`)
    .expect(HttpCode.NOT_FOUND);

});

