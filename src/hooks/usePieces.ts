import {PieceType} from "@/stores/game";

export const usePieces = (board?: number[]) => {
    let max = 0;
    board?.forEach(v => max = Math.max(max, Math.abs(v)))
    return board ? board.reduce((result: PieceType[], piece: number, index: number) => {
        if (piece === 0) {
            return result;
        }
        const rowIndex = Math.floor(index / 19);
        const colIndex = index % 19;
        result.push({
            rowIndex: rowIndex,
            colIndex: colIndex,
            num: piece,
            isLast: Math.abs(piece) === max
        });
        return result;
    }, [] as PieceType[]) : [] as PieceType[];
}
