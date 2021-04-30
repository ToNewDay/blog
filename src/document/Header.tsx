import React, { Fragment } from 'react';
import { DataItem, Search as DocumentSearch } from '../component/document-search/search';
import searchData from '../assert/search.json';
import './style.scss';

export default function Header(props: { onSearchKeyChange?: (val: string) => void }) {
    return (
        <Fragment>
            <div className="header-container no-touch">
                <div className="header-content clearfix">
                    <div className="header-body">
                        <div className="logo">
                            <a href="http://help.coding.pages.oa.com/">
                                <span className="img">
                                    <img src="https://coding-net-production-pp-ci.codehub.cn/f9cadf79-6b98-46a2-87fe-602f2f416fbc.png" />
                                </span>
                                <span className="divider"></span>
                                <span className="words">帮助中心</span>
                            </a>
                        </div>
                        <div className='global-search'>
                            <DocumentSearch onSearchKeyChange={props.onSearchKeyChange} searchData={searchData as Array<DataItem>} placeholder="在文档中搜寻答案，如输入「持续集成」" />
                        </div>
                        <div className="header-right">
                            <div className="nav">
                                <div className="nav-item">
                                    <span>
                                        <a target="_blank" rel="noopener" href="http://tencent.coding.oa.com/user">前往工作台</a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
