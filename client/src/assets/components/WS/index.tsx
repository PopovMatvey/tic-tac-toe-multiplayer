import React, { useEffect, useState } from "react";
import io from 'socket.io-client';
import "./css/style.css";

// const socket = io('<wss://localhost:2000>');

export function WS() {
    const socket = io('ws://localhost:2000');

    // socket.on('message', text => {

    //     const el = document.createElement('li');
    //     el.innerHTML = text;
    //     document.querySelector('ul').appendChild(el);

    // });

    // document.querySelector('button').onclick = () => {

    //     const text = document.querySelector('input').value;
    //     socket.emit('message', text)
    const [inputValue, setInputValue] = useState('');
    const [textWS, setTextWS] = useState('');
    const [arrayWS, setArray] = useState([""]);
    

    socket.on('message', (text: any) => {
        let oldWorld = text;

        console.log(oldWorld === text)
        if(oldWorld == text){
            return;
        }

        const el = document.createElement('li');
        const list = document.querySelector('ws-container ul');

        if ((el != null) && (list != null)) {
            el.innerHTML = text;
            list.appendChild(el);
        }

        let returnedArray = arrayWS;
        let value = String(text);

        returnedArray.push(value);

        setArray(returnedArray);
        console.log(value)
    });

    const handlerButton = () => {
        socket.emit('message', inputValue)
    }

    const handlerInput = (event: any) => {
        setInputValue(event.target.value);
    }

    return (
        <>
            <div className="ws-container">
                <ul>
                    {
                        arrayWS.map((item:any,index:number)=>(
                            <li key={index}>{item}</li>
                        ))
                    }
                </ul>
                <input type="text" placeholder="message" value={inputValue} onChange={handlerInput} />
                <button onClick={handlerButton}>Send</button>
            </div>
        </>
    )
}
