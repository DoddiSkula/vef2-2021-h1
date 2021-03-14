
DROP TABLE IF EXISTS shows;

CREATE TABLE IF NOT EXISTS shows (
  id serial primary key,
  show_name varchar(128) not null,
  show_aired date,
  inproduction boolean,
  tagline varchar(128),
  show_description varchar(65536),
  show_language varchar(128),
  network varchar(128),
  webpage varchar(128)
);

DROP TABLE IF EXISTS genre;

CREATE TABLE IF NOT EXISTS genre (
  id serial primary key,
  genre_name varchar (64)
);

DROP TABLE IF EXISTS show_genre;

CREATE TABLE IF NOT EXISTS show_genre (
  id serial primary key,
  show_id bigint,
  genre integer,
  constraint show_id foreign key (show_id) REFERENCES shows(id),
  constraint genre foreign key (genre) REFERENCES genre(id)
);


DROP TABLE IF EXISTS season;

CREATE TABLE IF NOT EXISTS season (
  id serial primary key,
  season_name varchar(128) not null,
  nr integer,
  season_aired date,
  season_description varchar(256),
  poster text not null,
  show integer not null,
  constraint show foreign key (show) REFERENCES shows(id),
  constraint nr_biggerthanzero check (nr > 0)
);

DROP TABLE IF EXISTS episode;

CREATE TABLE IF NOT EXISTS episode (
  id serial primary key,
  episode_name varchar(128) not null,
  nr integer,
  episode_aired date,
  episode_description varchar(256),
  season integer not null,
  constraint season foreign key (season) REFERENCES season(id),
  constraint nr_biggerthanzero check (nr > 0)
);

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  username character varying(255) NOT NULL unique,
  password character varying(255) NOT NULL,
  admin boolean
);

-- Lykilorð: "123"
INSERT INTO users (username, password, admin) VALUES ('vef2', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', TRUE);

DROP TABLE IF EXISTS info;

CREATE TABLE IF NOT EXISTS info  (
  id serial primary key,
  show integer not null,
  usr integer not null,
  watch_state varchar(48),
  rating integer,
  constraint show foreign key (show) REFERENCES shows(id),
  constraint usr foreign key (usr) REFERENCES users(id)
);