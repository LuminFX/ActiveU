CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(200) NOT NULL,
    password CHAR(60) NOT NULL
);

/*
CREATE TABLE friendships (
    user1 VARCHAR(50) NOT NULL,
    user2 VARCHAR(50) NOT NULL,
    status ENUM('pending', 'accepted') DEFAULT 'pending',
    PRIMARY KEY (user1, user2),
    FOREIGN KEY (user1) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (user2) REFERENCES users(username) ON DELETE CASCADE
);
*/

-- worry about friend stuff later. above referenced from lab 6