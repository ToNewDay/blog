const { series, parallel, src, dest } = require('gulp');
const Hexo = require('hexo');
const path = require('path');
const fs = require('hexo-fs');
const webpack = require('webpack');
const help = require('./scripts/lib/help');
const exec = require("child_process");
const _ = require("lodash");
const gitbookParse = require("./scripts/gitbookParse");
const basePath = process.cwd();
// gitbook 转换配置数组
const extendDocArr = [
    {
        dirName: 'react',
        staticDirName: 'imgs',
        navigation: {
            compendium: 'React',
            icon: 'docs/images/book-icons/react.svg',
        }
    },
    {
        dirName: 'frontend',
        staticDirName: '前端',
        navigation: {
            compendium: '前端',
            icon: 'docs/images/book-icons/quick-started.svg',
        }
    },
];

async function clean() {
    try {
        const removeDirArr = [path.resolve(basePath, 'dist'), path.resolve(basePath, 'hexo', 'docs'), path.resolve(basePath, 'hexo', 'db.json')];
        for (let i = 0; i < removeDirArr.length; i++) {
            const filePath = removeDirArr[i];
            if (await fs.exists(filePath)) {
                await fs.rmdir(filePath);
            }
        }
    } catch (e) {
        // do nothing
    }
}

function buildStaticHtml(cb) {
    const webpackConfig = require('./webpack.dev');
    webpack(webpackConfig, function (err, stats) {
        if (err) cb(err);
        process.stdout.write(`${stats.toString({ colors: true })}\n\n`);
        if (stats.hasErrors()) {
            cb(stats);
        } else {
            cb();
        }
    });
}

function buildDocumentSearch(cb) {
    process.chdir(path.resolve('lib', 'document-search'));
    const webpackConfig = require('./lib/document-search/webpack.config');
    webpack(webpackConfig, function (err, stats) {
        process.chdir(path.resolve('..', '..'));
        if (err) cb(err);
        process.stdout.write(`${stats.toString({ colors: true, })}\n\n`);
        if (stats.hasErrors()) {
            cb(stats);
        } else {
            cb();
        }
    });
}


function buildHexo(cb) {
    const hexoPath = path.resolve(basePath, 'hexo');
    const hexo = new Hexo(hexoPath, { config: path.resolve(hexoPath, '_config.yml') });
    hexo.public_dir = path.resolve(hexoPath, 'docs') + path.sep;
    hexo.config.public_dir = 'docs';
    hexo.env.init = true;
    const navigationPath = path.resolve(hexo.source.base, '_data', 'navigation.yml');
    fs.readFile(navigationPath).then((navigationData) => {
        const dataList = [];
        hexo.extend.processor.register('*.md', async function (file) {
            const fileRoute = `${file.params[1]}.html`;
            if (navigationData.indexOf(fileRoute) == -1) {
                // 文件无路由
                return;
            }
            const sourceFileStr = await fs.readFileSync(path.resolve(hexo.source.base, file.path));
            dataList.push({
                route: fileRoute,
                content: help.replaceMd(sourceFileStr),
            });
        });


        hexo.on('generateAfter', () => {
            const searchIndexPath = path.resolve(basePath, 'src', 'assert', 'search.json');
            const navigationSitmapData = hexo.locals.toObject().data.navigation.sitemap;
            for (let i = 0; i < dataList.length; i++) {
                const info = dataList[i];
                dataList[i] = {
                    ...info,
                    route: `/docs/${info.route}`,
                    categorie: help.getUrlCategorieStr(navigationSitmapData, info.route)
                };
            }
            fs.writeFile(searchIndexPath, JSON.stringify(dataList));
        });


        const replaceRulList = [
            { searchReg: /hintstyle([\s\S]*?)end/g, replaceVal: "<div  class='$1' >" },// 替换 md gitbook 自定义样式为html
            { searchReg: /endhint/g, replaceVal: "</div>" },// 替换 md 文档内跳转为到html
        ];
        hexo.extend.filter.register('after_post_render', function (data) {
            replaceRulList.forEach(m => {
                data.content = data.content.replace(m.searchReg, m.replaceVal);
            });
            return data;
        });
        hexo.init().then(() => {
            hexo.call("generate", {
                watch: false
            }).then(function () {
                hexo.exit();
            }).catch(function (err) {
                hexo.exit(err);
            });
        });

        hexo.on('exit', cb);
    });
}

async function buildGitbookDoc() {
    await gitbookParse(extendDocArr);
}

async function docImgCopy() {
    for (let i = 0; i < extendDocArr.length; i++) {
        const docInfo = extendDocArr[i];
        if (docInfo.staticDirName) {
            const source = path.resolve(basePath, 'hexo', 'source', docInfo.dirName, docInfo.staticDirName);
            const des = path.resolve(basePath, 'public', 'docs', docInfo.dirName, docInfo.staticDirName);
            console.log(`copy ${source} to ${des}`);
            fs.copyDir(source, des);
        }
    }
}


async function dbJsonCopy() {
    const source = path.resolve(basePath, 'hexo', 'db.json');
    const des = path.resolve(basePath, 'build', 'db.json');
    console.log(`copy ${source} to ${des}`);
    fs.copyFile(source, des);
    fs.copyFile(source, path.resolve(basePath, 'public', 'db.json'));
}

function copyDocsFile(cb) {
    const copyFileTaskList = [];
    fs.listDir(path.resolve(basePath, 'hexo', 'docs')).then((data) => {
        data.filter(m => m.indexOf('.html') == -1).forEach((m) => {
            source = path.resolve(basePath, 'hexo', 'docs', m);
            des = path.resolve(basePath, 'build', 'docs', m);
            console.log(`copy ${source} to ${des}`);
            copyFileTaskList.push(fs.copyFile(source, des));
        });
        Promise.all(copyFileTaskList).then(() => {
            cb();
        });
    });
}

exports.buildHexo = buildHexo;
exports.buildGitbookDoc = buildGitbookDoc;
exports.clean = clean;
exports.docImgCopy = docImgCopy;
exports.copyDocsFile = copyDocsFile;
exports.dbJsonCopy = dbJsonCopy;
exports.default = series(clean, buildGitbookDoc, buildHexo, docImgCopy);
