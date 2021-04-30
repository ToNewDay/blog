import { NavBook, INavBookProps } from './NavBook';
import { INavSectionInfoProps, NavSection } from './NavSection';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IDocumentBookInfo } from '../../common/constants';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import '../style.scss';
import AsideMenu from './AsideMenu';
// import { navSectionList, bookList, getDefaultBookInfo } from './Util';
import util from './Util';

export default function Body(props: { searchKey?: string, hexoData: any }) {
    const history = useHistory();
    const pathName = history.location.pathname;
    const { navSectionList, bookList, getDefaultBookInfo } = useMemo(() => util(props.hexoData), [props.hexoData]);

    const { categoriesInfo, bookInfo } = useMemo(() => {
        let defaultBookInfo = getDefaultBookInfo(bookList, pathName);
        if (defaultBookInfo == null) {
            defaultBookInfo = { bookInfo: bookList[0], categoriesInfo: { content: '', title: '', path: '', indexArr: [] } };
        }
        return defaultBookInfo;
    }, [pathName, bookList, getDefaultBookInfo]);
    const [isNavigatorShow, setIsNavigatorShow] = useState<boolean>(false);
    const [currentBookInfo, setCurrentBookInfo] = useState<IDocumentBookInfo>(bookInfo);

    useEffect(() => {
        setCurrentBookInfo(bookInfo);
    }, [pathName]);
    const pageContent = categoriesInfo.content ? categoriesInfo.content : ''

    useEffect(() => {
        window.mermaid.init();
    }, [pathName])

    const navbook: INavBookProps = useMemo(() => {
        return {
            bookInfo: currentBookInfo,
            activePath: pathName
        }
    }, [currentBookInfo, pathName])


    const handleSectionClick = (sectionInfo: INavSectionInfoProps): void => {
        setIsNavigatorShow(false);
        const bookInfo = bookList.find(m => m.title === sectionInfo.title);
        if (bookInfo) {
            setCurrentBookInfo(bookInfo);
            if (bookInfo.defaultPage) {
                history.push(bookInfo.defaultPage);
            }
        }
    }

    return (
        <div className="helpContainer">
            <div className="helpContentWrapper">
                <div className="helpNavigation" id="asideMenuLeft" role="navigator">
                    <div className="helpNavigationInner">
                        <div className="helpNavHeading"><a href="http://help.coding.pages.oa.com"><span
                            className="arrow"></span>帮助中心主页</a></div>
                        <div className="helpNavBookArea">
                            <NavBook
                                key={_.get(navbook, 'bookInfo.title', '')}
                                {...navbook}
                                activePath={pathName}
                                onSectionClick={() => {
                                    setIsNavigatorShow(!isNavigatorShow);
                                }}
                            />
                            <NavSection
                                activeTitle={_.get(navbook, 'bookInfo.title', '')}
                                list={navSectionList}
                                isShowNavbook={isNavigatorShow}
                                onClick={handleSectionClick}
                            />
                        </div>
                    </div>
                </div>
                <div className="helpContent">
                    <article className="helpArticle markdown-body" >
                        <div key={pathName} dangerouslySetInnerHTML={{ __html: pageContent }}    ></div>
                    </article>
                    <AsideMenu key={pathName} pageContent={pageContent} activeHash={window.location.hash} />
                </div>
            </div>
        </div>
    )
}
