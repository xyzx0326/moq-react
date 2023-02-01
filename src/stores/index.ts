import game from "@/stores/game";
import {historyStore} from "@illuxiza/one-client-react";

import {configureStore} from '@reduxjs/toolkit'

export const store = configureStore({
    reducer: {
        game: historyStore(game),
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
