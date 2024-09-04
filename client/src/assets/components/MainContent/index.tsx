import React from "react";
import "./css/style.css";
import { Route, Routes } from 'react-router-dom';
import { PackageSenderUDP } from "../PackageSenderUDP";
import { Authorization } from "../Authorization";
import { Login } from "../Login";
import { Game } from "../Game";
import { WS } from "../WS";
// import { Slider } from '../Slider';

export function MainContent() {
    return (
        <>
            <div className="main-content-container">
                
                <Routes>
                    <Route path={"/"} element={<Game/>}></Route>
                    <Route path={"/auth"} element={<Authorization/>}></Route>
                    <Route path={"/login"} element={<Login/>}></Route>
                    <Route path={"/ws"} element={<WS/>}></Route>


                    {
                    /* <Route path={"/player"} element={<Player />}></Route>
                <Route path={"/scanner"} element={<ScannerQR />}></Route> */
                }
                </Routes>
            </div>
        </>
    )
}