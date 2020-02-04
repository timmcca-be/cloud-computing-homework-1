const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mariadb = require('mariadb');
const config = require('./config.json');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const pool = mariadb.createPool({
    host: config.dbHost,
    user: config.dbUsername,
    password: config.dbPassword,
    database: config.dbName,
    connectionLimit: 5
});

function sendToken(res, id) {
    res.send({
        token: jwt.sign({ id: id }, config.jwtSecret)
    });
}

const REGISTER_SQL = 'insert into users (username, password, first_name, last_name, email) values (?, ?, ?, ?, ?)';
app.post('/account', async (req, res) => {
    if (!(req.body.username && req.body.password && req.body.firstName && req.body.lastName && req.body.email)) {
        return res.status(400).send();
    }
    let password, conn;
    try {
        [password, conn] = await Promise.all([bcrypt.hash(req.body.password, 10), pool.getConnection()]);
    } catch(e) {
        console.log(e);
        if (conn) {
            conn.release();
        }
        return res.status(500).send();
    }
    let result;
    try {
        result = await conn.query(REGISTER_SQL,
            [req.body.username, password, req.body.firstName, req.body.lastName, req.body.email]);
    } catch(e) {
        conn.release();
        if (e.errno === 1062) {
            return res.status(409).send();
        } else {
            console.log(e);
            return res.status(500).send();
        }
    }
    conn.release();
    sendToken(res, result.insertId);
});

const LOGIN_SQL = 'select id, password from users where username = ?'
app.post('/login', async (req, res) => {
    if (!(req.body.username && req.body.password)) {
        return res.status(400).send();
    }
    let conn, rows;
    try {
        conn = await pool.getConnection();
        rows = await conn.query(LOGIN_SQL, [req.body.username]);
        conn.release();
    } catch(e) {
        console.log(e);
        if (conn) {
            conn.release();
        }
        return res.status(500).send();
    }
    if (rows.length > 0 && await bcrypt.compare(req.body.password, rows[0].password.toString())) {
        sendToken(res, rows[0].id);
    } else {
        res.status(401).send();
    }
});

const PROFILE_SQL = 'select first_name, last_name, email from users where id = ?'
app.get('/account', async (req, res) => {
    if (!(req.headers.authorization)) {
        return res.status(400).send();
    }
    const token = jwt.verify(req.headers.authorization, config.jwtSecret);
    let conn, rows;
    try {
        conn = await pool.getConnection();
        rows = await conn.query(PROFILE_SQL, [token.id]);
        conn.release();
    } catch(e) {
        console.log(e);
        if (conn) {
            conn.release();
        }
        return res.status(500).send();
    }
    if (rows.length === 0) {
        return res.status(404).send();
    }
    res.send({
        firstName: rows[0].first_name,
        lastName: rows[0].last_name,
        email: rows[0].email
    });
});

app.listen(config.port, () => console.log(`Listening on port ${config.port}`));
