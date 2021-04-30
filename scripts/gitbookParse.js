const gitbookParsers = require("gitbook-parsers");
const parser = gitbookParsers.getForFile("FILE.md");
const fs = require('hexo-fs');
const yaml = require('js-yaml');
const path = require('path');

const fileRootPath = path.resolve('hexo', 'source');


/**
 * 解析 summary 文件
 * @param {string} pathStr summary 文件路径 
 */
function getSummaryJson(pathStr) {
    const fileResult = fs.readFileSync(pathStr);
    return parser.summary(fileResult);
}

/**
 * 解析目录文件
 * @param {string} pathStr navigation.yml 路径位置 
 */
function getNavigation(pathStr) {
    return yaml.safeLoad(fs.readFileSync(pathStr));
}

/**
 * 转换数据为 yml 并写入到文件
 * @param {object} data 数据
 * @param {string} descPath 文件路径 
 */
function writeNavigation(data, descPath) {
    const content = yaml.safeDump(data);
    fs.unlinkSync(descPath);
    fs.writeFileSync(descPath, content);
}

/**
 * 替换 md 后缀
 * @param {string} str 
 */
function replaceMdExtend(str) {
    if (str == null || str == undefined) {
        return '';
    }
    return str.replace('.md', '.html');
}
/**
 * 转换 summary 目录对象为 categories 对象
 * @param {array} summaryArr  summary 对象
 * @param {string} rootPath summary 根目录
*/
function convertSummaryCategories(summaryArr, rootPath) {
    const result = [];
    rootPath = rootPath;
    for (let i = 0; i < summaryArr.length; i++) {
        const summaryInfo = summaryArr[i];
        const categorieInfo = {
            title: summaryInfo.title,
        };

        if (summaryInfo.path != null) {
            let pathTemp = summaryInfo.path;
            if (pathTemp.indexOf(":/") != -1 && pathTemp.indexOf("://") == -1) {
                pathTemp = pathTemp.replace(":/", "://");
            }
            summaryInfo.path = pathTemp;
        }


        if (summaryInfo.articles.length == 0) {
            categorieInfo.path = /(http:|https:)/.exec(summaryInfo.path) == null ? (rootPath + replaceMdExtend(summaryInfo.path)) : summaryInfo.path;;
            result.push(categorieInfo);
            continue;
        }

        if (summaryInfo.path != null) {
            categorieInfo.rootPath = /(http:|https:)/.exec(summaryInfo.path) == null ? (rootPath + replaceMdExtend(summaryInfo.path)) : summaryInfo.path;
        }
        const contentSonList = summaryInfo.articles.filter(m => m.path != null);

        if (contentSonList.length != 0) {
            const firstSonPathArr = contentSonList[0].path.split('/');
            categorieInfo.path = rootPath + firstSonPathArr[0];
        }

        // 判断子级
        const sections = convertSummaryCategories(summaryInfo.articles, rootPath);
        if (sections.filter(m => m.sections != undefined
            || (m.links != undefined && m.links.length != 0)).length == 0
        ) {
            categorieInfo.links = sections;
        } else {
            categorieInfo.sections = sections;
        }
        result.push(categorieInfo);
    }
    return result;
}

/**
 * 合并目录配置数据
 * @param {object} categorieInfo 
 * @param {object} navigationInfo 
 */
function mergerNavigation(categorieInfo, navigationInfo) {
    const sitemap = navigationInfo.sitemap.filter(m => m.path != categorieInfo.path);
    sitemap.push(categorieInfo);
    return {
        ...navigationInfo,
        sitemap: sitemap
    };
}

/**
 * 写 gitbook 目录文件为 hexo 目录文件
 * @param {object} docInfo 
 */
async function navigationConvert(docInfo) {
    const dirName = docInfo.dirName;
    console.log(`navigationConvert dir name：${dirName}`);

    let fileResult = await fs.readFile(path.resolve(fileRootPath, dirName, 'SUMMARY.md'));
    fileResult = fileResult.replace(/[\b]/g, '');
    const summary = await parser.summary(fileResult);
    // 转换为 hexo 目录数据
    const convertedCateInfo = convertSummaryCategories(summary.chapters.filter(c => c.title != 'Introduction'), `${dirName}/`);
    // 读 hexo 目录文件获取结构化数据
    const navigationPath = path.resolve(fileRootPath, '_data', 'navigation.yml');
    const navigationInfo = getNavigation(navigationPath);
    // 合并 gitbook summary 目录文件数据
    const mergeredNavigation = mergerNavigation({
        ...docInfo.navigation,
        path:`${dirName}/` ,
        categories: convertedCateInfo
    }, navigationInfo);
    // 写合并后的文件到本地
    writeNavigation(mergeredNavigation, navigationPath);
}

/**
 * 处理gitbook 文档内容，做兼容 hexo 处理
 * @param {object} docInfo 
 */
async function gitbookDocContentCovnert(docInfo) {
    const replaceRulList = [
        { searchReg: /\n-{3,}/g, replaceVal: '\n<hr />\n' },// 替换markdown ---  为 ------ ，--- 分隔符已被 hexo-front-matter 使用。
        { searchReg: /\.md/g, replaceVal: '.html' },// 替换 md 文档内跳转为到html
        { searchReg: /{% hint style="([\s\S]*?)" %}/g, replaceVal: "hintstyle$1end" },// 替换 md gitbook 自定义样式为html
        { searchReg: /> \[!NOTE\|style:flat\]([\s\S]*?)\n\n/g, replaceVal: "hintstyleflatend$1\n\nendhint" },// 替换 md gitbook 自定义样式为html
        { searchReg: /> \[!WARNING\|style:flat\]([\s\S]*?)\n\n/g, replaceVal: "hintstyleflat flat-warningend$1\n\nendhint" },// 替换 md gitbook 自定义样式为html
        { searchReg: /> \[!TIP\|style:flat\]([\s\S]*?)\n\n/g, replaceVal: "hintstyleflat flat-tipend$1\n\nendhint" },// 替换 md gitbook 自定义样式为html
        { searchReg: /{% endhint %}/g, replaceVal: " endhint " },// 替换 md 文档内跳转为到html
    ];

    const gitbookDocDir = path.resolve(fileRootPath, docInfo.dirName);
    const filePathList = await fs.listDir(gitbookDocDir);
    for (let i = 0; i < filePathList.length; i++) {
        const filePath = path.resolve(gitbookDocDir, filePathList[i]);
        if (filePath.indexOf('.md') == -1) {
            continue;
        }
        let content = await fs.readFile(filePath);
        replaceRulList.forEach(m => {
            content = content.replace(m.searchReg, m.replaceVal);
        });
        await fs.unlink(filePath);
        await fs.writeFile(filePath, content);
    }
}

module.exports = async function gitbookParse(gitbookDocArr) {
    for (let i = 0; i < gitbookDocArr.length; i++) {
        const extendSys = gitbookDocArr[i];
        // 写 gitbook 目录文件为 hexo 目录文件
        await navigationConvert(extendSys);
        // 处理gitbook 文档内容，做兼容 hexo 处理
        await gitbookDocContentCovnert(extendSys);
    }
};
