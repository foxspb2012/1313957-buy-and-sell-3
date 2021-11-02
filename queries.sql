SELECT *
FROM categories;

SELECT id, name
FROM categories
       JOIN offer_categories
            ON id = category_id
GROUP BY id;

SELECT id, name, count(offer_id)
FROM categories
       LEFT JOIN offer_categories
                 ON id = offer_categories.category_id
GROUP BY id;

SELECT offers.id,
       offers.title,
       offers.sum,
       offers.type,
       offers.description,
       offers.created_at,
       users.first_name,
       users.last_name,
       users.email,
       STRING_AGG(DISTINCT categories.name, ', ') AS category_list,
       COUNT(comments.id)                         AS comments_count
FROM offers
       JOIN offer_categories ON offers.id = offer_categories.offer_id
       JOIN categories ON offer_categories.category_id = categories.id
       LEFT JOIN comments ON comments.offer_id = offers.id
       JOIN users ON users.id = offers.user_id
GROUP BY offers.id, users.id, offers.created_at
ORDER BY offers.created_at DESC;

SELECT offers.id,
       offers.title,
       offers.sum,
       offers.type,
       offers.description,
       offers.created_at,
       users.first_name,
       users.last_name,
       users.email,
       STRING_AGG(DISTINCT categories.name, ', ') AS category_list,
       COUNT(comments.id)                         AS comments_count
FROM offers
       JOIN offer_categories ON offers.id = offer_categories.offer_id
       JOIN categories ON offer_categories.category_id = categories.id
       LEFT JOIN comments ON offers.id = comments.offer_id
       JOIN users ON users.id = offers.user_id
WHERE offers.id = 1
GROUP BY offers.id, users.id;

SELECT comments.id,
       comments.offer_id,
       users.first_name,
       users.last_name,
       comments.text
FROM comments
       JOIN users ON comments.user_id = users.id
ORDER BY comments.created_at DESC
LIMIT 5;

SELECT comments.id,
       comments.offer_id,
       users.first_name,
       users.last_name,
       comments.text
FROM comments
       JOIN users ON comments.user_id = users.id
WHERE comments.offer_id = 1
ORDER BY comments.created_at DESC;

SELECT *
FROM offers
WHERE type = 'OFFER'
LIMIT 2;

UPDATE offers
SET title = 'Уникальное предложение!'
WHERE id = 1;
