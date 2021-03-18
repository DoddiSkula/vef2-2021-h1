DROP TABLE IF EXISTS shows CASCADE;

CREATE TABLE IF NOT EXISTS shows (
  id integer unique,
  show_name varchar(128) not null unique,
  show_aired date,
  inproduction boolean,
  tagline varchar(128),
  image text,
  show_description varchar(65536),
  show_language varchar(128),
  network varchar(128),
  webpage varchar(128)
);

DROP TABLE IF EXISTS genre CASCADE;

CREATE TABLE IF NOT EXISTS genre (
  id serial primary key,
  genre_name varchar(64) not null unique
);

DROP TABLE IF EXISTS show_genre CASCADE;

CREATE TABLE IF NOT EXISTS show_genre (
  id serial primary key,
  show_name varchar(128) not null REFERENCES shows(show_name),
  genre_name varchar(64) not null REFERENCES genre(genre_name)
);


DROP TABLE IF EXISTS season CASCADE;

CREATE TABLE IF NOT EXISTS season (
  id serial primary key,
  season_name varchar(128) not null,
  nr integer,
  season_aired date,
  season_description varchar(65536),
  poster text not null,
  show_id integer,
  constraint show_id foreign key (show_id) REFERENCES shows(id),
  constraint nr_biggerthanzero check (nr > 0)
);

DROP TABLE IF EXISTS episode CASCADE;

CREATE TABLE IF NOT EXISTS episode (
  id serial primary key,
  episode_name varchar(128) not null,
  nr integer,
  episode_aired date,
  episode_description varchar(65536),
  season_id bigint not null,
  show_id integer,  
  constraint season_id foreign key (season_id) REFERENCES season(id),
  constraint show_id foreign key (show_id) REFERENCES shows(id),
  constraint nr_biggerthanzero check (nr > 0)
);

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  username character varying(255) NOT NULL unique,
  email varchar(70) NOT NULL unique,
  password character varying(255) NOT NULL,
  admin boolean default false
);

-- Lykilorð: "12345678"
INSERT INTO users (username, email, password, admin) VALUES ('admin', 'admin@admin.is', '$2b$10$Koyb5tsdW0S8yApyH12fku884z9M4kNQcxn3Uep/ueDXNVLfwYCaq', TRUE);
-- Lykilorð: "12345678"
INSERT INTO users (username, email, password, admin) VALUES ('notandi', 'notandi@notandi.is', '$2b$10$Koyb5tsdW0S8yApyH12fku884z9M4kNQcxn3Uep/ueDXNVLfwYCaq', FALSE);

DROP TABLE IF EXISTS info CASCADE;

CREATE TABLE IF NOT EXISTS info  (
  id serial primary key,
  show_id bigint not null,
  user_id bigint not null,
  watch_state varchar(48),
  rating integer,
  constraint show_id foreign key (show_id) REFERENCES shows(id),
  constraint user_id foreign key (user_id) REFERENCES users(id)
);
