import Konva from "konva";
import React, {useEffect, useRef} from "react";
import {Group, Line} from "react-konva";

type SelectLineProps = {
    boardGrid: number,
    color: string,
    x: number
    y: number
}

const SelectLine: React.FC<SelectLineProps> = ({boardGrid, color, x, y}) => {
    const lineNode = useRef<Konva.Line>(null);
    const groupNode = useRef<Konva.Group>(null);

    const strokeWidth = boardGrid / 12;
    const x1 = boardGrid / 3;
    const y1 = boardGrid / 3;
    // round = 2πr ,  r = boardGrid/3 * √2
    const slice = boardGrid * 2.96191 / 5;
    const solid = slice / 2;
    const blank = slice - solid;

    useEffect(() => {
        const angularSpeed = 45;
        const anim = new Konva.Animation(function (frame) {
            const angleDiff = (frame!.timeDiff * angularSpeed) / 1000;
            lineNode.current && lineNode.current.rotate(angleDiff);
        }, groupNode);
        anim.start();
        return () => {
            anim.stop()
        };
    })
    const shadow = {
        shadowColor: "#000",
        shadowBlur: 5,
        shadowOffset: {x: 2, y: 3},
        shadowOpacity: 0.6
    }

    return <Group ref={groupNode} x={x} y={y}>
        <Line
            ref={lineNode}
            points={[
                x1, y1,
                x1, -y1,
                -x1, -y1,
                -x1, y1,
            ]}
            stroke={color}
            lineCap='round'
            lineJoin='round'
            dash={[solid, blank]}
            tension={0.5}
            closed={true}
            strokeWidth={strokeWidth}
            {...shadow}
        />
        <Line
            points={[0, 0, 0.01, 0.01]}
            stroke={color}
            lineCap='round'
            lineJoin='round'
            strokeWidth={strokeWidth * 2.5}
            {...shadow}
        />
    </Group>;
}
export default SelectLine;
