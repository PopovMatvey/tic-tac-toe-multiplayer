'use strict'

/*Libs*/
const cors = require('cors')                                // Позволяет использовать api requests/response
const express = require('express');                         // Для работы с API
const path = require('path');                               // Для определения статической директории
const sqlite3 = require('sqlite3').verbose();               // lib data base sqlite
const app = express();

app.use(express.json());
app.use(cors());


/*Переменные*/
const PORT_APP = 2001;                                              // Порт приложения
const urlRequest = '/api/tic-tac-toe';                    // Исходный url приложения

let scoreObj = {
    scoreX: 0,
    scoreO: 0,
}

// /*SQL*/
// const dataBaseObject = new sqlite3.Database('./DataBase.db', sqlite3.OPEN_READWRITE, (err) => {
//     if (err) return console.log(err);
// });

// // Таблица "Пользователи"
// let sqlCreateUser = `
// CREATE TABLE user (
//     id_user INTEGER PRIMARY KEY,
//     name_user VARCHAR,
//     password_user VARCHAR,
//   )`;

// dataBaseObject.run(sqlCreateUser);

// let sqlInserteUser = `
// INSERT INTO user (
//     id_user,
//     name_user,
//     password_user
//     )  VALUES(?,?,?)`;


// dataBaseObject.run(
//     sqlInserteUser,
//     [
//         0,
//         "User62",
//         "12345678"
//     ],
//     (error) => { if (error) { console.log(error); } }
// );

// let sqlSelectUsers = 'SELECT * FROM user';
// let responseArrayUsers = [];


// dataBaseObject.all(sqlSelectUsers, [], (error, rows) => {
//     if (error) {
//         return console.log(err.message);
//     }

//     rows.forEach((row) => {
//         responseArrayUsers.push(row);
//     })
// })

/*Запросы HTTP*/
//GET
app.get(`${urlRequest}/score`, (_request, response) => {
    // console.log(scoreObj)
    response.status(200).json(scoreObj);
});

// app.get(`${urlRequest}/ip_address`, (_request, response) => {
//     response.status(200).json(udpSoketObject.getIPAddr());
// });

// app.get(`${urlRequest}/timely_buffer`, (_request, response) => {
//     response.status(200).json(timelyUDPBuffer);
// });

// POST
app.post(`${urlRequest}/score`, (request, response) => {
    scoreObj.scoreO = request.body.scoreO;
    scoreObj.scoreX = request.body.scoreX;

    response.status(201).json(scoreObj);
});

// app.post(`${urlRequest}/ip_address`, (request, response) => {
//     udpSoketObject.setIPAddr(request.body.ip_address);
//     response.status(201).json("Текущий ip-адрес: " + udpSoketObject.getIPAddr());
// });


/*Директория*/
// Инициализация статики
app.use(express.static(path.resolve(__dirname, 'client')));
app.use(express.static(path.resolve(__dirname, '.static')));

// Прослушивание дефолтного GET-запроса
app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, "client", 'index.html'))
});

// Сообщение по-умолчанию
app.listen(PORT_APP, () => console.log(`Сервер был запущен на порту: ${PORT_APP}`));

// server-side
// io.on("connection", (socket) => {
//     console.log(socket.id); // x8WIv7-mJelg7on_ALbx
// });

// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 3000 });

// wss.on('connection', function connection(ws) {
//   console.log('Соединение установлено');

//   ws.on('message', function incoming(message) {
//     console.log(`Получено сообщение: ${message}`);
//   });

//   ws.on('close', function close() {
//     console.log('Соединение закрыто');
//   });
// });

// const http = require('http').createServer();

// const io = require('socket.io')(http, {
//     cors: { origin: "*" }
// });

// io.on('connection', (socket) => {
//     console.log('a user connected');

//     socket.on('message', (message) =>     {
//         console.log(message);
//         io.emit("message",message)
//     });
// });

// http.listen(2000, () => console.log('listening on http://localhost:2000') );
