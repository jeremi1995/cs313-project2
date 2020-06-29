CREATE TABLE story (
    id SERIAL PRIMARY KEY NOT NULL,
    story_date DATE NOT NULL,
    story_name TEXT NOT NULL,
    story_description TEXT NOT NULL
);

INSERT INTO story (story_date, story_name, story_description) VALUES ('2020-06-27', 'Start Project2 Database', 'Today I started my project2 database');

GRANT SELECT, INSERT, UPDATE ON story TO clientuser1;
GRANT USAGE, SELECT ON SEQUENCE story_id_seq TO clientuser1;
