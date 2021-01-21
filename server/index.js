const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgress Client Setup
const { Pool } = require("pg");
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('connect', () => {
    pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
        .catch((err) => console.log(err));
});

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get("/", (request, response) => {
    response.send("Hi");
});

app.get("/values/all", async (request, response) => {
    const values = await pgClient.query('SELECT * from values;');
    response.send(values.rows);
});

app.get("/values/current", async (request, response) => {
    redisClient.hgetall('values', (err, values) => {
        response.send(values);
    })
});

app.post("/values", async (request, response) => {
    const index = request.body.index;
    if (parseInt(index) > 40) {
        return response.status(422).send("Index too high.");
    }

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);
    response.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening on port 5000...');
});