-- Список всех категорий

SELECT * FROM categories

-- Список непустых категорий

SELECT id, name FROM categories
  JOIN offer_categories
  ON id = category_id
  GROUP BY id

-- Список категорий с количеством объявлений

SELECT id, name, count(offer_id) FROM categories
  LEFT JOIN offer_categories
  ON id = category_id
  GROUP BY id

-- Список объявлений, сначала свежие

SELECT offers.*,
  count(comments.id) AS comments_count,
  STRING_AGG(DISTINCT categories.name, ', ') AS category_list,
  users.first_name,
  users.last_name,
  users.email
FROM offers
  JOIN offer_categories ON offers.id = offer_categories.offer_id
  JOIN categories ON offer_categories.category_id = categories.id
  LEFT JOIN comments ON comments.offer_id = offers.id
  JOIN users ON users.id = offers.user_id
  GROUP BY offers.id, users.id
  ORDER BY offers.created_at DESC

-- Полная информация объявления

SELECT offers.*,
  count(comments.id) AS comments_count,
  STRING_AGG(DISTINCT categories.name, ', ') AS category_list,
  users.first_name,
  users.last_name,
  users.email
FROM offers
  JOIN offer_categories ON offers.id = offer_categories.offer_id
  JOIN categories ON offer_categories.category_id = categories.id
  LEFT JOIN comments ON comments.offer_id = offers.id
  JOIN users ON users.id = offers.user_id
where offers.id = 1
  group by offers.id, users.id

-- Пять свежих комментариев
SELECT
  comments.id,
  comments.offer_id,
  users.first_name,
  users.last_name,
  comments.text
FROM comments
  JOIN users ON comments.user_id = users.id
  ORDER BY comments.created_at DESC
  LIMIT 5

-- Все комментарии к объявлению
SELECT
  comments.id,
  comments.offer_id,
  users.first_name,
  users.last_name,
  comments.text
FROM comments
  JOIN users ON comments.user_id = users.id
WHERE comments.offer_id = 1
  ORDER BY comments.created_at DESC

-- Два объявления о покупке
SELECT * FROM offers
WHERE type = 'OFFER'
  LIMIT 2

-- Обновить заголовок

UPDATE offers
SET title = 'Уникальное предложение!'
WHERE id = 1
