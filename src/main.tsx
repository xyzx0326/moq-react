import {Home, Play} from '@/pages';
import {store} from "@/stores";

import '@illuxiza/one-client-react/index.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";


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
