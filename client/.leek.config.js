const path = require('path');

module.exports = {
    "projectType": "react",
    "prefix": "",
    "publicPath": "/static/",
    "dist": "../../dist",
    "clientAlias": "client",
    "isInlineCss": "false",
    "leekConfig": "./.leekConfig/",
    "leekWebpackConfigDir": "{{leekConfig}}/webpack/",
    "leekManifsetDir": "{{leekConfig}}/manifest/",
    "configIn": "client",
    "client": {
        "assetsDir": "./assets/",
        "vendorDir": "vendor/",
        "sourceDir": "./src",
        "dll": {
            commonJsName: '',
            commonCssName: '',
            "vendors": [
                "core-js",
                "react",
                "react-dom",
                "lodash",
                "axios",
                "antd",
            ],
            "css": [
                path.resolve(__dirname, './src/common/static/css/base.scss')
            ],
            sassIncludePaths: [
                path.resolve(__dirname, './src/'),
            ],
            resolve: {},
            module: {},
            plugins: [],
        },
        "common": {
            template: ' ',
            resolve: {
            },
            sassIncludePaths: [
                path.resolve(__dirname, './src/'),
            ],
            module: {},
            plugins: [],
        },
        'base': {
            template: '',
            watchOptions: {},
            resolve: {},
            sassIncludePaths: [
                path.resolve(__dirname, './src/'),
            ],
            module: {
            },
            plugins: [],
        },
    },
    "server": {
        "relPath": "../../",
        "contentPath": [
            "src/#",
            "package.json"
        ],

    }
}