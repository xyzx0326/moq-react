import {Game, Modal} from "@/components";
import {boardScale, boardSize} from "@/config/board";
import {usePieces, useRemoteGo, useStore} from "@/hooks";
import {GameFrameData} from "@/stores/game";
import history from "@/stores/history";
import {saveAs} from 'file-saver';
import {useOnline} from "@illuxiza/one-client-react";
import moment from "moment";

import React, {useEffect, useRef, useState} from 'react';

import './index.scss'

type RecordProps = {
    open: boolean
    mode: string
    onClose: () => void
}
let gif: any;
let st: number;
const StepRecord: React.FC<RecordProps> = ({open, mode, onClose}) => {
    const game = useStore(state => state.game);
    const [stepIndex, setStepIndex] = useState(1);
    const online = useOnline();
    const [gameInfo, setGameInfo] = useState<GameFrameData | undefined>(undefined);
    const pieces = usePieces(gameInfo?.board);
    const [record, setRecord] = useState(false);
    const go = useRemoteGo(mode);
    const scale = 0.8;

    const ref = useRef<any>(null);
    useEffect(() => {
        const pastElement = history.past?.[stepIndex - 1];
        setGameInfo(pastElement?.state)
    }, [stepIndex, open])

    useEffect(() => {
        setStepIndex(history.past?.length)
    }, [open])

    const onClick = () => {
        setStepIndex(stepIndex + 1);
    }

    if (record && gif) {
        if (stepIndex == game.steps) {
            setTimeout(() => setGameInfo(game), 500)
            setTimeout(() => {
                gif.addFrame(ref.current.toCanvas(), {delay: 1500, copy: true});
                gif.render();
                gif = null;
            }, 700);
            setRecord(false);
        } else {
            setTimeout(() => {
                if (st !=stepIndex) {
                    gif.addFrame(ref.current.toCanvas(), {delay: 500, copy: true});
                    st = stepIndex;
                }
            }, 200);
            setTimeout(()=> {
                setStepIndex(stepIndex + 1)
            }, 500)
        }
    }
    const gotoStep = () => {
        if (record) {
            return
        }
        // @ts-ignore
        gif = new GIF({
            workerScript: '/moq/assets/gif.worker.js',
            workers: 2,
            quality: 100,
        });
        st = 0;
        // @ts-ignore
        gif.on('finished', function (blob) {
            saveAs(blob, moment().format('YYYY_MM_DD_HH_mm_ss'))
            // window.open(URL.createObjectURL(blob));
        });
        setStepIndex(1);
        setRecord(true)
    }

    return <Modal
        open={open}
        width={boardSize.board * scale + 40}
        onClose={() => {
            if (record) {
                return
            }
            onClose()
            setStepIndex(1)
        }}
    >
        <div className="step-boards">
            <Game
                // @ts-ignore
                ref={ref}
                boardSize={boardScale(scale)}
                pieces={pieces}
                steps={gameInfo?.steps}
                useGrid={gameInfo?.useGrid}
            />
            <div className="step-group">
                <span>{stepIndex}/{game.steps}</span>
            </div>
            <div className="step-group">
                <button onClick={() => setStepIndex(stepIndex - 1)} disabled={stepIndex === 1 || record}>
                    上一步
                </button>
                <button style={{margin: "0 10px"}} onClick={gotoStep} disabled={record}>
                    保存棋局图像
                </button>
                <button onClick={onClick} disabled={stepIndex === game.steps || record}>
                    下一步
                </button>
            </div>
        </div>
    </Modal>;
}

export default StepRecord;
