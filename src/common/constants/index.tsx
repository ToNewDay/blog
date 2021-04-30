import QuickStartedSvg from '../../assert/svg/quick-started.svg';
import RDSpecificationsSvg from '../../assert/svg/R-D-Specifications.svg';
import CodingCiSvg from '../../assert/svg/CODING-CI.svg';
import CodeIconSvg from '../../assert/svg/code-icon.svg';
import QTASvg from '../../assert/svg/QTA.svg';
import ArtifactRepositoriesSvg from '../../assert/svg/Artifact-Repositories.svg';
import CDSvg from '../../assert/svg/CD.svg';
import FAQSvg from '../../assert/svg/FAQ.svg';
import IconEnvironmentSvg from '../../assert/svg/yunqi.svg';
import IconSettingCenterSvg from '../../assert/svg/CONFIG-CENTER.svg';
export interface IDocumentCategories {
    title: string;
    path: string;
    links?: Array<IDocumentCategories>;
    indexArr: Array<string>;
    isExpend?: boolean;
    content?: string;
}

export interface IDocumentBookInfo {
    icon: string;
    defaultPage: string;
    title: string;
    categories?: Array<IDocumentCategories>;
}

export const BOOK_DEFAULT_PAGE: Map<string, string> = new Map<string, string>([
    ['快速入门', '/docs/quick-start/coding.html'],
    ['测试管理', '/docs/test/intro/overview.html'],
    ['文档管理', '/docs/management/api/start.html'],
    ['持续集成', '/docs/ci/快速入门/QCI-concept.html'],
    ['持续部署', '/docs/cd/README.html'],
    ['自动化测试', '/docs/qta/INTRO.html'],
    ['制品库', '/docs/artifacts/README.html'],
    ['代码分析', '/docs/code-analysis/quickstart/introduction.html'],
    // ['研发规范', '/docs/RD-specifications/README.html'],
    ['代码管理', '/docs/code-management/INTRO.html'],
    ['问答 & 更新', '/docs/faq/INTRO.html'],
    ['配置中心', '/docs/config-center/INTRO.html'],
    ['环境管理', '/docs/yunqi/README.html'],
    ['Coding公共库API','/docs/config-api-public/api/projects.html']
]); 

// 文档模块的排序
export const BOOK_NAV_SORT: Array<string> = ['快速入门', '代码管理', '持续集成', '代码分析', '自动化测试', '环境管理', '测试管理', '制品库', '持续部署', '配置中心', '文档管理', '问答 & 更新','Coding公共库API'];

export interface GuideItemProps {
    title: string;
    content: string;
    titleEn: string;
    url: string;
    icon: string;
    className: string;
}


export const GUID_DATA: Array<GuideItemProps> = [
    {
        title: '代码管理',
        content: '代码库登记，分支工作流设置，规范团队研发模式。',
        titleEn: 'CODE MANAGEMENT',
        url: 'code-management/INTRO.html',
        icon: RDSpecificationsSvg,
        className: 'item1'
    },
    {
        title: '持续集成',
        content: '在构建集成基础上，更关注流程整合、数据串联和自动集成。',
        titleEn: 'CONTINUOUS INTEGRATION',
        url: 'ci/快速入门/QCI-concept.html',
        icon: CodingCiSvg,
        className: 'item2'
    },
    {
        title: '代码分析',
        content: '通过代码检查，度量，统计等功能，发现代码质量问题和异味。',
        titleEn: 'CODE ANALYSIS',
        url: 'code-analysis/quickstart/introduction.html',
        icon: CodeIconSvg,
        className: 'item3'
    },
    {
        title: '自动化测试',
        content: '一站式自动化测试解决方案, 提高研发质量和研发测试效率。',
        titleEn: 'Quick Test Automation',
        url: 'qta/INTRO.html',
        icon: QTASvg,
        className: 'item5'
    },
    {
        title: '制品库',
        content: '无缝对接CI CD流程，管理构建产物。',
        titleEn: 'ARTIFACTS',
        url: 'artifacts/introduction.html',
        icon: ArtifactRepositoriesSvg,
        className: 'item2'
    },
    {
        title: '持续部署',
        content: '旨在覆盖更多更全的发布场景，打造高效可控的持续部署服务。',
        titleEn: 'CONTINUOUS DEPLOYMENT',
        url: 'cd/README.html',
        icon: CDSvg,
        className: 'item3'
    },
    {
        title: '环境管理',
        content: '从资源描述到组件部署的测试环境管理服务。',
        titleEn: 'CLOUDLAB ENVIRONMENT',
        url: 'yunqi/README.html',
        icon: IconEnvironmentSvg,
        className: 'item5'
    },
    {
        title: '配置中心',
        content: '提供配置管理功能，包括配置项加解密、版本管理等功能。',
        titleEn: 'CONFIG CENTER',
        url: 'config-center/INTRO.html',
        icon: IconSettingCenterSvg,
        className: 'item1'
    }
];


export interface FeatureItemProps {
    text: string;
    url: string;
}

export interface FeatureProps {
    title: string;
    list: Array<FeatureItemProps>
}


export const FEATURE_DATA: Array<FeatureProps> = [
    {
        title: '阅读这些功能文档',
        list:
            [
                
                { text: 'Coding 公共库 API', url: 'config-api-public/api/projects.html' },
                { text: '创建项目', url: 'quick-start/project-new.html' },
                { text: '添加成员', url: 'quick-start/project-members.html' },
                { text: '代码管理', url: 'code-management/INTRO.html' },
                { text: '研发规范', url: 'RD-specifications/README.html' },
                { text: '创建集成任务', url: 'ci/快速入门/QCI-first-steps.html' },
                { text: '开启代码分析', url: 'code-analysis/quickstart/quickstart.html' },
                { text: '单元测试', url: 'qta/app/unittest/INTRO.html' },
                { text: '持续部署', url: 'cd/README.html' },
                // { text: '制品库', url: 'artifacts/introduction.html' },
            ]
    },
    {
        title: '更多精彩内容',
        list:
            [
                { text: 'CODING IWIKI', url: 'https://iwiki.oa.tencent.com/pages/viewpage.action?pageId=97520090' },
                { text: 'CODING K吧 ', url: 'http://km.oa.com/group/47011' },
                { text: 'CODING 码客圈子', url: 'http://mk.oa.com/coterie/556/home' },
                { text: 'CODING SLA服务承诺', url: 'https://csig.lexiangla.com/teams/k100145/docs/f7d5e3f6643811ebbeb9661d756d4c44' },
                { text: 'CODING云知', url: 'https://csig.lexiangla.com/teams/k100145?company_from=csig' },
            ]
    },

];
