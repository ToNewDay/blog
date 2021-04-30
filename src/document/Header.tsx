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
                        <div>
                            三月的博客
                        </div>
                        <div className='global-search'>
                            <DocumentSearch onSearchKeyChange={props.onSearchKeyChange} searchData={searchData as Array<DataItem>} placeholder="" />
                        </div>
                        
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
