import black from '@/assets/black.png';
import white from '@/assets/white.png';

import Konva from "konva";
import React, {useRef} from 'react';
import {Group, Image as KImage, Line, Text} from "react-konva";

type NavProps = {
    num: number; // 当前棋子
    rowIndex: number; // 所在行
    colIndex: number; // 所在列
    boardGrid: number; // 棋盘格子大小
    radius: number; // 半径
    isEnd?: boolean;
    isLast?: boolean;
}

const Piece: React.FC<NavProps> = ({
                                       num,
                                       rowIndex,
                                       colIndex,
                                       boardGrid,
                                       radius,
                                       isEnd,
                                       isLast
                                   }) => {
    const nodeRef = useRef<Konva.Group>(null);

    const x = colIndex * boardGrid;
    const y = rowIndex * boardGrid;

    const image = new Image();
    image.src = num > 0 ? white : black;
    const color = num > 0 ? '#000' : '#fff'

    const shadow = {
        shadowColor: "#000",
        shadowBlur: 5,
        shadowOffset: {x: 2, y: 3},
        shadowOpacity: 0.6
    }
    const strokeWidth = boardGrid / 20;

    const lastSelect = <Group>
        <Line
            points={[boardGrid / 12, 0, boardGrid / 6, 0.01]}
            stroke={color}
            lineCap='round'
            lineJoin='round'
            strokeWidth={strokeWidth}
        />
        <Line
            points={[-boardGrid / 6, 0, -boardGrid / 12, 0.01]}
            stroke={color}
            lineCap='round'
            lineJoin='round'
            strokeWidth={strokeWidth}
        />
        <Line
            points={[0, boardGrid / 12, 0.01, boardGrid / 6]}
            stroke={color}
            lineCap='round'
            lineJoin='round'
            strokeWidth={strokeWidth}
        />
        <Line
            points={[0, -boardGrid / 6, 0.01, -boardGrid / 12]}
            stroke={color}
            lineCap='round'
            lineJoin='round'
            strokeWidth={strokeWidth}
        /></Group>;
    const tag = isLast && !isEnd ?
        lastSelect :
        isEnd ?
            <Text
                text={Math.abs(num) + ""}
                fill={color}
                fontSize={boardGrid / 2.5}
                align={"center"}
                verticalAlign={"middle"}
                width={boardGrid}
                height={boardGrid}
                x={-boardGrid / 2}
                y={-boardGrid / 2}
            /> : <></>;
    return (
        <Group
            ref={nodeRef}
            x={x}
            y={y}
        >
            <KImage
                image={image}
                width={radius * 2}
                height={radius * 2}
                x={-radius}
                y={-radius}
                {...shadow}
            />
            {tag}
        </Group>
    );
}

export default Piece;
