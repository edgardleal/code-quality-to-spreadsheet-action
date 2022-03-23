/**
 * index.ts
 *
 * @module index.ts
 */
require('dotenv/config');

const fs = require('fs');
const debug = require('debug');
const path = require('path');
const eslint = require('eslint');
const { setFailed, getInput } = require('@actions/core');
const SheetSync = require('./src/data/spread-sheet');
const AnalysesSummary = require('./src/analyses-summary');

const logger = debug('eslint-collector:index');

const {
  SPREADSHEET_ID,
  ESLINT_PROJECT_LIST,
  ESLINT_EXTENSIONS,
} = process.env;

const EXIT_WITH_ERROR_WHEN_ERRORS = getInput('exit_with_error_when_errors') === 'true';

const PROJECTS = (getInput('eslint_project_list') || ESLINT_PROJECT_LIST || '.').split(',');
const EXTENSIONS = (getInput('eslint_extensions') || ESLINT_EXTENSIONS || '.js,.ts,.jsx').split(',');

function getWorkingDir() {
  const globIndex = PROJECTS[0].indexOf('**');
  const projectPath = globIndex > -1 ? PROJECTS[0].substr(0, globIndex) : PROJECTS[0];
  let result = projectPath;

  if (!projectPath.startsWith('/')) {
    result = path.join(process.cwd(), projectPath);
    if (!result.endsWith('/')) {
      result = `${result}/`;
    }
  }
  console.log('Defining work dir to: %s', result); // eslint-disable-line
  return result;
}

function printResult(result = []) {
  return result.reduce((prev = { errors: 0, warnings: 0 }, data = {}) => {
    console.log('%s - %d', data.filePath, data.errorCount); // eslint-disable-line
    return {
      errors: prev.errors + data.errorCount,
      warnings: prev.warnings + data.warnings,
    };
  }, { errors: 0, warnings: 0 });
}

async function getLintData() {
  const resultFilePath = getInput('result_file');
  if (resultFilePath) {
    if (fs.existsSync(resultFilePath)) {
      const stringContent = fs.readFileSync(resultFilePath);
      return JSON.parse(stringContent);
    }
    console.warn('Eslint result data not found: [%s]', resultFilePath); // eslint-disable-line
  }
  const workDir = getWorkingDir();
  const lint = new eslint.ESLint({
    cwd: workDir,
    extensions: EXTENSIONS,
  });
  logger('Running linter for projects: %o', workDir);
  return lint.lintFiles('.');
}

(async () => {
  const workDir = getWorkingDir();
  try {
    const sheet = new SheetSync(getInput('spreadsheet_id') || SPREADSHEET_ID);
    logger('Running linter for projects: %o', workDir);
    const result = await getLintData();

    await sheet.saveResult(new AnalysesSummary(result).calculateSummary());

    const summary = printResult(result);
    console.log('Done.'); // eslint-disable-line

    if (summary.errors && EXIT_WITH_ERROR_WHEN_ERRORS) {
      process.exit(1);
    }
  } catch (e) {
    console.error('Error message: %s', e.message); // eslint-disable-line
    console.error('Error: %o', e.stack); // eslint-disable-line
    const params = {
      PROJECTS,
      SPREADSHEET_ID,
      EXTENSIONS,
      workDir,
    };
    console.log('Using params: %o', params); // eslint-disable-line
    setFailed(e.message);
  }
})();
