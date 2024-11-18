INSERT INTO users
  (username, email, password)
VALUES
  (
    'admin',
    'admin@test.com',
    '$2a$10$DQK2kiM6tFhhsXMQkFqksuWbfaSM6UcbemIH0qjkU8sEQuHLzdZga'
  ),
  (
    'Jared',
    'Jared@gmail.com',
    '$2a$10$9aCjnslkifLvo.wmJKkeIOT4HYfvECOuJFdzPBqhnOcPgXbAqSR.e'
  ),
  (
    'Tyler',
    'tyler@gmail.com',
    '$2a$10$9aCjnslkifLvo.wmJKkeIOT4HYfvECOuJFdzPBqhnOcPgXbAqSR.e'
  );

INSERT INTO friendships
  (user1, user2, status)
VALUES
  (
    'admin',
    'Tyler',
    'accepted'
  ),
  (
    'Tyler',
    'Jared',
    'pending'
  );