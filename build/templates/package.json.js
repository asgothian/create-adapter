"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = (answers) => __awaiter(this, void 0, void 0, function* () {
    const isAdapter = answers.features.indexOf("Adapter") > -1;
    const isWidget = answers.features.indexOf("Adapter") > -1;
    const useTypeScript = answers.language === "TypeScript";
    const useTSLint = answers.tools && answers.tools.indexOf("TSLint") > -1;
    const useESLint = answers.tools && answers.tools.indexOf("ESLint") > -1;
    const useNyc = answers.tools && answers.tools.indexOf("Code coverage") > -1;
    const devDependencies = yield Promise.all([]
        .concat(isAdapter ? [
        // support adapter testing by default
        "@types/chai",
        "chai",
        "@types/mocha",
        "mocha",
        "@types/sinon",
        "sinon",
        "@types/sinon-chai",
        "sinon-chai",
        "@types/proxyquire",
        "proxyquire",
        // and NodeJS typings
        "@types/node",
    ] : [])
        .concat(useTypeScript ? [
        // enhance testing through TS tools
        "source-map-support",
        "ts-node",
        // of course we need this
        "typescript",
        // to clean the build dir
        "rimraf",
    ] : [])
        .concat(useTSLint ? ["tslint"] : [])
        .concat(useNyc ? ["nyc"] : [])
        // generate dependency lines, the correct versions will be found later
        .map((dep) => `"${dep}": "^0.0.0"`));
    const template = `
{
	"name": "iobroker.${answers.adapterName}"
	,"version": "0.0.1"
	,"description": "${answers.description || answers.adapterName}"
	,"author": {
		"name": "${answers.authorName}"
		,"email": "${answers.authorEmail}"
	}
	,"contributors": [
		{
			"name": "${answers.authorName}"
			,"email": "${answers.authorEmail}"
		}
	]
	,"homepage": "https://github.com/${answers.authorGithub}/ioBroker.${answers.adapterName}"
	,"license": "MIT"
	,"keywords": [
		"ioBroker"
		,"template"
		,"Smart Home"
		,"home automation"
	]
	,"repository": {
		"type": "git"
		,"url": "https://github.com/${answers.authorGithub}/ioBroker.${answers.adapterName}"
	}
	,"dependencies": {}
	,"devDependencies": {${devDependencies.join(",")}}
	,"main": "${useTypeScript ? "build/" : ""}main.js"
	,"scripts": {
		${useTypeScript ? (`
			"prebuild": "rimraf ./build",
			"build:ts": "tsc -p tsconfig.build.json",
			"build": "npm run build:ts",
			"watch:ts": "tsc -p tsconfig.build.json --watch",
			"watch": "npm run watch:ts",
			"test:ts": "mocha --opts test/mocha.typescript.opts",
		`) : ""}
		"test:package": "mocha test/testPackageFiles.js --exit"
		,"test:iobroker": "mocha test/testAdapter.js --exit"
		,"test": "${useTypeScript ? "npm run test:ts && " : ""}npm run test:package && npm run test:iobroker"
		${useNyc ? `,"coverage": "node node_modules/nyc/bin/nyc npm run test_ts"` : ""}
		${useTSLint ? (`
			,"lint": "npm run lint:ts \\\"src/**/*.ts\\\""
			,"lint:ts": "tslint"`) : useESLint ? (`
			,"lint": "npm run lint:js"
			,"lint:js": "eslint"`) : ""}
	}
	${useNyc ? `,"nyc": {
		"include": [
			"src/**/*.ts"
		]
		,"exclude": [
			"src/**/*.test.ts"
		]
		,"extension": [
			".ts"
		]
		,"require": [
			"ts-node/register"
		]
		,"reporter": [
			"text-summary"
			,"html"
		]
		,"sourceMap": true
		,"instrument": true
	}` : ""}
	,"bugs": {
		"url": "https://github.com/${answers.authorGithub}/ioBroker.${answers.adapterName}/issues"
	}
	,"readmeFilename": "README.md"
}`;
    return JSON.stringify(JSON.parse(template), null, 2);
});
