import {GridData} from "@/stores/game";

function getUseGrid(getWeight: Function) {
    return (board: number[], selfIsWhite: boolean): DirectionData[] => {
        const ret: DirectionData[] = [];
        const tmp: boolean[][] = [[], [], [], []];
        for (let i = 0; i < board.length; i++) {
            if (board[i] == null) {
                continue;
            }
            const colIndex = i % 19;
            const rowIndex = Math.floor(i / 19);
            const current = i;
            const direction = [
                {
                    condition: (i: number) => colIndex + i < 19,
                    boardIndex: (i: number) => current + i
                },
                {
                    condition: (i: number) => rowIndex + i < 19,
                    boardIndex: (i: number) => current + i * 19
                },
                {
                    condition: (i: number) => colIndex + i < 19 && rowIndex + i < 19,
                    boardIndex: (i: number) => current + i * 20
                },
                {
                    condition: (i: number) => colIndex - i >= 0 && rowIndex + i < 19,
                    boardIndex: (i: number) => current + i * 18
                },
            ]
            for (let j = 0; j < direction.length; j++) {
                let sum = 0;
                let k = 0;
                const d = direction[j];
                if (tmp[j][current]) {
                    continue;
                }
                let index = 0;
                while (d.condition(k)) {
                    index = d.boardIndex(k);
                    if (board[index]) {
                        sum += getWeight(board, index)
                        tmp[j][index] = true;
                    }
                    k++;
                }
                sum = Math.round(sum);
                if ((sum % 2 == 1 && !selfIsWhite) || (sum % 2 == 0 && selfIsWhite)) {
                    const colIndex = index % 19;
                    const rowIndex = Math.floor(index / 19);
                    ret.push({rowIndex, colIndex, direction: j})
                }
            }
        }
        return ret;
    };
}

export const rules = {
    // "0.1": {
    //     title: "??????0.1",
    //     useGrid: (board: number[], selfIsWhite: boolean): DirectionData[] => {
    //         return [];
    //     }
    // },
    "0.2": {
        title: "??????0.2",
        desc: "?????????2???,???1???2",
        freeCount: 2,
        start: 1,
        winCount: [5, 5, 5, 5],
        useGrid: getUseGrid((board: number[], index: number) => {
            return board[index] < 0 ? 1 : 2;
        })
    },
    "0.25": {
        title: "??????0.25",
        desc: "?????????2???,????????????,????????????,????????????,????????????",
        freeCount: 2,
        start: 1,
        winCount: [5, 5, 5, 5],
        useGrid: getUseGrid((board: number[], index: number) => {
            return board[index] < 0 ? 1 : 1.5;
        })
    },
    // "0.3": {
    //     title: "??????0.3",
    //     useGrid: getUseGrid(() => {
    //         return 1;
    //     })
    // }
    "0.4": {
        title: "??????0.4",
        desc: "?????????3???,???1???2",
        freeCount: 4,
        start: 1,
        winCount: [5, 5, 5, 5],
        useGrid: getUseGrid((board: number[], index: number) => {
            return board[index] < 0 ? 1 : 2;
        })
    },
    "0.5": {
        title: "??????0.5",
        desc: "?????????2???,???1???2,???6???5",
        freeCount: 2,
        start: 2,
        winCount: [6, 6, 5, 5],
        useGrid: getUseGrid((board: number[], index: number) => {
            return board[index] < 0 ? 1 : 2;
        })
    },
};

export type DirectionData = { direction: number } & GridData;

export const defaultRule = "0.2";


export default rules;
export type RuleKey = keyof typeof rules;

export type Rule = typeof defaultRule
