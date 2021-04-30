import React, { Props } from 'react';
import './portal.scss';
import documentSvg from '../assert/svg/document.svg';
import documentBlueSvg from '../assert/svg/document-blue.svg';
import readMoreBlueSvg from '../assert/svg/read-more-blue.svg';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { FeatureProps, FeatureItemProps } from '../common/constants/index';
import DocLink from '../component/DocLink';

export function Feature(props: FeatureProps) {
    return (
        <div className="feature-guide">
            <h2 className="tips">{props.title}</h2>
            <div className="feature-box">
                <div className="left-box">
                    {_.get<FeatureProps, 'list', Array<FeatureItemProps>>(props, 'list', []).map(info => (
                        <div className="feature-item">
                            <DocLink to={info.url} ></DocLink>
                            <div className="icon default">
                                <img src={documentSvg} />
                            </div>
                            <div className="icon blue">
                                <img src={documentBlueSvg} />
                            </div>
                            <div className="txt">{info.text}</div>
                            <div className="arrow"><img src={readMoreBlueSvg} /></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
