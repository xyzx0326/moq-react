import {defaultRule} from "@/config/rules";
import {Home, Play} from '@/pages';
import {store} from "@/stores";
import {blackJson, updateRule, whiteJson} from "@/stores/game";
import {CACHE_RULE_KEY, CacheUtils} from "@/utils";

import {configClient} from '@illuxiza/one-client'

import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import '@illuxiza/one-client-react/index.scss';


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
