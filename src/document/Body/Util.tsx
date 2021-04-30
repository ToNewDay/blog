import { INavSectionInfoProps } from './NavSection';
// import hexoData from '../../assert/db.json';
import { IDocumentCategories, IDocumentBookInfo, BOOK_DEFAULT_PAGE } from '../../common/constants';
import _ from 'lodash';

export default function (hexoData: any) {

    const sitMapData = _.get(hexoData, 'models.Data[0].data.sitemap', []);
    const pageData = _.get(hexoData, 'models.Page', []);

    function convertHexoDataToBookData(data: any, indexArr: Array<string>): Array<IDocumentCategories> {
        const result: Array<IDocumentCategories> = [];
        for (let i = 0; i < data.length; i++) {
            const info = data[i];
            const tempInfo: IDocumentCategories = {
                title: info.title as string,
                path: ((info.rootPath) ? info.rootPath : info.path) as string,
                indexArr: [...indexArr, i.toString()]
            };
            if (info.links != undefined || info.sections != undefined) {
                tempInfo.links = convertHexoDataToBookData(info.links == undefined ? info.sections : info.links, [...tempInfo.indexArr, 'links']);
            }

            const pageInfo = pageData.find((p: any) => p.path === tempInfo.path);
            if (pageInfo != undefined) {
                tempInfo.content = pageInfo.content;
            }
            result.push(tempInfo);
        }
        return result;
    }

    const bookList: Array<IDocumentBookInfo> = [];
    for (let i = 0; i < sitMapData.length; i++) {
        const sitInfo = sitMapData[i];
        bookList.push({
            title: sitInfo.compendium,
            defaultPage: (BOOK_DEFAULT_PAGE.get(sitInfo.compendium) == undefined ? '' : BOOK_DEFAULT_PAGE.get(sitInfo.compendium)) as string,
            categories: convertHexoDataToBookData(sitInfo.categories, []),
            icon: sitInfo.icon
        });
    }

    const navSectionList: Array<INavSectionInfoProps> = bookList.map(bookInfo => ({
        title: bookInfo.title, icon: bookInfo.icon
    }));

    function getActiveInfo(param: Array<IDocumentCategories>, pathName: string): (IDocumentCategories | null) {
        if (param == null || param == undefined) {
            return null;
        }
        const result = param.find(m => m.path === pathName);
        if (result) {
            return result;
        }
        for (let i = 0; i < param.length; i++) {
            const links = param[i].links
            if (links == undefined) {
                continue;
            }
            const tempResult = getActiveInfo(links, pathName);
            if (tempResult) {
                return tempResult;
            }
        }
        return null;
    }

    const getDefaultBookInfo = (
        bookList: Array<IDocumentBookInfo>,
        pathName: string): ({ bookInfo: IDocumentBookInfo, categoriesInfo: IDocumentCategories } | null) => {
        const realPath = pathName.replace("/docs/", "");
        for (let n = 0; n < bookList.length; n++) {
            const bookInfo = bookList[n];
            const categories = bookInfo.categories ? bookInfo.categories : [];
            const activeInfo = getActiveInfo(categories, realPath);
            if (activeInfo == null) {
                continue;
            }
            //添加 bookInfo 的 expend
            const indexArr = ['categories'];
            for (let i = 0; i < activeInfo.indexArr.length; i++) {
                indexArr.push(activeInfo.indexArr[i]);
                if (_.get(bookInfo, indexArr, {}).links == undefined) {
                    continue;
                }
                _.set(bookInfo, [...indexArr, 'isExpend'], true);
            }
            return {
                bookInfo: bookInfo,
                categoriesInfo: activeInfo
            };
        }
        return null;
    }

    return {
        bookList, navSectionList, getDefaultBookInfo
    }

}




