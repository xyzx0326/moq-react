import black from '@/assets/black.png';
import white from '@/assets/white.png';
import {Footer, Game, Header, Nav} from '@/components'
import {boardSize} from "@/config/board";
import modes from '@/config/modes'
import rules from "@/config/rules";
import {useGo, usePieces, useRemoteGo, useStore} from "@/hooks";
import {changeSelfColor, GameFrameData, GridData, handleSelectGrid, restart, updateSelfColor} from "@/stores/game";
import {addRoom, configRoom, leaveRoom, resetRoom} from '@illuxiza/one-client';
import {redo, undo, useOnline} from "@illuxiza/one-client-react";
import React, {useState} from 'react';
import {useParams} from "react-router-dom";
import {useMount, useUpdateEffect} from "react-use";

import './index.scss'


const Record = () => {
    const game: GameFrameData = useStore(state => state.game);
    const [pause, setPause] = useState(false);
    const online = useOnline();
    const pieces = usePieces(game.board);
    const go = useGo();
    const params = useParams();
    const mode = params.mode as (keyof typeof modes) || 'ai';
    const remoteGo = useRemoteGo(mode);
    const cfg = modes[mode];
    const [open, setOpen] = useState(false);
    const [showRule, setShowRule] = useState(false);


    const sameColor = game.selfIsWhite === game.stepIsWhite;


    useMount(() => {
        go(restart())
        if (mode === 'local' && game.selfIsWhite) {
            go(changeSelfColor())
        }
        if (mode === 'remote') {
            const roomParam = params.roomId!;
            addRoom(roomParam)
        }
    })

    useUpdateEffect(() => {
        if (!pause && mode === 'ai' && !sameColor && !game.gameIsEnd) {
            // 延时执行，避免操作太快看不清
            // setTimeout(() => {
            // const nextStep = GameUtils.aiNextStep(
            //     [...gameStore.board],
            //     gameStore.stepIsWhite,
            //     !gameStore.selfIsWhite,
            //     gameStore.rule
            // );
            // if (nextStep) {
            //     // go(handlePiecePut(nextStep));
            // }
            // }, 500);
        }
    })

    const opStep = mode === 'local' || !sameColor || pause ? 1 : 2;

    const onBack = () => {
        if (mode === 'remote') {
            leaveRoom()
        }
    };

    const handleGrid = (data: GridData) => {
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        if (game.gameIsEnd) {
            return
        }
        if (pause) {
            return;
        }
        if (mode !== 'local' && !sameColor) {
            return;
        }
        remoteGo(handleSelectGrid(data))
    }
    let endBecause = '';
    if (game.gameIsEnd) {
        endBecause = `${game.stepIsWhite ? '白' : '黑'}方胜利`;
    }


    let changeColor = () => {
        if (mode === "remote" && online.isPlayer) {
            const index = online?.myIndex;
            const s0 = JSON.stringify(updateSelfColor(game.selfIsWhite));
            const s1 = JSON.stringify(updateSelfColor(!game.selfIsWhite));
            const playerConfig = [[s0], [s1]];
            playerConfig[index] = [s1]
            playerConfig[1 - index] = [s0]
            configRoom({playerConfig})
        } else if (mode === "ai") {
            go(changeSelfColor());
        }
    }
    const restartGame = () => {
        if (game.gameIsEnd) {
            changeColor();
        }
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        remoteGo(restart());
        if (mode === "remote") {
            resetRoom()
        }
    }
    const pauseGame = () => {
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        setPause(!pause);
    }
    const undoGame = () => {
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        remoteGo(undo(opStep));
    }
    const redoGame = () => {
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        remoteGo(redo(opStep));
    }
    return (
        <div className="main" style={{width: `${boardSize.board}px`}}>
            <Nav title={cfg.title} onBack={onBack}
                 onSetting={() => setShowRule(true)}
            />
            <Header mode={mode} selfIsWhite={game.selfIsWhite} otherSideOnline={online.playerCount === 2}
                    channelId={params.roomId ? params.roomId!.substring(0, 4) : ''} isViewer={!online.isPlayer}
                    selfId={online.playerId} players={online.players}/>
            <div className="board">
                <div className="board-header">
                    <div>
                        <button style={{marginRight: '10px'}} onClick={restartGame}
                                disabled={!game.gameIsEnd || (mode == "remote" && !online.isPlayer)}>重开
                        </button>
                    </div>
                    {!game.gameIsEnd ?
                        <div className="color-piece">
                            <img alt="" className="piece-img"
                                 src={game.stepIsWhite ? white : black}
                            />
                            <span>轮到{mode === 'local' ? game.stepIsWhite ? '白' : '黑' :
                                sameColor ? '己' : '对'}方走棋</span>
                        </div> : <></>}
                </div>
                <div className="board-body"
                     style={{height: `${boardSize.board}px`}}>
                    <Game
                        gameInfo={game}
                        boardSize={boardSize}
                        pieces={pieces}
                        onGridSelect={handleGrid}
                        freeCount={rules[game.rule].freeCount}
                    />
                </div>
            </div>
            <Footer mode={mode} selfIsWhite={game.selfIsWhite} isViewer={!online.isPlayer}
                    displayName={online.playerId}>
                {/*<button onClick={() => setStepIndex(stepIndex - 1)} disabled={stepIndex === 1 || record}>*/}
                {/*    上一步*/}
                {/*</button>*/}
                {/*<button style={{margin: "0 10px"}} onClick={downloadGif} disabled={record}>*/}
                {/*    下载棋局*/}
                {/*</button>*/}
                {/*<button onClick={onClick} disabled={stepIndex === game.steps}>*/}
                {/*    下一步*/}
                {/*</button>*/}
            </Footer>
        </div>
    );
}

export default Record;
