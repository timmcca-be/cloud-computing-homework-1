create database cchw1;
use cchw1;
create table users (
    id int auto_increment primary key,
    username varchar(20) unique not null,
    password binary(60) not null,
    first_name varchar(35) not null,
    last_name varchar(35) not null,
    email varchar(255) unique not null
);
