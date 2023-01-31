import {Home, Play} from '@/pages';
import {store} from "@/stores";
import {blackJson, whiteJson} from "@/stores/game";

import {configClient} from '@illuxiza/one-client'

import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import './index.scss';

// const url = "10.21.124.52:8888";
const url = "game.congeer.com";
configClient("ws://" + url + "/game-tmp/ws", {
    maxPlayer: 2,
    baseConfig: [],
    debug: false,
    playerConfig: [[blackJson], [whiteJson]],
    onConfig: store.dispatch,
    onFrame: store.dispatch
}, "moq")

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(<Provider store={store}>
        <BrowserRouter basename="/moq">
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/play/:mode" element={<Play/>}/>
                <Route path="/play/:mode/:roomId" element={<Play/>}/>
            </Routes>
        </BrowserRouter>
    </Provider>
);
