CREATE TABLE users (
    id SERIAL PRIMARY KEY NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    date_of_birth DATE
);

CREATE TABLE story (
    id SERIAL PRIMARY KEY NOT NULL,
    story_date DATE NOT NULL,
    story_name TEXT NOT NULL,
    story_description TEXT NOT NULL
);

--Insert data to story
INSERT INTO story (story_date, story_name, story_description) VALUES ('2020-06-27', 'Start Project2 Database', 'Today I started my project2 database');

--Insert data to users:
INSERT INTO users (first_name, last_name, user_name, password, date_of_birth) VALUES ('Jeremy', 'Duong', 'jeremi1995', 'uljlo78u8k', '1995-09-19');

GRANT SELECT, INSERT, UPDATE ON story TO clientuser1;
GRANT USAGE, SELECT ON SEQUENCE story_id_seq TO clientuser1;

GRANT SELECT, INSERT, UPDATE ON users TO clientuser1;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO clientuser1;
