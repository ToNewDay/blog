import React, { Fragment } from 'react';
import './portal.scss';
import bgImg from '../assert/header-bg.png';
import searchData from '../assert/search.json';
import { DataItem, Search as DocumentSearch } from '../component/document-search/search';
export default function Header() {
    return (
        <Fragment>
            <div className="section-bg">
                <div className="bg-box">
                    <img className="img pc-img" src={bgImg} />
                </div>
            </div>
            <div className="header-container no-touch">
                <div className="header-content clearfix">
                    <div className="header-body">
                        <div className="logo">
                            <div className="img">
                                <img
                                    src="https://coding-net-production-pp-ci.codehub.cn/e23c08e6-00b2-497d-b2cf-b074c7135fca.png" />
                            </div>
                            <div className="divder"></div>
                            <span className="words">帮助中心</span>
                        </div>
                        <div className="nav">
                            <div className="nav-item">
                                <span><a href="http://tencent.coding.oa.com">前往工作台</a></span>
                            </div>
                        </div>
                        <div className="icon">
                            <span className="nav-trigger"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="section-container">
                <div className="info">
                    <h2>CODING DevOps 在线支持</h2>
                    <DocumentSearch searchData={searchData as Array<DataItem>} placeholder="在文档中搜寻答案，如输入「持续集成」" />
                </div>
            </div>
        </Fragment>
    )
}
