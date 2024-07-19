'use strict'

let dgram = require('dgram');

/**
 * 
 */
class HandlerUDP {

    /**
     * 
     * @param {*} parDestanationIP 
     */
    constructor(parDestanationIP) {
        this.PORT_CLIENT = 443;
        this.HOST_CLIENT = parDestanationIP;
        this.currentSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    }

    /**
     * 
     * @param {*} parPackageArray 
     */
    sendUDP_Request(parPackageArray) {
        let message = new Buffer.from(parPackageArray);

        this.currentSocket.send(message, 0, message.length, this.PORT_CLIENT, this.HOST_CLIENT, function (err) {
            if (err) throw err;

            console.log("Сообщение отправлено: (Буфер)", message);
        });
    }

    /**
     * 
     */
    getUDP_Response() {
        this.currentSocket.on('message', (parPackage) => {
            let returnedArrayNumber = [];
            let returnedArrayString = [];

            for (let i = 0; i < parPackage.length; i++) {
                returnedArrayNumber.push(parseInt(parPackage[i].toString(16), 16));
                returnedArrayString.push(parPackage[i].toString(16));
            }

            console.log("Полученное сообщение: (Буфер)", parPackage);
        });
    }
}

// let PORT_CLIENT = 443;
// let HOST_CLIENT = '192.168.1.0';

// // let packetA1 = [0x01, 0x00, 0x08, 0x00, 0xA1, 0x00, 0x00, 0x00, 0x01, 0x00];

// let client = dgram.createSocket({ type: 'udp4', reuseAddr: true });



// function sendUDP_Request(parPacketMass, parHOST_CLIENT) {
//     let message = new Buffer.from(parPacketMass);

//     client.send(message, 0, message.length, PORT_CLIENT, parHOST_CLIENT, function (err, bytes) {
//         if (err) throw err;
//         console.log('UDP message sent to ' + parHOST_CLIENT + ':' + PORT_CLIENT);

//         console.log("Сообщение отправлено: (Буфер)", message);
//         console.log("Сообщение отправлено: (Массив)", parPacketMass);
//     });
// }


// function getUDP_Response(){
//     client.on('message', (msg, rinfo) => {
//         let returnedArrayNumber = [];
//         let returnedArrayString = [];

//         for (let i = 0; i < msg.length; i++) {
//             // console.log(i + " Элемент :" + parseInt(msg[i].toString(16),16));
//             // console.log(msg[i].toString(16))
//             returnedArrayNumber.push(parseInt(msg[i].toString(16), 16));
//             returnedArrayString.push(msg[i].toString(16));
//         }

//         console.log("Полученное сообщение: (Буфер)", msg);
//         console.log("Полученное сообщение: (Массив чисел)", returnedArrayNumber);
//         console.log("Полученное сообщение: (Массив строк)", returnedArrayString);
//         // console.log(toHex(msg))
//         // console.log(
//         //     `server got: ${msg} from ${rinfo.address}:${rinfo.port}`
//         // );
//     });
// }

// sendUDP_Request(packetMass, HOST_CLIENT);
// getUDP_Response();

let parDestanationIP = '192.168.1.0';
let packageArray = [0x0f, 0x00, 0x82, 0x00, 0x00, 0x01, 0x02, 0xFF, 0xFF, 0xFF, 0xFF, 0x77, 0x77, 0x77, 0x77];
let udpObject = new HandlerUDP(parDestanationIP);

udpObject.sendUDP_Request(packageArray);
udpObject.getUDP_Response();

module.exports = {HandlerUDP}




// //DELETE
// app.delete(`${urlRequest}/:id`, (req, res) => {
//     CONTACTS = CONTACTS.filter(c =>
//         c.id != req.params.id
//     );
//     res.status(200).json({ message: "Контакт был удалён" });
// });

// //PUT
// app.put(`${urlRequest}/:id`, (req, res) => {
//     const idx = CONTACTS.findIndex(c => c.id === req.params.id);
//     CONTACTS[idx] = req.body;
//     res.json(CONTACTS[idx]);
// });

//POST
// app.post(`/send`, (_req, res) => {
//     // const idx = CONTACTS.findIndex(c => c.id === req.params.id);
//     // CONTACTS[idx] = req.body;
//     // res.json(packageArray);
//     udpSoketObject.sendUDP_Request(packageArray);
//     udpSoketObject.getUDP_Response();
//     res.status(201).json("accessfull");
// });\

// 'use strict'

// let dgram = require('dgram');

// let PORT_CLIENT = 443;
// let HOST_CLIENT = '192.168.1.0';

// let packetMass = [0x0f, 0x00, 0x82, 0x00, 0x00, 0x01, 0x02, 0xFF, 0xFF, 0xFF, 0xFF, 0x77, 0x77, 0x77, 0x77];
// // let packetA1 = [0x01, 0x00, 0x08, 0x00, 0xA1, 0x00, 0x00, 0x00, 0x01, 0x00];

// let client = dgram.createSocket({ type: 'udp4', reuseAddr: true });



// function sendUDP_Request(parPacketMass, parHOST_CLIENT) {
//     let message = new Buffer.from(parPacketMass);

//     client.send(message, 0, message.length, PORT_CLIENT, parHOST_CLIENT, function (err, bytes) {
//         if (err) throw err;
//         console.log('UDP message sent to ' + parHOST_CLIENT + ':' + PORT_CLIENT);

//         console.log("Сообщение отправлено: (Буфер)", message);
//         console.log("Сообщение отправлено: (Массив)", parPacketMass);
//     });
// }


// function getUDP_Response(){
//     client.on('message', (msg, rinfo) => {
//         let returnedArrayNumber = [];
//         let returnedArrayString = [];

//         for (let i = 0; i < msg.length; i++) {
//             // console.log(i + " Элемент :" + parseInt(msg[i].toString(16),16));
//             // console.log(msg[i].toString(16))
//             returnedArrayNumber.push(parseInt(msg[i].toString(16), 16));
//             returnedArrayString.push(msg[i].toString(16));
//         }

//         console.log("Полученное сообщение: (Буфер)", msg);
//         console.log("Полученное сообщение: (Массив чисел)", returnedArrayNumber);
//         console.log("Полученное сообщение: (Массив строк)", returnedArrayString);
//         // console.log(toHex(msg))
//         // console.log(
//         //     `server got: ${msg} from ${rinfo.address}:${rinfo.port}`
//         // );
//     });
// }

// sendUDP_Request(packetMass, HOST_CLIENT);
// getUDP_Response();
