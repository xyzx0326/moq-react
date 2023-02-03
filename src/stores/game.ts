import {defaultRule, DirectionData, RuleKey, rules} from "@/config/rules";
import {CACHE_RULE_KEY, CacheUtils, GameUtils} from "@/utils";
import {createSlice} from '@reduxjs/toolkit'

export type PieceType = {
    rowIndex: number;
    colIndex: number;
    num: number;
    isLast: boolean;
};

export type GridData = { rowIndex: number; colIndex: number; ai?: boolean };

export type GameFrameData = {
    steps: number; // 步数
    board: number[]; // 棋盘
    selfIsWhite?: boolean; // 自己是白方
    stepIsWhite?: boolean;// 轮到白方走棋
    onlyOnePieceStep?: number;// 某方只剩一个棋子，大于0表示白方，小于0表示黑方，绝对值表示步数
    gameIsEnd?: boolean;// 游戏是否结束
    selectGrid: GridData | undefined,
    useGrid: DirectionData[],
    rule: RuleKey
};

const cacheRule = CacheUtils.getItem(CACHE_RULE_KEY, defaultRule);

const initialState = {
    steps: 0,
    // board: new Array(225),
    board: [],
    selfIsWhite: false,
    stepIsWhite: false,
    gameIsEnd: false,
    useGrid: [],

    otherSideOnline: false,
    selectGrid: undefined,
    rule: cacheRule, //规则
} as GameFrameData


export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        /**
         * 重开游戏
         */
        restart(state) {
            state.gameIsEnd = false;
            if (rules[state.rule].start == 2) {
                state.stepIsWhite = true;
            } else {
                state.stepIsWhite = false;
            }
            state.selectGrid = undefined;
            state.steps = 0;
            state.board = []
            state.useGrid = [];
        },

        changeSelfColor(state) {
            state.selfIsWhite = !state.selfIsWhite;
        },

        updateSelfColor(state, {payload}) {
            state.selfIsWhite = payload;
        },

        handleSelectGrid(state, {payload}) {
            const colIndex = payload.colIndex;
            const rowIndex = payload.rowIndex;
            const ai = payload.ai;
            const index = rowIndex * 19 + colIndex;

            // 如果此格没有棋子，则可以选择
            if (!state.board[index]) {
                const b = state.selectGrid && state.selectGrid.rowIndex === payload.rowIndex && state.selectGrid.colIndex === payload.colIndex;
                if (b || ai) {
                    state.steps++;
                    state.board[index] = state.stepIsWhite ? state.steps : -state.steps;
                    const isEnd = GameUtils.checkGameOver(state.board, index, state.rule);
                    // const isEnd = false;
                    // console.log(isEnd)
                    if (isEnd) {
                        state.gameIsEnd = true;
                    } else {
                        state.stepIsWhite = !state.stepIsWhite;
                        const useGrid = rules[state.rule].useGrid(state.board, state.stepIsWhite!);
                        state.useGrid = useGrid;
                        // console.log(useGrid)
                    }
                    state.selectGrid = undefined;
                } else {
                    state.selectGrid = payload;
                }
            }
        },

        updateRule(state, {payload}) {
            state.rule = payload
            CacheUtils.setItem(CACHE_RULE_KEY, state.rule)
            state.gameIsEnd = false;
            if (rules[state.rule].start == 2) {
                state.stepIsWhite = true;
            } else {
                state.stepIsWhite = false;
            }
            state.selectGrid = undefined;
            state.steps = 0;
            state.board = []
            state.useGrid = [];
        },

    },
})

export const {
    restart,
    changeSelfColor,
    handleSelectGrid,
    updateRule,
    updateSelfColor,
} = gameSlice.actions

export default gameSlice.reducer

export const blackJson = JSON.stringify(updateSelfColor(false));

export const whiteJson = JSON.stringify(updateSelfColor(true));
