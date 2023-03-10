import {Game} from "@/components";
import {boardScale, boardSize} from "@/config/board";
import rules, {defaultRule} from "@/config/rules";
import {usePieces, useStore} from "@/hooks";
import {GameFrameData} from "@/stores/game";
import {history, Modal} from "@illuxiza/one-client-react";
import {saveAs} from 'file-saver';
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
    const [gameInfo, setGameInfo] = useState<GameFrameData | undefined>(undefined);
    const pieces = usePieces(gameInfo?.board);
    const [record, setRecord] = useState(false);
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
            setTimeout(() => {
                setGameInfo(game)
                setRecord(false);
            }, 300)
            setTimeout(() => {
                gif.addFrame(ref.current.toCanvas(), {delay: 1500, copy: true});
                gif.render();
                gif = null;
            }, 400);
        } else {
            setTimeout(() => {
                setStepIndex(stepIndex + 1)
            }, 200)
        }
        setTimeout(() => {
            if (st != stepIndex) {
                gif.addFrame(ref.current.toCanvas(), {delay: 500, copy: true});
                st = stepIndex;
            }
        }, 100);
    }
    const downloadGif = () => {
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

    const rule = gameInfo?.rule ?? defaultRule;
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
            <div className="step-group" style={{marginBottom: "1rem"}}>
                <span style={{width: '100%'}}>{stepIndex}/{game.steps}</span>
            </div>
            <Game
                // @ts-ignore
                gameInfo={gameInfo ? {...gameInfo, selectGrid: undefined} : {}}
                ref={ref}
                boardSize={boardScale(scale)}
                pieces={pieces}
                freeCount={rules[rule].freeCount}
            />
            <div className="step-group" style={{marginTop: "1rem"}}>
                <button onClick={() => setStepIndex(stepIndex - 1)} disabled={stepIndex === 1 || record}>
                    ?????????
                </button>
                <button style={{margin: "0 10px"}} onClick={downloadGif} disabled={record}>
                    ????????????
                </button>
                <button onClick={onClick} disabled={stepIndex === game.steps || record}>
                    ?????????
                </button>
            </div>
        </div>
    </Modal>;
}

export default StepRecord;
