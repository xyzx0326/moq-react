import {SelectLine} from "@/components";
import {BoardSizeType} from "@/config/board";
import rules from "@/config/rules";
import {GameFrameData, GridData} from "@/stores/game";

import Konva from "konva";
import {LineCap, LineJoin} from "konva/lib/Shape";
import React, {useEffect, useState} from 'react';
import {Circle, Group, Line, Rect, Text} from "react-konva";

type BoardProps = {
    boardSize: BoardSizeType;
    freeCount?: number;
    gameInfo: GameFrameData;
    showPrediction?: boolean

    onGridSelect?: (data: GridData) => void;
}


const Board: React.FC<BoardProps> = ({
                                         boardSize,
                                         onGridSelect,
                                         freeCount,
                                         gameInfo,
                                         showPrediction,
                                     }) => {
    const [lines, setLines] = useState<Konva.LineConfig[]>([]);
    const [texts, setTexts] = useState<Konva.TextConfig[]>([]);
    const [rects, setRects] = useState<Konva.RectConfig[]>([]);
    const [predictions, setPredictions] = useState<Konva.RectConfig[]>([]);
    const {
        selectGrid, gameIsEnd, steps, useGrid, board: boardInfo, stepIsWhite, rule
    } = gameInfo
    const {board, boardGrid, boardEdge} = boardSize;

    useEffect(() => {
        const ret = [];
        const color = '#baa17e';
        for (let i = 1; i <= 19; i++) {
            ret.push({
                text: i + '',
                fill: color,
                x: boardEdge * 0.1,
                verticalAlign: "middle",
                align: "left",
                y: boardGrid * i - 0.5 * boardEdge,
            });
            ret.push({
                text: String.fromCharCode(64 + i),
                fill: color,
                verticalAlign: "top",
                align: "center",
                x: boardGrid * i - 0.5 * boardEdge,
                y: boardEdge * 0.1,
            });
            ret.push({
                text: i + '',
                fill: color,
                verticalAlign: "middle",
                align: "right",
                x: board - boardEdge * 1.1,
                y: boardGrid * i - 0.5 * boardEdge,
            });
            ret.push({
                text: String.fromCharCode(64 + i),
                fill: color,
                verticalAlign: "bottom",
                align: "center",
                x: boardGrid * i - 0.5 * boardEdge,
                y: board - boardEdge * 1.1,
            });
        }
        setTexts(ret);
    }, [])

    // 棋盘线格
    useEffect(() => {
        const ret = [];
        const lineColor = '#baa17e';
        const dot1 = boardGrid * 4;
        const dot2 = boardGrid * 9;
        const dot3 = boardGrid * 14;
        const dotWidth = 5;
        for (let i = 0; i < 19; i++) {
            ret.push({
                points: [0, boardGrid * i, board - boardEdge * 2, boardGrid * i],
                stroke: lineColor,
                strokeWidth: 1
            });
            ret.push({
                points: [boardGrid * i, 0, boardGrid * i, board - boardEdge * 2],
                stroke: lineColor,
                strokeWidth: 1
            });
        }
        ret.push({
            points: [dot1, dot1, dot1, dot1 + 0.01],
            stroke: lineColor,
            strokeWidth: dotWidth,
            lineCap: 'round' as LineCap,
            lineJoin: 'round' as LineJoin
        })
        ret.push({
            points: [dot3, dot3, dot3, dot3 + 0.01],
            stroke: lineColor,
            strokeWidth: dotWidth,
            lineCap: 'round' as LineCap,
            lineJoin: 'round' as LineJoin
        })
        ret.push({
            points: [dot1, dot3, dot1, dot3 + 0.01],
            stroke: lineColor,
            strokeWidth: dotWidth,
            lineCap: 'round' as LineCap,
            lineJoin: 'round' as LineJoin
        })
        ret.push({
            points: [dot3, dot1, dot3, dot1 + 0.01],
            stroke: lineColor,
            strokeWidth: dotWidth,
            lineCap: 'round' as LineCap,
            lineJoin: 'round' as LineJoin
        })
        ret.push({
            points: [dot2, dot2, dot2, dot2 + 0.01],
            stroke: lineColor,
            strokeWidth: dotWidth,
            lineCap: 'round' as LineCap,
            lineJoin: 'round' as LineJoin
        })
        setLines(ret)
    }, [board, boardGrid, boardEdge])

    useEffect(() => {
        if (selectGrid && steps >= rules[rule].freeCount - 1 && showPrediction) {
            const ret = [];
            const tmp = [];
            const bp = JSON.parse(JSON.stringify(boardInfo))
            bp[selectGrid.rowIndex * 19 + selectGrid.colIndex] = stepIsWhite ? 99 : -99;
            const useGrid = rules[rule].useGrid(bp, !stepIsWhite!);
            for (let i = 0; i < useGrid!.length; i++) {
                const use = useGrid![i];

                const rowIndex = use.rowIndex;
                const colIndex = use.colIndex;
                const current = colIndex + rowIndex * 19;
                const direction = [
                    {
                        condition: (v: number) => colIndex - v >= 0,
                        boardIndex: (v: number) => current - v
                    },
                    {
                        condition: (v: number) => rowIndex - v >= 0,
                        boardIndex: (v: number) => current - v * 19
                    },
                    {
                        condition: (v: number) => colIndex - v >= 0 && rowIndex - v >= 0,
                        boardIndex: (v: number) => current - v * 20
                    },
                    {
                        condition: (v: number) => colIndex + v < 19 && rowIndex - v >= 0,
                        boardIndex: (v: number) => current - v * 18
                    },
                ]
                const d = direction[use.direction];
                let j = 0;
                while (d.condition(j)) {
                    const index = d.boardIndex(j);
                    if (!boardInfo || !boardInfo[index]) {
                        const r = Math.floor(index / 19);
                        const c = index % 19;
                        if (!tmp[index]) {
                            tmp[index] = true;
                            ret.push({
                                row: r,
                                col: c,
                                x: boardGrid * c,
                                y: boardGrid * r,
                                width: boardGrid,
                                height: boardGrid,
                                fill: stepIsWhite ? "red" : "green",
                                // fill: "green"
                            });
                        }
                    }
                    j++;
                }
            }
            setPredictions(ret)
        } else {
            setPredictions([]);
        }
    }, [selectGrid])

    //隐形操作区
    useEffect(() => {
        const ret = [];
        const tmp = [];
        if (!gameIsEnd) {
            if (!freeCount || steps < freeCount || !useGrid) {
                for (let i = 0; i < 19; i++) {
                    for (let j = 0; j < 19; j++) {
                        ret.push({
                            row: j,
                            col: i,
                            x: boardGrid * i,
                            y: boardGrid * j,
                            width: boardGrid,
                            height: boardGrid,
                        });
                    }
                }
            } else {
                for (let i = 0; i < useGrid!.length; i++) {
                    const use = useGrid![i];

                    const rowIndex = use.rowIndex;
                    const colIndex = use.colIndex;
                    const current = colIndex + rowIndex * 19;
                    const direction = [
                        {
                            condition: (v: number) => colIndex - v >= 0,
                            boardIndex: (v: number) => current - v
                        },
                        {
                            condition: (v: number) => rowIndex - v >= 0,
                            boardIndex: (v: number) => current - v * 19
                        },
                        {
                            condition: (v: number) => colIndex - v >= 0 && rowIndex - v >= 0,
                            boardIndex: (v: number) => current - v * 20
                        },
                        {
                            condition: (v: number) => colIndex + v < 19 && rowIndex - v >= 0,
                            boardIndex: (v: number) => current - v * 18
                        },
                    ]
                    const d = direction[use.direction];
                    let j = 0;
                    while (d.condition(j)) {
                        const index = d.boardIndex(j);
                        if (!boardInfo || !boardInfo[index]) {
                            const r = Math.floor(index / 19);
                            const c = index % 19;
                            if (!tmp[index]) {
                                tmp[index] = true;
                                ret.push({
                                    row: r,
                                    col: c,
                                    x: boardGrid * c,
                                    y: boardGrid * r,
                                    width: boardGrid,
                                    height: boardGrid,
                                    fill: stepIsWhite ? "green" : "red",
                                    // fill: "green"
                                });
                            }
                        }
                        j++;
                    }
                }
            }
        }
        setRects(ret)
    }, [boardGrid, steps, useGrid, gameIsEnd])

    const onClick = (data: GridData) => {
        onGridSelect && onGridSelect(data)
    }

    return (
        <Group>
            <Rect
                width={board}
                height={board}
                fill='#eee1bb'
            />
            <Group>
                {texts.map((text, i) =>
                    <Text
                        key={i + "t"}
                        text={text.text}
                        fill={text.fill}
                        width={boardEdge}
                        height={boardEdge}
                        verticalAlign={text.verticalAlign}
                        align={text.align}
                        x={text.x}
                        y={text.y}
                    />
                )}
            </Group>
            <Group x={boardEdge} y={boardEdge}>
                {lines.map((line, i) =>
                    <Line
                        key={i + "l"}
                        points={line.points}
                        stroke={line.stroke}
                        strokeWidth={line.strokeWidth}
                        lineCap={line.lineCap}
                        lineJoin={line.lineJoin}
                    />
                )}
            </Group>
            <Group x={boardEdge - boardGrid / 2} y={boardEdge - boardGrid / 2}>
                {selectGrid ? <SelectLine boardGrid={boardGrid}
                                          color={stepIsWhite ? "#fff" : "#000"}
                                          x={selectGrid.colIndex * boardGrid + boardGrid / 2}
                                          y={selectGrid.rowIndex * boardGrid + boardGrid / 2}
                /> : <></>}
                {predictions.map((rect, i) =>
                    <Circle
                        key={i}
                        fill={rect.fill}
                        x={rect.x! + boardGrid / 2}
                        y={rect.y! + boardGrid / 2}
                        width={rect.width! * 0.6}
                        height={rect.height! * 0.6}
                        opacity={0.15}/>
                )}
                {rects.map((rect, i) =>
                    <Group key={i + 'g'}>
                        {rect.fill ?
                            <Circle
                                fill={rect.fill}
                                x={rect.x! + boardGrid / 2}
                                y={rect.y! + boardGrid / 2}
                                width={rect.width! - 1}
                                height={rect.height! - 1}
                                opacity={0.15}/> : null
                        }
                        <Rect
                            x={rect.x}
                            y={rect.y}
                            width={rect.width}
                            height={rect.height}
                            // fill={rect.fill}
                            opacity={0.35}
                            onClick={() => onClick({rowIndex: rect.row, colIndex: rect.col})}
                            onTap={() => onClick({rowIndex: rect.row, colIndex: rect.col})}
                        />
                    </Group>
                )}
            </Group>
        </Group>
    );
}

export default Board;
