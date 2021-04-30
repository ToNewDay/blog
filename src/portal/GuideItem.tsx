import React from 'react';
import arrowSvg from '../assert/svg/arrow-right.svg';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { GuideItemProps } from '../common/constants/index';
import DocLink from '../component/DocLink';


export function GuideItem(props: GuideItemProps) {
    return (
        <div className={classnames("guide-item", props.className)}>
            <DocLink to={props.url} ></DocLink>
            <div className="tit">{props.titleEn}</div>
            <div className="icon"><img src={props.icon} /></div>
            <div className="txt">
                <h2>{props.title}</h2>
                <p>
                    {props.content}
                </p>
            </div>
            <div className="divider"></div>
            <div className="read"><span>阅读</span><span className="arrow-right"><img src={arrowSvg} /></span></div>
        </div>
    )
}
