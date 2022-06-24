'use strict';

const axios = require(`axios`);

const {HttpMethod} = require(`../constants`);
const TIMEOUT = 1000;

const port = process.env.API_PORT || 3000;
const defaultUrl = `http://localhost:${port}/api/`;

class API {
  constructor(baseURL, timeout) {
    this._http = axios.create({
      baseURL,
      timeout
    });
  }

  async _load(url, options) {
    const response = await this._http.request({url, ...options});
    return response.data;
  }

  // Объявления
  getOffer({id, userId, withComments}) {
    return this._load(`/offers/${id}`, {params: {userId, withComments}});
  }

  getOffers({offset, limit, userId, categoryId, withComments} = {}) {
    return this._load(`/offers`, {params: {limit, offset, userId, categoryId, withComments}});
  }

  createOffer({data}) {
    return this._load(`/offers`, {
      method: HttpMethod.POST,
      data
    });
  }

  editOffer({id, data}) {
    return this._load(`/offers/${id}`, {
      method: HttpMethod.PUT,
      data
    });
  }

  removeOffer({id, userId}) {
    return this._load(`/offers/${id}`, {
      method: HttpMethod.DELETE,
      data: {
        userId
      }
    });
  }

  // Поиск
  search({query}) {
    return this._load(`/search`, {params: {query}});
  }

  // Категории
  getCategory({categoryId, limit, offset}) {
    return this._load(`/category/${categoryId}`, {params: {limit, offset}});
  }

  getCategories({withCount}) {
    return this._load(`/category`, {params: {withCount}});
  }

  // Комментарии
  createComment({id, data, limit}) {
    return this._load(`/offers/${id}/comments`, {
      method: HttpMethod.POST,
      data,
      params: {limit}
    });
  }

  removeComment({id, userId, commentId, limit}) {
    return this._load(`/offers/${id}/comments/${commentId}`, {
      method: HttpMethod.DELETE,
      data: {
        userId
      },
      params: {limit}
    });
  }

  // Пользователи
  createUser({data}) {
    return this._load(`/user`, {
      method: HttpMethod.POST,
      data
    });
  }

  auth({email, password}) {
    return this._load(`/user/auth`, {
      method: HttpMethod.POST,
      data: {email, password}
    });
  }
}

const defaultAPI = new API(defaultUrl, TIMEOUT);

module.exports = {
  API,
  getAPI: () => defaultAPI
};
