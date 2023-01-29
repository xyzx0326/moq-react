import {Board, Piece} from "@/components";
import {BoardSizeType} from "@/config/board";
import {DirectionData} from "@/config/rules";
import {GridData, PieceType} from "@/stores/game";

import React from 'react';
import {Layer, Stage} from "react-konva";

type GameProps = {
    pieces: PieceType[]; // 棋子数据
    selectGrid?: GridData; // 选择的棋子
    selfIsWhite?: boolean;
    gameIsEnd?: boolean;
    boardSize: BoardSizeType; // 棋盘规格
    steps: number | undefined;
    useGrid: DirectionData[] | undefined;

    onGridSelect?: (data: GridData) => void;
}

const Game: React.FC<GameProps> = ({
                                       pieces, selectGrid, selfIsWhite,
                                       gameIsEnd, boardSize, onGridSelect,
                                       steps, useGrid
                                   }) => {
    const {board, boardGrid, boardEdge, pieceRadius} = boardSize

    return (
        <Stage width={board} height={board}>
            <Board boardSize={boardSize} selectGrid={selectGrid} selfIsWhite={selfIsWhite} onGridSelect={onGridSelect} steps={steps} useGrid={useGrid}/>
            <Layer x={boardEdge} y={boardEdge}>
                {pieces.map(piece => {
                    return <Piece key={piece.num}
                                  num={piece.num}
                                  rowIndex={piece.rowIndex}
                                  colIndex={piece.colIndex}
                                  boardGrid={boardGrid}
                                  radius={pieceRadius}
                                  isEnd={gameIsEnd}
                                  isLast={piece.isLast}
                    />;
                })}
            </Layer>
        </Stage>
    );
}

export default Game;
