import {Modal} from "@illuxiza/one-client-react";
import {boardSize} from "@/config/board";
import rules, {RuleKey} from "@/config/rules";
import {useRemoteGo, useStore} from "@/hooks";
import {updateRule} from "@/stores/game";

import React from 'react';

import './index.scss'

type SettingProps = {
    open: boolean
    mode?:string
    onClose: () => void
}

const RuleSetting: React.FC<SettingProps> = ({open,mode, onClose}) => {
    const go = useRemoteGo(mode);
    const game = useStore(state => state.game);
    const ruleList = (Object.keys(rules) as RuleKey[]).map((ruleKey) => {
        const rule = rules[ruleKey];
        return {
            key: ruleKey,
            title: rule.title
        }
    });
    const toggleRuleItem = (key: RuleKey) => {
        go(updateRule(key))
    }

    return <Modal
        open={open}
        width={boardSize.board * 0.8 + 40}
        onClose={() => {
            onClose()
        }}
    >
        <div className="rule-setting">
            <div className="rule-item">棋子规则:</div>
            {ruleList.map(ruleItem =>
                <div className="rule-item"
                     key={ruleItem.key}>
                    <div className="rule-item-check">
                        <input
                            type="radio"
                            checked={game.rule == ruleItem.key}
                            disabled={game.steps > 0}
                            onChange={() => toggleRuleItem(ruleItem.key)}
                        />
                    </div>
                    <div className="rule-item-info">
                        <div className="rule-item-title">{ruleItem.title}</div>
                    </div>
                </div>
            )}
        </div>
    </Modal>;
}

export default RuleSetting;
