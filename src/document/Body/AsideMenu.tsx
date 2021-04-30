import React, { useMemo, useState, useEffect } from 'react';
import classnames from 'classnames';
import util from 'lodash';

export interface IAsideMenuProps {
    pageContent: string;
    activeHash: string;
}

export interface ITocInfo {
    level: number;
    title: string;
}

function convertStrToMenuData(param: string): Array<ITocInfo> {
    const reg = /<h([2-9])([\s\S]*?)id="([\s\S]*?)">([\s\S]*?)<\/h([2-9])>/g;
    const result: Array<ITocInfo> = [];
    let temp = null;
    let safeCount = 100;
    while ((temp = reg.exec(param)) != null && safeCount > 0) {
        safeCount--;
        if (temp.length != 6) {
            continue;
        }
        result.push({
            level: temp[1] as any as number,
            title: temp[3]
        })
    }
    return result;
}



export default function AsideMenu(props: IAsideMenuProps) {
    const [activeId, setActiveId] = useState(decodeURIComponent(util.get(props, 'activeHash', '').replace('#', '')));

    const tocDataArr = useMemo(() => {
        return convertStrToMenuData(props.pageContent);
    }, [props.pageContent]);

    useEffect(() => {
        const linkArr = tocDataArr.map(m => m.title);
        //添加滚动监听
        const windowScroll = () => {
            let tempActiveId = '';
            for (let i = 0; i < linkArr.length; i++) {
                const titleObj = document.getElementById(linkArr[i]);
                if (titleObj == null) {
                    continue;
                }
                const yPosi = titleObj.getBoundingClientRect().y;
                if (yPosi < 100) {
                    tempActiveId = linkArr[i];
                }
            }
            setActiveId(tempActiveId);
        }
        document.addEventListener('scroll', windowScroll);
        return () => {
            document.removeEventListener('scroll', windowScroll);
        }
    }, []);

    useEffect(() => {
        // 处理初始化瞄点
        const initPagePosition = () => {
            let activeEle = document.getElementById(activeId);
            if (activeEle === null) {
                return;
            }
            activeEle.scrollIntoView();
        }

        document.addEventListener('readystatechange', initPagePosition);
        return () => {
            document.removeEventListener('readystatechange', initPagePosition);
        }
    }, [])

    if (tocDataArr.length == 0) {
        return <div></div>;
    }

    return (
        <aside className="helpTOC helpTOCRight">
            <div className="helpTOCTitle">文章内容</div>
            <ol className="toc">
                {
                    tocDataArr.map(l => (
                        <li className={classnames("toc-item")}>
                            <span className={"toc-level-" + l.level}>
                                <a className={classnames("toc-link", { isCurrent: activeId == l.title })} href={`#${l.title}`}>
                                    <span className="toc-text">{l.title}</span>
                                </a>
                            </span>
                        </li>
                    ))
                }
            </ol>
        </aside>
    )
}
