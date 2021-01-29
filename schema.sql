create schema if not exists dera_group_todo_app;
use dera_group_todo_app;

create table if not exists users
(
    id        int auto_increment primary key,
    name      varchar(255)        not null,
    password  varchar(255)        not null,
    username  varchar(255) unique not null,
    createdAt timestamp default CURRENT_TIMESTAMP,
    updatedAt timestamp default CURRENT_TIMESTAMP
) ENGINE = INNODB;

create table if not exists todos
(
    id        int auto_increment primary key,
    user_id   int,
    text      varchar(255)                                   not null,
    status    enum ('pending', 'done', 'deleted') not null default 'pending',
    createdAt timestamp                                               default CURRENT_TIMESTAMP,
    updatedAt timestamp                                               default CURRENT_TIMESTAMP,
    foreign key (user_id) references users (id) on delete set null on update cascade
) ENGINE = INNODB;


create table if not exists deleted_todos
(
    id        int auto_increment primary key,
    user_id   int,
    text      varchar(255) not null,
    status    varchar(20)  not null default 'deleted',
    createdAt timestamp             default CURRENT_TIMESTAMP,
    updatedAt timestamp             default CURRENT_TIMESTAMP,
    foreign key (user_id) references users (id) on delete set null on update cascade
) ENGINE = INNODB;

insert into users (name, password, username)
    values ("Chidera", "$2y$10$CR.iGipb.unOF2Tq6DGMIuwDd0/0JfTZJlH9MF2Jvq6ihQMfW4VIq", "chidera"), ("Padiwe", "$2y$10$CR.iGipb.unOF2Tq6DGMIuwDd0/0JfTZJlH9MF2Jvq6ihQMfW4VIq", "padiwe");


select * from users;