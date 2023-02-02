CREATE TABLE IF NOT EXISTS account (id varchar(255) NOT NULL);
CREATE TABLE IF NOT EXISTS account_session (id varchar(255) NOT NULL);
CREATE TABLE IF NOT EXISTS organization (id varchar(255) NOT NULL);
CREATE TABLE IF NOT EXISTS account_organization (id varchar(255) NOT NULL);
CREATE TABLE IF NOT EXISTS project (id varchar(255) NOT NULL);
CREATE TABLE IF NOT EXISTS `user` (id varchar(255) NOT NULL);
CREATE TABLE IF NOT EXISTS user_session (id varchar(255) NOT NULL);
CREATE TABLE IF NOT EXISTS settings (allow_multiple_accounts tinyint DEFAULT 0 NOT NULL);

ALTER TABLE account ADD COLUMN IF NOT EXISTS id              varchar(255) NOT NULL;
ALTER TABLE account ADD COLUMN IF NOT EXISTS name            varchar(255) NOT NULL;
ALTER TABLE account ADD COLUMN IF NOT EXISTS email           varchar(255) NOT NULL UNIQUE;
ALTER TABLE account ADD COLUMN IF NOT EXISTS password_hash   varchar(64) NOT NULL;
ALTER TABLE account ADD COLUMN IF NOT EXISTS created_at      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE account ADD COLUMN IF NOT EXISTS updated_at      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE account ADD COLUMN IF NOT EXISTS enabled         tinyint DEFAULT 1 NOT NULL;
ALTER TABLE account ADD COLUMN IF NOT EXISTS personal_org_id varchar(255) NOT NULL;
ALTER TABLE account ADD PRIMARY KEY IF NOT EXISTS            (id);


ALTER TABLE account_session ADD COLUMN IF NOT EXISTS session_id  bigint(20) NOT NULL;
ALTER TABLE account_session ADD COLUMN IF NOT EXISTS iteration  int(10) NOT NULL DEFAULT 1;
ALTER TABLE account_session ADD COLUMN IF NOT EXISTS account_id varchar(255) NOT NULL;
ALTER TABLE account_session ADD COLUMN IF NOT EXISTS valid      tinyint NOT NULL DEFAULT 1;
ALTER TABLE account_session ADD COLUMN IF NOT EXISTS expires    timestamp NOT NULL;
ALTER TABLE account_session DROP COLUMN IF EXISTS    id;           
ALTER TABLE account_session ADD PRIMARY KEY IF NOT EXISTS       (session_id, iteration);


ALTER TABLE organization ADD COLUMN IF NOT EXISTS id         varchar(255) NOT NULL;
ALTER TABLE organization ADD COLUMN IF NOT EXISTS name       varchar(255) NOT NULL;
ALTER TABLE organization ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE organization ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE organization ADD PRIMARY KEY IF NOT EXISTS       (id);


ALTER TABLE account_organization ADD COLUMN IF NOT EXISTS account_id      varchar(255) NOT NULL;
ALTER TABLE account_organization ADD COLUMN IF NOT EXISTS organization_id varchar(255) NOT NULL;
ALTER TABLE account_organization ADD COLUMN IF NOT EXISTS org_rolename    enum('OWNER', 'MEMBER') NOT NULL;
ALTER TABLE account_organization DROP COLUMN IF EXISTS                    id;
ALTER TABLE account_organization ADD PRIMARY KEY IF NOT EXISTS            (account_id, organization_id);


ALTER TABLE project ADD COLUMN IF NOT EXISTS id              varchar(255) NOT NULL;
ALTER TABLE project ADD COLUMN IF NOT EXISTS organization_id varchar(255) NOT NULL; 
ALTER TABLE project ADD COLUMN IF NOT EXISTS name            varchar(255) NOT NULL;
ALTER TABLE project ADD COLUMN IF NOT EXISTS created_at      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE project ADD COLUMN IF NOT EXISTS updated_at      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE project ADD PRIMARY KEY IF NOT EXISTS            (id);


ALTER TABLE `user` ADD COLUMN IF NOT EXISTS id            varchar(255) NOT NULL;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS project_id    varchar(255) NOT NULL;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS name          varchar(255) NOT NULL;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS email         varchar(255) NOT NULL UNIQUE;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS password_hash varchar(255) NOT NULL;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS created_at    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS updated_at    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS enabled       tinyint NOT NULL;
ALTER TABLE `user` ADD PRIMARY KEY IF NOT EXISTS          (id);


ALTER TABLE user_session ADD COLUMN IF NOT EXISTS session_id  bigint(20) NOT NULL;
ALTER TABLE user_session ADD COLUMN IF NOT EXISTS iteration  int(10) NOT NULL DEFAULT 1;
ALTER TABLE user_session ADD COLUMN IF NOT EXISTS user_id varchar(255) NOT NULL;
ALTER TABLE user_session ADD COLUMN IF NOT EXISTS valid      tinyint NOT NULL DEFAULT 1;
ALTER TABLE user_session ADD COLUMN IF NOT EXISTS expires    timestamp NOT NULL;
ALTER TABLE user_session DROP COLUMN IF EXISTS    id;           
ALTER TABLE user_session ADD PRIMARY KEY IF NOT EXISTS       (session_id, iteration);

ALTER TABLE settings ADD COLUMN IF NOT EXISTS allow_multiple_accounts tinyint DEFAULT 0 NOT NULL;
ALTER TABLE settings DROP COLUMN IF EXISTS    id;

-- Add foregin keys
ALTER TABLE account ADD CONSTRAINT FKaccount871550 FOREIGN KEY IF NOT EXISTS (personal_org_id) REFERENCES organization (id);
ALTER TABLE account_session ADD CONSTRAINT FKaccount_se940770 FOREIGN KEY IF NOT EXISTS (account_id) REFERENCES account (id) ON DELETE CASCADE;
ALTER TABLE user_session ADD CONSTRAINT FKuser_sessi161530 FOREIGN KEY IF NOT EXISTS (user_id) REFERENCES `user` (id) ON DELETE CASCADE;
ALTER TABLE `user` ADD CONSTRAINT FKuser291107 FOREIGN KEY IF NOT EXISTS (project_id) REFERENCES project (id) ON DELETE CASCADE;
ALTER TABLE account_organization ADD CONSTRAINT FKaccount_or457631 FOREIGN KEY IF NOT EXISTS (account_id) REFERENCES account (id) ON DELETE CASCADE;
ALTER TABLE account_organization ADD CONSTRAINT FKaccount_or364128 FOREIGN KEY IF NOT EXISTS (organization_id) REFERENCES organization (id) ON DELETE CASCADE;
ALTER TABLE project ADD CONSTRAINT FKproject868004 FOREIGN KEY IF NOT EXISTS (organization_id) REFERENCES organization (id) ON DELETE CASCADE;
