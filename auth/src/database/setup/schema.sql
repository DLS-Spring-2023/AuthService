CREATE TABLE IF NOT EXISTS account (
  id            varchar(255) NOT NULL, 
  name          varchar(255) NOT NULL, 
  email         varchar(255) NOT NULL UNIQUE, 
  password_hash varchar(64)  NOT NULL, 
  created_at    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  updated_at    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
  enabled       tinyint      NOT NULL DEFAULT 1 , 
  PRIMARY KEY (id));


CREATE TABLE IF NOT EXISTS account_session (
  id         bigint(20)   NOT NULL UNIQUE, 
  session_id bigint(20)   NOT NULL, 
  iteration  int(10)      NOT NULL DEFAULT 1, 
  account_id varchar(255) NOT NULL, 
  valid      tinyint      NOT NULL DEFAULT 1, 
  expires    timestamp    NOT NULL, 
  PRIMARY KEY (session_id, iteration));


CREATE TABLE IF NOT EXISTS project (
  id         varchar(255) NOT NULL, 
  account_id varchar(255) NOT NULL, 
  name       varchar(255) NOT NULL, 
  created_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  updated_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
  PRIMARY KEY (id));


CREATE TABLE IF NOT EXISTS server_settings (
  allow_multiple_accounts tinyint DEFAULT 0 NOT NULL);


CREATE TABLE IF NOT EXISTS `user` (
  id            varchar(255) NOT NULL, 
  project_id    varchar(255) NOT NULL, 
  name          varchar(255) NOT NULL, 
  email         varchar(255) NOT NULL UNIQUE, 
  password_hash varchar(255) NOT NULL, 
  role          varchar(255), 
  created_at    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  updated_at    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
  enabled       tinyint      NOT NULL DEFAULT 1 , 
  verified      tinyint      NOT NULL DEFAULT 0 , 
  PRIMARY KEY (id));


CREATE TABLE IF NOT EXISTS user_session (
  id         bigint(20)   NOT NULL UNIQUE, 
  session_id bigint(20)   NOT NULL, 
  iteration  int(10)      NOT NULL DEFAULT 1, 
  user_id    varchar(255) NOT NULL, 
  valid      tinyint      NOT NULL DEFAULT 1, 
  expires    timestamp    NOT NULL, 
  PRIMARY KEY (session_id, iteration));


ALTER TABLE IF EXISTS project ADD CONSTRAINT FKproject313086 FOREIGN KEY IF NOT EXISTS (account_id) REFERENCES account (id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE IF EXISTS user_session ADD CONSTRAINT  FKuser_sessi859336 FOREIGN KEY IF NOT EXISTS (user_id) REFERENCES `user` (id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE IF EXISTS `user` ADD CONSTRAINT FKuser291107 FOREIGN KEY IF NOT EXISTS (project_id) REFERENCES project (id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE IF EXISTS account_session ADD CONSTRAINT FKaccount_se158343 FOREIGN KEY IF NOT EXISTS (account_id) REFERENCES account (id) ON DELETE CASCADE ON UPDATE CASCADE;

