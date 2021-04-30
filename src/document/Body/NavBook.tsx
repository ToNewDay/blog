import React, { useState, useEffect, useCallback, useMemo, Fragment, ReactElement, Children, ReactChild, ReactHTMLElement, ReactComponentElement, ReactHTML } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { IDocumentCategories, IDocumentBookInfo } from '../../common/constants';
import { Link } from 'react-router-dom';
import DocLink from '../../component/DocLink';

export interface INavBookProps {
    bookInfo: IDocumentBookInfo;
    activePath: string;
    onDocClick?: (pageContent?: string) => void;
    onSectionClick?: () => void;
}

export function NavBook(props: INavBookProps) {
    const [activeIndexArr, setActiveIndexArr] = useState<Array<string>>([]);
    const { bookInfo, activePath } = props;
    const [currentBookinfo, setCurrentBookinfo] = useState<IDocumentBookInfo>(bookInfo);
    const realPath = activePath.replace('/docs/', '');

    const handleClick = useCallback((info: IDocumentCategories) => {
        _.set(currentBookinfo, ['categories', ...info.indexArr, 'isExpend'], !info.isExpend);
        setCurrentBookinfo({
            ...currentBookinfo
        });
        if (props.onDocClick == undefined) {
            return;
        }
        props.onDocClick(info.content);
    }, [props.onDocClick]);

    //递归构造子级
    const buildLinkContent = useCallback((param?: IDocumentCategories) => {
        if (!param || !param.links) {
            return '';
        }
        const links = _.get<IDocumentCategories, 'links', Array<IDocumentCategories>>(param, 'links', []);

        const sameLvlHasLinks = links.find((m: any) => m.links != undefined && m.links.length != 0);
        if (sameLvlHasLinks) {
            //同级元素有子级
            return links.map(info => {
                return (
                    <div className={classnames("helpThirdNav", { isExpanded: param.isExpend })} >
                        <div
                            className="helpNavTitle"
                            onClick={() => {
                                handleClick(info)
                            }}
                        >
                            <DocLink className={classnames("category", { isSectionActive: info.path == realPath })} to={info.path}  >{info.title}</DocLink>
                            {(info.links) ? (<span className={classnames("arrow", { isExpanded: info.isExpend })} ></span>) : ''}
                        </div>
                        {buildLinkContent(info)}
                    </div >
                )
            })
        } else {
            //同级没子级
            return (
                <ol className={classnames("helpNavLinks", { isExpanded: param.isExpend })}>
                    {links.map(info => {
                        return (
                            <li
                                className={classnames("helpNavLinkItem", { isActive: info.path == realPath })}
                                onClick={() => {
                                    handleClick(info)
                                }}
                            >
                                <DocLink className='helpNavLink' to={info.path}  >{info.title}</DocLink>
                            </li>
                        )
                    })}
                </ol>
            )
        }
    }, [realPath, handleClick, activeIndexArr]);


    //构造 root 级
    const buildCategoriesContent = useCallback((param?: Array<IDocumentCategories>) => {
        if (!param) {
            return '';
        }
        return param.map(info => {
            const isCurrentPage = info.path === realPath;
            if (isCurrentPage
                && (activeIndexArr.length == 0
                    || _.get(bookInfo.categories, info.indexArr, {}).path !== realPath
                )
            ) {
                setActiveIndexArr(info.indexArr ? info.indexArr : []);
            }
            if (info.links == undefined || info.links.length == 0) {
                return (
                    <li
                        className="helpNavSection"
                        onClick={() => {
                            handleClick(info)
                        }}
                    >
                        <DocLink className={classnames("helpNavTitleLink", { isSectionActive: isCurrentPage })} to={info.path}  ><span className='category' >{info.title}</span></DocLink>
                    </li>
                )
            }
            return (
                <li className="helpNavSection"  >
                    <div
                        className={classnames("helpNavTitle", { isExpanded: info.isExpend })}
                        onClick={() => {
                            handleClick(info)
                        }}
                    >
                        <DocLink className={classnames("category", { isSectionActive: isCurrentPage })} to={info.path}  >{info.title}</DocLink>
                        <span className={classnames("arrow", { isExpanded: info.isExpend })}></span>
                    </div>
                    {buildLinkContent(info)}
                </li>
            )
        })
    }, [realPath, handleClick, activeIndexArr]);

    return (
        <div className="helpNavBook isActive">
            <div
                className="helpNavBookHead"
                onClick={() => {
                    if (props.onSectionClick) {
                        props.onSectionClick();
                    }
                }}
            >
                <div className="helpNavBookName"  ><span className="icon" style={{ backgroundSize: 'cover', background: `url(/${bookInfo.icon})  center center` }}  ></span><span
                    className="name">{bookInfo.title}</span></div>
                <div className="selectArrow"></div>
            </div>
            <div className="helpNavDivider"></div>
            <ol className="helpNavBookBody">
                {
                    buildCategoriesContent(currentBookinfo.categories)
                }
            </ol>
        </div>
    )
}
