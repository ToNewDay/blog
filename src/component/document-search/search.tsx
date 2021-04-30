import React, { useState, useEffect, ReactElement, useMemo, useCallback } from 'react';
import useDebounce from '../use-debounce';
import './style.scss';
import _, { debounce } from 'lodash';
import { useHistory } from 'react-router-dom';


const { v4: uuidv4 } = require('uuid');

export interface DataItem {
    route: string,
    content: React.ReactElement | string,
    categorie: string
}

interface TabItemProps {
    key: string;
    name: string;
}

interface SearchResultProps {
    dataList: Array<DataItem>;
    searchKey: string;
    currentCategorie?: string;
    isShowResult: boolean;
}

interface SearchProps {
    dataUrl?: string;
    searchData?: Array<DataItem>;
    currentCategorie?: string;
    placeholder?: string;
    onSearchKeyChange?: (searchKey: string) => void;
}

function heighLightStr(
    str: string, searchKey: string, isStartWithSearchKey: boolean = false
): (ReactElement | string)[] {
    const result: (ReactElement | string)[] = [];
    const regex = new RegExp(searchKey, 'gi');
    if (regex.exec(str) == null) {
        result.push(str);
        return result;
    }

    const splitStr = uuidv4();
    const insertSplitStr = str.replace(regex, (matchStr) => {
        return splitStr + matchStr + splitStr;
    });
    insertSplitStr.split(splitStr).forEach(m => {
        if (regex.exec(m) == null) {
            result.push(m);
        } else {
            result.push(<span >{m}</span>)
        }
    });

    //是否在前十个字符中显示搜索词
    const firstStr = result[0] as string;
    if (isStartWithSearchKey && firstStr.length > 10) {
        result[0] = firstStr.substr(firstStr.length - 10, 10);
    }
    return result;
}

function getCategorie(str: string): string {
    return _.get(str.split('-'), '0', '');
}

function getCategorieTitle(str: string): string {
    const splitStrArr = str.split('-');
    if (splitStrArr.length <= 1) {
        return str;
    }
    return splitStrArr[splitStrArr.length - 1];
}

function SearchResult(props: SearchResultProps): ReactElement {
    const { searchKey, dataList, currentCategorie, isShowResult } = props;
    const [activeKey, setActiveKey] = useState<string>('');
    const [showResult, setShowResult] = useState<boolean>(isShowResult);
    const history = useHistory();
    //搜索词变化时，重置选中状态
    useEffect(() => {
        setActiveKey(currentCategorie == null ? '' : currentCategorie);
    }, [searchKey]);

    const buildTabItem = useCallback((props: TabItemProps) => {
        return (
            <div
                key={props.key}
                onClick={() => {
                    setActiveKey(props.key);
                }}
                className={props.key == activeKey ? "active" : ''}
            >
                {props.name}
            </div>
        )
    }, [setActiveKey, activeKey]);

    //考虑当前选中的分类搜索为空，但是其他分类有数据的情况。类别选项，与 activekey 的变化无关
    const categoriesList = useMemo(() => {
        let categoriesList = dataList.map(m => getCategorie(m.categorie)).filter(m => m != '');
        categoriesList = _.uniq(categoriesList);
        if (activeKey != '' && categoriesList.indexOf(activeKey) == -1) {
            categoriesList.push(activeKey);
        }
        return categoriesList;
    }, [dataList]);

    const tab = useMemo(() => {
        let tabList = categoriesList.map(categorieInfo => (buildTabItem({ key: categorieInfo, name: categorieInfo })));
        if (tabList.length <= 1) {
            return <div></div>
        }
        //添加“全部”筛选项
        if (categoriesList.indexOf('') == -1) {
            tabList = _.union([buildTabItem({ key: '', name: '全部' })], tabList);
        }
        return <div className="categorieTab" >{tabList}</div>;
    }, [dataList, activeKey])

    if (searchKey == '') {
        return <div></div>;
    }

    const searchResultList = dataList.filter(d => activeKey == '' || activeKey == getCategorie(d.categorie));
    if (!showResult) {
        return <div></div>
    }

    return (
        <div className="searchContent">
            {tab}
            {(searchResultList.length == 0) ? (
                <div className="searchEmpty" >
                    无相关搜索结果，请重新搜索
                </div>
            ) : (
                    searchResultList.map(m => {
                        const titleStr = getCategorieTitle(_.get(m, 'categorie', '') as string);
                        const contentArr = heighLightStr(_.get(m, 'content', '') as string, searchKey, true);
                        const title = heighLightStr(titleStr, searchKey);
                        return (
                            <div
                                key={m.categorie}
                                className="item"
                                onClick={() => {
                                    history.push(m.route);
                                    setShowResult(false);
                                }}
                            >
                                <div className="titleLogo" >
                                    {getCategorie(m.categorie)}
                                </div>
                                <div>
                                    <div className="title"  >{title}</div>
                                    <div className="desc" >{contentArr}</div>
                                </div>
                            </div>
                        )
                    })
                )
            }
        </div>
    )
}

export function Search(props: SearchProps) {
    const [searchKey, setSearchKey] = useState('');
    const [sourceData, setsourceData] = useState([]);
    const [showSearchResult, setShowSearchResult] = useState(false);
    const debouncedSearchKey = useDebounce(searchKey, 200);
    const searchResultData = useMemo(() => {
        let searchResultData: Array<DataItem> = [];
        if (debouncedSearchKey != '') {
            searchResultData = _.get(props, 'searchData', []).filter(m => m.categorie != undefined
                && ((m.content + m.categorie.replace(_.get(m.categorie.split('-'), '0', ''), '').replace(_.get(m.categorie.split('-'), '1', ''), '')) as string).indexOf(searchKey) != -1
            ) as Array<DataItem>;
        }
        return searchResultData
    }, [props.searchData, debouncedSearchKey]);

    const containerId = useMemo(() => {
        return uuidv4();
    }, []);

    useEffect(() => {
        const dealOutsideClick = (e: any) => {
            const pathArr = _.get(e, 'path', []) as { id: string }[];
            let isInSearchContainer = false;
            pathArr.forEach((m) => {
                if (_.get(m, 'id', '') == containerId) {
                    isInSearchContainer = true;
                }
            });
            setShowSearchResult(isInSearchContainer);
        }
        document.addEventListener('click', dealOutsideClick);
        return () => {
            document.removeEventListener('click', dealOutsideClick);
        }
    }, []);

    function handleSearchKeyChange(val: string) {
        setSearchKey(val);
        setShowSearchResult(true);
        if (props.onSearchKeyChange) {
            props.onSearchKeyChange(val);
        }
    }

    return (
        <div id={containerId} >
            <div className="searchContainer"   >
                <div className="search"  >
                    <input
                        placeholder={props.placeholder}
                        onChange={({ target: { value } }) => {
                            handleSearchKeyChange(value);
                        }}
                    />
                </div>
                {
                    <SearchResult
                        key={searchKey}
                        isShowResult={showSearchResult}
                        dataList={searchResultData}
                        searchKey={debouncedSearchKey}
                        currentCategorie={props.currentCategorie}
                    />
                }
            </div>
        </div>
    )
}
