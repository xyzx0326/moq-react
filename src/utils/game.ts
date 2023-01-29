import {Rule} from "@/config/rules";

export interface Step {
    num: number;
    rowIndex: number;
    colIndex: number;
}

export interface AiNextStep extends Step {
    score: number;
}

export class GameUtils {
    /**
     * 机器人走棋
     * @param board 棋盘
     * @param stepIsWhite 步骤是否是白棋
     * @param selfIsWhite 自己是否是白棋
     * @returns
     */
    static aiNextStep(
        board: number[],
        stepIsWhite: boolean,
        selfIsWhite: boolean,
        rule: Rule,
    ) {
    }

    /**
     * 检查局面是否结束，即反方没有可移动的棋子
     * @param board 棋盘
     * @param current 当前步index
     * @returns
     */
    static checkGameOver(board: number[], current: number) {
        return this.isFive(board, current);
    }

    static isFive(board: number[], current: number) {
        const rowIndex = Math.floor(current / 19);
        const colIndex = current % 19;
        const stepIsWhite = board[current] > 0;

        // 横+, 横-, 竖+, 竖-, 横+竖+, 横-竖-, 横+竖-, 横-竖+
        const direction = [
            {
                flag: true,
                condition: (i: number) => colIndex + i < 19,
                boardIndex: (i: number) => current + i
            },
            {
                flag: true,
                condition: (i: number) => colIndex - i >= 0,
                boardIndex: (i: number) => current - i
            },
            {
                flag: true,
                condition: (i: number) => rowIndex + i < 19,
                boardIndex: (i: number) => current + i * 19
            },
            {
                flag: true,
                condition: (i: number) => rowIndex - i >= 0,
                boardIndex: (i: number) => current - i * 19
            },
            {
                flag: true,
                condition: (i: number) => colIndex + i < 19 && rowIndex + i < 19,
                boardIndex: (i: number) => current + i * 20
            },
            {
                flag: true,
                condition: (i: number) => colIndex - i >= 0 && rowIndex - i >= 0,
                boardIndex: (i: number) => current - i * 20
            },
            {
                flag: true,
                condition: (i: number) => colIndex - i >= 0 && rowIndex + i < 19,
                boardIndex: (i: number) => current + i * 18
            },
            {
                flag: true,
                condition: (i: number) => colIndex + i < 19 && rowIndex - i >= 0,
                boardIndex: (i: number) => current - i * 18
            },
        ]
        // 横, 竖, 横+竖+, 横+竖-
        const count = [1, 1, 1, 1]

        function handle(index: number, flagIndex: number) {
            if (!board[index]) {
                direction[flagIndex].flag = false;
                return
            }
            const countIndex = Math.floor(flagIndex / 2);
            if ((board[index] > 0) !== stepIsWhite) {
                direction[flagIndex].flag = false;
            } else {
                count[countIndex] = count[countIndex] + 1
            }
        }

        for (let i = 1; i < 5; i++) {
            for (let j = 0; j < direction.length; j++) {
                const one = direction[j];
                if (one.flag && one.condition(i)) {
                    handle(one.boardIndex(i), j);
                    const countIndex = Math.floor(j / 2);
                    if (count[countIndex] >= 5) {
                        return true
                    }
                }
            }
        }

        return false;
    }
}
