import {Board, Piece} from "@/components";
import {BoardSizeType} from "@/config/board";
import {GameFrameData, GridData, PieceType} from "@/stores/game";

import React, {forwardRef} from 'react';
import {Group, Layer, Stage} from "react-konva";

type GameProps = {
    gameInfo: GameFrameData
    pieces: PieceType[]; // 棋子数据
    boardSize: BoardSizeType; // 棋盘规格
    freeCount?: number;
    showPrediction?: boolean;

    onGridSelect?: (data: GridData) => void;
}

const Game: React.FC<GameProps> = forwardRef((props, ref: any) => {
    const {
        pieces, gameInfo, boardSize, onGridSelect, freeCount,showPrediction
    } = props;
    const {board, boardGrid, boardEdge, pieceRadius} = boardSize

    return (
        <Stage width={board} height={board}>
            <Layer ref={ref}>
                <Board boardSize={boardSize} gameInfo={gameInfo} onGridSelect={onGridSelect} freeCount={freeCount} showPrediction={showPrediction}/>
                <Group x={boardEdge} y={boardEdge}>
                    {pieces.map(piece => {
                        return <Piece key={piece.num}
                                      num={piece.num}
                                      rowIndex={piece.rowIndex}
                                      colIndex={piece.colIndex}
                                      boardGrid={boardGrid}
                                      radius={pieceRadius}
                                      isEnd={gameInfo.gameIsEnd}
                                      isLast={piece.isLast}
                        />;
                    })}
                </Group>
            </Layer>
        </Stage>
    );
})

export default Game;
