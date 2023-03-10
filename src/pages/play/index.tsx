import black from '@/assets/black.png';
import white from '@/assets/white.png';
import {Footer, Game, Header, Nav} from '@/components'
import {boardSize} from "@/config/board";
import modes from '@/config/modes'
import rules, {defaultRule} from "@/config/rules";
import {useGo, usePieces, useRemoteGo, useStore} from "@/hooks";
import {
    blackJson,
    changeSelfColor,
    GameFrameData,
    GridData,
    handleSelectGrid,
    restart,
    updateRule,
    updateSelfColor,
    whiteJson
} from "@/stores/game";
import {CACHE_RULE_KEY, CacheUtils} from "@/utils";
import {addRoom, configClient, configRoom, leaveRoom, resetRoom} from '@illuxiza/one-client';
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
    const [loading, setLoading] = useState(false);


    const sameColor = game.selfIsWhite === game.stepIsWhite;


    useMount(() => {
        go(restart())
        if (mode === 'local' && game.selfIsWhite) {
            go(changeSelfColor())
        }
        if (mode === 'remote') {
            configClient("ws://" + import.meta.env.moq_domain + "/game/ws", {
                maxPlayer: 2,
                baseConfig: [JSON.stringify(updateRule(CacheUtils.getItem(CACHE_RULE_KEY, defaultRule)))],
                debug: true,
                playerConfig: [[blackJson], [whiteJson]],
                onConfig: go,
                onFrame: go,
                onReset: go
            }, "moq")
            const roomParam = params.roomId!;
            addRoom(roomParam)
        }
        if (mode !== "remote") {
            setShowRule(true);
        }
        if (mode === "ai") {
            go(updateRule("0.4"));
            setPause(true);
        }
    })

    useUpdateEffect(() => {
        if (!pause && mode === 'ai' && !sameColor && !game.gameIsEnd && !loading) {
            setLoading(true)
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
                go(handleSelectGrid(data));
                setLoading(false)
            })
        }
    })

    const aiGo = () => {
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
        let player = game.selfIsWhite ? 2 : 1;
        axios.post("/moq/ai2", {
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
            go(handleSelectGrid(data));
        })
    }

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
        endBecause = `${game.stepIsWhite ? '???' : '???'}?????????`;
    }


    let changeColor = () => {
        if (mode === "remote" && online.isPlayer) {
            const index = online.myIndex;
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
        if (mode !== "ai") {
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
    const disabled = (game.gameIsEnd || (mode == "remote" && !online.isPlayer)) && mode !== 'ai';
    return (
        <div className="main" style={{width: `${boardSize.board}px`}}>
            <Nav title={cfg.title} onBack={onBack}
                 onSetting={() => {
                     setShowRule(true)
                     if (mode == "ai") {
                         setPause(true);
                     }
                 }}
            />
            <Header mode={mode} selfIsWhite={game.selfIsWhite} otherSideOnline={online.playerCount === 2}
                    channelId={params.roomId ? params.roomId!.substring(0, 4) : ''} isViewer={!online.isPlayer}
                    selfId={online.playerId} players={online.players}/>
            <div className="board">
                <div className="board-header">
                    <div className="header-button">
                        <button style={{marginRight: '10px'}} onClick={restartGame}
                                disabled={(!game.gameIsEnd || (mode == "remote" && !online.isPlayer)) && mode !== 'ai' || loading}>??????
                        </button>
                        {mode === "ai" ?
                            <button style={{marginRight: '10px'}} onClick={() => pauseGame()}
                                    disabled={loading}>{pause ? '??????' : '??????'}
                            </button> : null}
                    </div>
                    {!game.gameIsEnd ?
                        <div className="color-piece">
                            <img alt="" className="piece-img"
                                 src={game.stepIsWhite ? white : black}
                            />
                            <span>??????{mode !== 'remote' || !online.isPlayer ? game.stepIsWhite ? '???' : '???' :
                                sameColor ? '???' : '???'}?????????</span>
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
                        showPrediction={mode === 'ai'}
                    />
                </div>
            </div>
            <Footer mode={mode} selfIsWhite={game.selfIsWhite} isViewer={!online.isPlayer}
                    displayName={online.playerId}>
                {mode === "ai" ?
                    <button onClick={aiGo} disabled={!sameColor || loading || game.gameIsEnd}>??????
                    </button> : null}
                {game.steps === 0 ?
                    mode === "local" ? <></> :
                        <button onClick={changeColor} disabled={loading}>
                            ??????
                        </button> :
                    <>
                        <button onClick={undoGame}
                                disabled={disabled || loading}>??????
                        </button>
                        <button onClick={redoGame}
                                disabled={disabled || loading}>??????
                        </button>
                        <button onClick={() => setOpen(true)}>
                            ??????
                        </button>
                    </>
                }
            </Footer>
            <div className="board-footer">
                <div>{endBecause}</div>
            </div>
            <StepRecord open={open} mode={mode} onClose={() => setOpen(false)}/>
            <RuleSetting open={showRule} mode={mode} level={level} setLevel={setLevel}
                         onClose={() => {
                             setShowRule(false)
                             if (mode == 'ai') {
                                 setPause(false)
                             }
                         }}/>
        </div>
    );
}

export default Play;
