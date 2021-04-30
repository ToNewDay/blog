import React, { Fragment, useState, useEffect } from 'react';
import Header from './Header';
import Body from './Body/Index';
import { useHistory, useLocation } from 'react-router-dom';
import { HexoDataContext } from '../context';



export default function Index() {
    const [searchKey, setSearchKey] = useState('');
    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);//滚动条置顶
    }, [location.pathname]);
    return (
        <Fragment>
            <div className="help_container">
                <Header onSearchKeyChange={setSearchKey} />
                <HexoDataContext.Consumer>
                    {hexoData => <Body searchKey={searchKey} hexoData={hexoData} />}
                </HexoDataContext.Consumer>
            </div>
        </Fragment>
    )
}
