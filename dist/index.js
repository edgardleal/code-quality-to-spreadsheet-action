"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * index.ts
 *
 * @module index.ts
 */
require('dotenv/config');
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const core_1 = require("@actions/core");
const spread_sheet_1 = __importDefault(require("./src/data/spread-sheet"));
const analyses_summary_1 = __importDefault(require("./src/analyses-summary"));
const eslint = require('eslint');
const logger = debug_1.default('eslint-collector:index');
const { SPREADSHEET_ID, ESLINT_PROJECT_LIST, ESLINT_EXTENSIONS, } = process.env;
const PROJECTS = (core_1.getInput('eslint_project_list') || ESLINT_PROJECT_LIST || '.').split(',');
const EXTENSIONS = (core_1.getInput('eslint_extensions') || ESLINT_EXTENSIONS || '.js,.ts,.jsx').split(',');
function getWorkingDir() {
    const globIndex = PROJECTS[0].indexOf('**');
    const projectPath = globIndex > -1 ? PROJECTS[0].substr(0, globIndex) : PROJECTS[0];
    let result = projectPath;
    if (!fs_1.existsSync(projectPath)) {
        result = path_1.default.join(__dirname, projectPath);
    }
    console.log('Defining work dir to: %s', result); // eslint-disable-line
    return result;
}
function printResult(result) {
    result.forEach((data) => {
        console.log('%s - %d', data.filePath, data.errorCount); // eslint-disable-line
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sheet = new spread_sheet_1.default(core_1.getInput('spreadsheet_id') || SPREADSHEET_ID);
        const lint = new eslint.ESLint({
            cwd: getWorkingDir(),
            extensions: EXTENSIONS,
        });
        logger('Running linter for projects: %o', PROJECTS);
        const result = yield lint.lintFiles(PROJECTS);
        yield sheet.saveResult(new analyses_summary_1.default(result).calculateSummary());
        printResult(result);
        console.log('Done.'); // eslint-disable-line
    }
    catch (e) {
        console.error('Error message: %s', e.message); // eslint-disable-line
        console.error('Error: %o', e.stack); // eslint-disable-line
        core_1.setFailed(e.message);
    }
}))();
