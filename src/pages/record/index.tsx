import black from '@/assets/black.png';
import white from '@/assets/white.png';
import {Game, Nav} from '@/components'
import {boardSize} from "@/config/board";
import rules from "@/config/rules";
import {usePieces, useStore} from "@/hooks";
import {GameFrameData} from "@/stores/game";
import React from 'react';

import './index.scss'


const Record = () => {
    const game: GameFrameData = useStore(state => state.game);
    const pieces = usePieces(game.board);

    return (
        <div className="main" style={{width: `${boardSize.board}px`}}>
            <Nav title="对局回放"/>
            <div className="board">
                <div className="board-header">
                    {!game.gameIsEnd ?
                        <div className="color-piece">
                            <img alt="" className="piece-img"
                                 src={game.stepIsWhite ? white : black}
                            />
                            <span>轮到{game.stepIsWhite ? '白' : '黑'}方走棋</span>
                        </div> : <></>}
                </div>
                <div className="board-body"
                     style={{height: `${boardSize.board}px`}}>
                    <Game
                        gameInfo={game}
                        boardSize={boardSize}
                        pieces={pieces}
                        freeCount={rules[game.rule].freeCount}
                    />
                </div>
            </div>
        </div>
    );
}

export default Record;
