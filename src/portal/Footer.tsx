import React from 'react';
import enChatPng from '../assert/willionpan.png';
import './portal.scss';

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer">
                <div className="left">
                    <a href="http://coding.oa.com">
                        <img
                            className="logo"
                            src="https://coding-net-production-pp-ci.codehub.cn/e23c08e6-00b2-497d-b2cf-b074c7135fca.png"
                        />
                    </a>
                    <div className="tips">由 CSIG 质量部维护</div>
                </div>
                <div className="us">
                    <div className="us-row">
                        <div className="us-col item1">
                            <h3>联系</h3>
                            <ul className="list">
                                <li>
                                    <div className="share">
                                        企业微信：
                                            <div className="share-item qrcode weixin">
                                            <div className="share-img">腾讯云助手</div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mobile-hr first"></div>
            </div>
        </footer>
    )
}
