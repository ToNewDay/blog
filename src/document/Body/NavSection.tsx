import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { BOOK_NAV_SORT } from '../../common/constants';


export interface INavSectionInfoProps {
    title: string;
    icon: string;
    defaultPath?: string;
}

export interface INavSectionProps {
    list: Array<INavSectionInfoProps>;
    activeTitle?: string;
    isShowNavbook?: boolean;
    onClick?: (param: INavSectionInfoProps) => void;
}

export function NavSection(props: INavSectionProps) {
    const defaultActiveTitle = props.activeTitle ? props.activeTitle : _.get(props, 'list[0].title', '');
    const [activeBookTitle, setActiveBookTitle] = useState(defaultActiveTitle);
    const { list } = props;
    const handleClick = useCallback((info: INavSectionInfoProps) => {
        if (props.onClick == undefined) {
            return;
        }
        props.onClick(info);
        setActiveBookTitle(info.title);
    }, [props.onClick]);

    return (
        <div className="helpNavBookListArea" id="helpNavBookListArea" style={{ display: props.isShowNavbook ? 'block' : 'none' }} >
            <div className="helpNavBookList-container">
                <div className="helpNavBookList">
                    {
                        BOOK_NAV_SORT.map(bookName => {
                            const info = list.find(l => l.title === bookName);
                            if (info === undefined) {
                                return <Fragment></Fragment>;
                            }
                            return (
                                <a
                                    className="book"
                                    onClick={() => {
                                        handleClick(info)
                                    }}
                                >
                                    <span className="helpNavBookName">
                                        <span className="icon" style={{ backgroundSize: 'cover', background: `url(/${info.icon}) center center` }}></span>
                                        <span className="name">{info.title}</span>
                                    </span>
                                    <span className={classnames('selectIcon', { isActive: info.title == activeBookTitle })}  ></span>
                                </a>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    )
}
