import black from '@/assets/black.png'
import white from '@/assets/white.png'

import React, {PropsWithChildren} from 'react';

import './index.scss'

export type FooterProps = {
    mode: string,
    selfIsWhite?: boolean,
    isViewer: boolean,
    displayName?: string,
} & PropsWithChildren

const Footer: React.FC<FooterProps> = ({mode, selfIsWhite, isViewer, children, displayName}) => {
    return (
        <div className="footer">
            {mode !== 'local' ?
                <div className="color-piece">
                    {isViewer && mode === "remote" ? <span>观众席</span> : <>
                        <img className="piece-img"
                             src={selfIsWhite ? white : black}
                             alt=""
                        />
                        <span>己方执{selfIsWhite ? '白' : '黑'} {displayName ? displayName.substring(0, 5) : ''}</span></>
                    }
                </div> : <></>
            }
            <div className="btns">
                {children}
            </div>
        </div>
    )
}

export default Footer;
