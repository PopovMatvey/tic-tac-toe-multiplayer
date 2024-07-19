'use strict'

/*Libs*/
const cors = require('cors')                                // Позволяет использовать api requests/response
const express = require('express');                         // Для работы с API
const path = require('path');                               // Для определения статической директории
let dgram = require('dgram');                               // датаграмма UDP

const app = express();

app.use(express.json());
app.use(cors());

/**-- Классы --**/
/**
 * Обработчик UDP
 */
class HandlerUDP {
    /**
     * Обработчик UDP
     * @param {*} parDestanationIP 
     */
    constructor() {
        const defaultIPAddr = '192.168.1.0';
        this.PORT_CLIENT = 443;
        this.HOST_CLIENT = defaultIPAddr;
        this.currentSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.lastExchangeData = {};
        this.lastResponsePackage = new Buffer.from([]);
    }

    /**
     * Записать IP-адрес получателя
     * @param {number} parIPAddr - IP-адрес получателя
     */
    setIPAddr(parIPAddr) {
        if (parIPAddr == undefined) {
            return this.defaultIPAddr;
        }

        this.HOST_CLIENT = parIPAddr;
    }

    /**
     * Получить IP-адрес
     * @returns IP-адрес
     */
    getIPAddr() {
        return this.HOST_CLIENT;
    }

    /**
     * Отправить UDP запрос
     * @param {*} parPackageArray - отправляемые байты
     */
    sendUDP_Request(parPackageArray) {
        let message = new Buffer.from(parPackageArray);

        this.currentSocket.send(message, 0, message.length, this.PORT_CLIENT, this.HOST_CLIENT, function (err) {
            if (err) throw err;

            console.log("Сообщение отправлено: (Буфер)", message);
        });
    }

    /**
     * Получить UDP ответ
     * @param {*} parPackageArray - отправляемые байты
     */
    getUDP_Response(parPackageArray) {
        let returnedArrayNumber = [];
        let returnedArrayString = [];
        let flagResponse = false;

        this.currentSocket.on('message', (parPackage) => {
            for (let i = 0; i < parPackage.length; i++) {
                returnedArrayNumber.push(this.getDecValue(parPackage[i]));
                returnedArrayString.push(this.getHexValue(parPackage[i]));
            }

            flagResponse = true;
            this.lastResponsePackage = new Buffer.from(parPackage);
        });

        setTimeout(() => {
            if (flagResponse) {
                console.log("Полученное сообщение: (Буфер)", this.lastResponsePackage);

                flagResponse = false;
            } else {
                console.log("Сообщение не было получено, вероятно устройство недоступно");
            }
        }, 500);

        this.getResultExchange(returnedArrayNumber, returnedArrayString, parPackageArray);
    }

    /**
     * Получить десятичное число
     * @param {*} parValue - исходное число
     * @returns Десятичное число
     */
    getDecValue(parValue) {
        return parseInt(parValue.toString(16), 16)
    }

    /**
     * Получить последние данные обмена
     * @returns Последние данные обмена
     */
    getLastExchangeData() {
        return this.lastExchangeData;
    }

    /**
     * Получить hex
     * @param {*} parValue - исходное значение
     * @returns значение hex
     */
    getHexValue(parValue) {
        let resultString = '';
        let proccesValue = parValue.toString(16);

        if (proccesValue.length == 1) {
            return resultString.concat('0x0', proccesValue);
        }

        if (proccesValue.length == 2) {
            return resultString.concat('0x', proccesValue);
        }

        return undefined;
    }

    /**
     * Получить результат обмена
     * @param {*} parResultExchangeNumber - результат обмена (Массив десятичных чисел)
     * @param {*} parResultExchangeHex - результат обмена (Массив строк "значения в виде hex")
     * @param {*} parPackageArray - отправляемые байты
     * @returns Результат обмена (объект из: времени,ip,полученного пакета)
     */
    getResultExchange(parResultExchangeNumber, parResultExchangeHex, parPackageArray) {
        const currentTime = Date(Date.now());

        this.lastExchangeData = {
            time: Date(currentTime).toLocaleString(),
            idDestanation: this.HOST_CLIENT,
            sendExchangeData: parPackageArray,
            sendExchangeHexData: this.getSendExchangeHexData(parPackageArray),
            resultExchangeNumber: parResultExchangeNumber,
            resultExchangeHex: parResultExchangeHex,
        }
    }

    /**
     * Получить данные обмена в виде hex
     * @param {*} parArray исходный массив
     * @returns Массив обмена в виде hex
     */
    getSendExchangeHexData(parArray) {
        let returnedArray = [];

        for (let i = 0; i < parArray.length; i++) {
            returnedArray.push(
                this.getHexValue(
                    parArray[i].toString(16)
                )
            );
        }

        return returnedArray;
    }

    /**
     * Запустить обмен
     * @param {*} parPackageArray - отпралвенные байты в сокет UDP
     */
    runExchangeUDP(parPackageArray) {
        this.sendUDP_Request(parPackageArray);
        this.getUDP_Response(parPackageArray);
    }
}

/*Переменные*/
const PORT_APP = 2002;                                              // Порт приложения
const urlRequest = '/api/check_tech_conditions';                    // Исходный url приложения
let udpSoketObject = new HandlerUDP();                              // UDP сокет приложения
let timelyUDPBuffer = [];                                           // Временный буфер UDP
const successGetRequestMessage = "GET-запрос выполнен успешно";
const successPostRequestMessage = "POST-запрос выполнен успешно";

/*Запросы HTTP*/
//GET
app.get(urlRequest, (_request, response) => {
    response.status(200).json(successGetRequestMessage);
});

app.get(`${urlRequest}/ip_address`, (_request, response) => {
    response.status(200).json(udpSoketObject.getIPAddr());
});

app.get(`${urlRequest}/timely_buffer`, (_request, response) => {
    response.status(200).json(timelyUDPBuffer);
});

// POST
app.post(`${urlRequest}/send_udp_package`, (request, response) => {
    udpSoketObject.runExchangeUDP(request.body.sendPackage);
    timelyUDPBuffer.push(udpSoketObject.lastExchangeData);
    response.status(201).json(successPostRequestMessage);
});

app.post(`${urlRequest}/ip_address`, (request, response) => {
    udpSoketObject.setIPAddr(request.body.ip_address);
    response.status(201).json("Текущий ip-адрес: " + udpSoketObject.getIPAddr());
});

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


