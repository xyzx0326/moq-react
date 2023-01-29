
const basic = Math.min(window.innerWidth, window.innerHeight, 640) - 20;

export const boardSize = {
    board: basic,
    boardEdge: basic * 0.035,
    boardGrid: basic * 0.05166667,
    pieceRadius: basic * 0.022
}

export const boardScale = (scale = 1) => {
    return {
        board: boardSize.board * scale,
        boardGrid: boardSize.boardGrid * scale,
        boardEdge: boardSize.boardEdge * scale,
        pieceRadius: boardSize.pieceRadius * scale
    }

}

export type BoardSizeType = typeof boardSize

export const getIndexByBoard = (data: number) => {
    return Math.min(14, Math.max(0, Math.round((data - boardSize.boardEdge) / boardSize.boardGrid)));
}
