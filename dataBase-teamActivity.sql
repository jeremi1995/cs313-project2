CREATE TABLE person (
    id SERIAL PRIMARY KEY NOT NULL,
    first VARCHAR(100) NOT NULL,
    last VARCHAR(100),
    birthdate date
);

-- inserted some users
INSERT INTO person (first, last, birthdate) values ('Jeremy', 'Duong', '1995-09-19');
INSERT INTO person (first, last, birthdate) values ('Huynh', 'Duong', '1955-08-10');
INSERT INTO person (first, last, birthdate) values ('An', 'Duong', '1988-12-12');

CREATE USER clientuser1 WITH PASSWORD '123456';
GRANT SELECT, INSERT, UPDATE ON person TO clientuser1;
GRANT USAGE, SELECT ON SEQUENCE person_id_seq TO clientuser1;
