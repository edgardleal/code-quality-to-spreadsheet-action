/**
 * index.ts
 *
 * @module index.ts
 */
require('dotenv/config');

import debug from 'debug';
import path from 'path';
import { existsSync } from 'fs';
import { ESLint } from 'eslint';
import { setFailed, getInput } from '@actions/core';
import SheetSync from './src/data/spread-sheet';
import AnalysesSummary from './src/analyses-summary';

const eslint = require('eslint');

const logger = debug('eslint-collector:index');

const {
  SPREADSHEET_ID,
  ESLINT_PROJECT_LIST,
  ESLINT_EXTENSIONS,
} = process.env;

const PROJECTS = (getInput('eslint_project_list') || ESLINT_PROJECT_LIST || '.').split(',');
const EXTENSIONS = (getInput('eslint_extensions') || ESLINT_EXTENSIONS || '.js,.ts,.jsx').split(',');

function getWorkingDir(): string {
  const globIndex = PROJECTS[0].indexOf('**');
  const projectPath = globIndex > -1 ? PROJECTS[0].substr(0, globIndex) : PROJECTS[0];

  if (!existsSync(projectPath)) {
    return path.join(__dirname, projectPath);
  }
  return PROJECTS[0];
}

function printResult(result: ESLint.LintResult[]) {
  result.forEach((data: ESLint.LintResult) => {
    console.log('%s - %d', data.filePath, data.errorCount); // eslint-disable-line
  });
}

(async () => {
  try {
    const sheet = new SheetSync(getInput('spreadsheet_id') || SPREADSHEET_ID!);
    const lint: ESLint = new eslint.ESLint({
      cwd: getWorkingDir(),
      extensions: EXTENSIONS,
    });
    logger('Running linter for projects: %o', PROJECTS);
    const result: ESLint.LintResult[] = await lint.lintFiles(PROJECTS);

    await sheet.saveResult(new AnalysesSummary('collector', result).calculateSummary());

    printResult(result);
    console.log('Done.'); // eslint-disable-line
  } catch (e) {
    console.log('Error: %s', e.message); // eslint-disable-line
    setFailed(e.message);
  }
})();
