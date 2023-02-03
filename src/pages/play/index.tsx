import black from '@/assets/black.png';
import white from '@/assets/white.png';
import {Footer, Game, Header, Nav} from '@/components'
import {boardSize} from "@/config/board";
import modes from '@/config/modes'
import rules from "@/config/rules";
import {useGo, usePieces, useRemoteGo, useStore} from "@/hooks";
import {
    changeSelfColor,
    GameFrameData,
    GridData,
    handleSelectGrid,
    restart,
    updateRule,
    updateSelfColor
} from "@/stores/game";
import {addRoom, configRoom, leaveRoom, resetRoom} from '@illuxiza/one-client';
import {redo, undo, useOnline} from "@illuxiza/one-client-react";
import axios from "axios";
import React, {useState} from 'react';
import {useParams} from "react-router-dom";
import {useMount, useUpdateEffect} from "react-use";

import './index.scss'

import StepRecord from "./record";
import RuleSetting from "./setting";


const Play = () => {
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
    const [level, setLevel] = useState("test");


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
        if (mode === "ai") {
            go(updateRule("0.4"));
            setShowRule(true);
        }
    })

    useUpdateEffect(() => {
        if (!pause && mode === 'ai' && !sameColor && !game.gameIsEnd) {
            let b: number[][] = [];
            for (let y = 0; y < 19; y++) {
                b[y] = [];
                for (let x = 0; x < 19; x++) {
                    if (game.board[x + y * 19] < 0) {
                        b[y][x] = 1;
                    } else if (game.board[x + y * 19] > 0) {
                        b[y][x] = 2;
                    } else {
                        b[y][x] = 0;
                    }
                }
            }
            let player = game.selfIsWhite ? 1 : 2;
            axios.post("/moq/ai", {
                board: b,
                player,
                level,
                version: game.rule
            }).then((res) => {
                let data: GridData = {
                    rowIndex: res.data.y,
                    colIndex: res.data.x,
                    ai: true,
                }
                setTimeout(() => go(handleSelectGrid(data)), 500);
            })
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
                    <div className="header-button">
                        <button style={{marginRight: '10px'}} onClick={restartGame}
                                disabled={!game.gameIsEnd || (mode == "remote" && !online.isPlayer)}>重开
                        </button>
                        <button style={{marginRight: '10px'}} onClick={() => setPause(!pause)}>{pause ? '开始' : '暂停'}
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
                {game.steps === 0 ?
                    mode === "local" ? <></> :
                        <button onClick={changeColor}>
                            换手
                        </button> :
                    <>
                        <button onClick={undoGame}
                                disabled={game.gameIsEnd || (mode == "remote" && !online.isPlayer)}>悔棋
                        </button>
                        <button onClick={redoGame}
                                disabled={game.gameIsEnd || (mode == "remote" && !online.isPlayer)}>重走
                        </button>
                        <button onClick={() => setOpen(true)}>
                            记录
                        </button>
                    </>
                }
            </Footer>
            <div className="board-footer">
                <div>{endBecause}</div>
            </div>
            <StepRecord open={open} mode={mode} onClose={() => setOpen(false)}/>
            <RuleSetting open={showRule} mode={mode} level={level} setLevel={setLevel}
                         onClose={() => setShowRule(false)}/>
        </div>
    );
}

export default Play;
