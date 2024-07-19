import React from "react";
import "./css/style.css";
import { Route, Routes } from 'react-router-dom';
import { PackageSenderUDP } from "../PackageSenderUDP";
// import { Slider } from '../Slider';

export function MainContent() {
    return (
        <>
            <div className="main-content-container">
                
                <Routes>
                    <Route path={"/"} element={<PackageSenderUDP/>}></Route>
                    {/* <Route path={"/player"} element={<Player />}></Route>
                <Route path={"/scanner"} element={<ScannerQR />}></Route> */}
                </Routes>
            </div>
        </>
    )
}