import React from "react";
import './css/style.css';

/**
 * Информация шапки
 * @returns компонент "Информация шапки"
 */
export function HeaderInformation() {

    return (
        <div className="header-information">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <h1>Крестики-нолики Мультиплеер</h1>
        </div>
    );
}
