'use strict'

/*Libs*/
const cors = require('cors')                                // Позволяет использовать api requests/response
const express = require('express');                         // Для работы с API
const path = require('path');                               // Для определения статической директории
const { io } = require("socket.io-client");
const app = express();

app.use(express.json());
app.use(cors());


/*Переменные*/
const PORT_APP = 2002;                                              // Порт приложения
const urlRequest = '/api/tic-tac-toe';                    // Исходный url приложения

/*Запросы HTTP*/
//GET
// app.get(urlRequest, (_request, response) => {
//     response.status(200).json(successGetRequestMessage);
// });

// app.get(`${urlRequest}/ip_address`, (_request, response) => {
//     response.status(200).json(udpSoketObject.getIPAddr());
// });

// app.get(`${urlRequest}/timely_buffer`, (_request, response) => {
//     response.status(200).json(timelyUDPBuffer);
// });

// // POST
// app.post(`${urlRequest}/send_udp_package`, (request, response) => {
//     udpSoketObject.runExchangeUDP(request.body.sendPackage);
//     timelyUDPBuffer.push(udpSoketObject.lastExchangeData);
//     response.status(201).json(successPostRequestMessage);
// });

// app.post(`${urlRequest}/ip_address`, (request, response) => {
//     udpSoketObject.setIPAddr(request.body.ip_address);
//     response.status(201).json("Текущий ip-адрес: " + udpSoketObject.getIPAddr());
// });


const socket = io("http://localhost:2002");

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

// client-side
socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
    console.log(socket.id); // undefined
});


