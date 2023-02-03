import {boardSize} from "@/config/board";
import rules, {RuleKey} from "@/config/rules";
import {useGo, useStore} from "@/hooks";
import {updateRule, updateSelfColor} from "@/stores/game";
import {configRoom, resetRoom} from "@illuxiza/one-client";
import {Modal} from "@illuxiza/one-client-react";

import React from 'react';

import './index.scss'

type SettingProps = {
    open: boolean
    mode?: string
    level?: string
    setLevel?: Function
    onClose: () => void
}

const RuleSetting: React.FC<SettingProps> = ({open, mode, level, setLevel, onClose}) => {
    const go = useGo();
    const game = useStore(state => state.game);
    const ruleList = (Object.keys(rules) as RuleKey[]).map((ruleKey) => {
        const rule = rules[ruleKey];
        return {
            key: ruleKey,
            title: rule.title,
            desc: rule.desc,
        }
    });
    const levelList = [{
        label: "学习",
        code: "test"
    }, {label: "入门", code: "start"}, {
        label: "低级",
        code: "low"
    }, {
        label: "中级",
        code: "middle"
    }, {
        label: "高级",
        code: "high"
    }]
    const toggleRuleItem = (key: RuleKey) => {
        const rule = updateRule(key);
        if (mode === "remote") {
            configRoom({baseConfig: [JSON.stringify(rule)]})
            resetRoom();
        } else {
            go(rule)
        }
    }

    return <Modal
        open={open}
        width={boardSize.board * 0.8 + 40}
        onClose={() => {
            onClose()
        }}
    >
        <div className="rule-setting">
            {mode == "ai" ?
                <>
                    <div className="board-setting">
                        <div className="board-item">黑白</div>
                    </div>
                    <div className="board-setting">
                        <div className="board-item">
                            <div className="board-item-check">
                                <input
                                    type="radio"
                                    checked={!game.selfIsWhite}
                                    onChange={() => go(updateSelfColor(false))
                                    }
                                />
                            </div>
                            <div className="board-item-info">
                                <div className="board-item-title">黑</div>
                            </div>
                        </div>
                        <div className="board-item">
                            <div className="board-item-check">
                                <input
                                    type="radio"
                                    checked={game.selfIsWhite}
                                    onChange={() => go(updateSelfColor(true))
                                    }
                                />
                            </div>
                            <div className="board-item-info">
                                <div className="board-item-title">白</div>
                            </div>
                        </div>
                    </div>
                    <div className="board-setting">
                        <div className="board-item">AI等级：</div>
                    </div>
                    <div className="board-setting">
                        {levelList.map(l =>
                            <div className="board-item"
                                 key={l.code}>
                                <div className="board-item-check">
                                    <input
                                        type="radio"
                                        checked={l.code == level}
                                        disabled={game.rule == "0.5" && l.code == "high"}
                                        onChange={() => setLevel && setLevel(l.code)}
                                    />
                                </div>
                                <div className="board-item-info">
                                    <div className="board-item-title">{l.label}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </> : null}
            <div className="rule-item">棋子规则:</div>
            {ruleList.map(ruleItem =>
                <div className="rule-item"
                     key={ruleItem.key}>
                    <div className="rule-item-check">
                        <input
                            type="radio"
                            checked={game.rule == ruleItem.key}
                            disabled={game.steps > 0 || (mode == 'ai' && ruleItem.key != "0.5" && ruleItem.key != "0.4" && ruleItem.key != "0.2")}
                            onChange={() => toggleRuleItem(ruleItem.key)}
                        />
                    </div>
                    <div className="rule-item-info">
                        <div className="rule-item-title">{ruleItem.title}</div>
                        <div className="rule-item-desc">{ruleItem.desc}</div>
                    </div>
                </div>
            )}
        </div>
    </Modal>;
}

export default RuleSetting;
