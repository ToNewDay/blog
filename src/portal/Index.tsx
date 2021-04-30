import React, { Fragment } from 'react';
import Header from './Header';
import { Feature } from './Feature';
import { GuideItem } from './GuideItem';
import './portal.scss';
import Footer from './Footer';
import { GUID_DATA, FEATURE_DATA } from '../common/constants/index';
import TabContent from './TabContent';
import { Link } from 'react-router-dom';
import FaqSvg from '../assert/svg/index-faq.svg';
import QuickStartSvg from '../assert/svg/index-quick-start.svg';


export default function Index() {
    return (
        <Fragment>
            <div className="container index-container">
                <div className="content layout">
                    <section className="banner-section">
                        <Header />
                        <div className='tab-content'>
                            <div className='des-info' >
                                <div className='des-content' >
                                    <Link to='/docs/quick-start/coding.html' >
                                        <div className='des-img' >
                                            <img src={QuickStartSvg} />
                                        </div>
                                        <div>
                                            <div className='des-title'>快速入门指南</div>
                                            <div className='des-body'>五分钟入门，快速创建项目添加成员，登记代码库。</div>
                                        </div>
                                    </Link>
                                </div>
                                <div className='des-divider' ></div>
                                <div className='des-content' >
                                    <Link to='/docs/faq/INTRO.html' >
                                        <div className='des-img'>
                                            <img src={FaqSvg} />
                                        </div>
                                        <div>
                                            <div className='des-title' >问答 & 更新</div>
                                            <div className='des-body'>记录用户常见问答和 Coding 平台功能特性更新及缺陷修复等。</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="main-section">
                        <div className="section-content">
                            <div className="main-content">
                                <div className="guide-box">
                                    {GUID_DATA.map(m => (<GuideItem {...m} />))}
                                </div>
                                {FEATURE_DATA.map(data => (<Feature {...data} />))}
                            </div>
                        </div>
                    </section>
                    <Footer />
                </div>
            </div>
        </Fragment>
    )
}
