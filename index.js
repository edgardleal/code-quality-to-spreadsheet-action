/**
 * index.ts
 *
 * @module index.ts
 */
require('dotenv/config');

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
  result.forEach((data = {}) => {
    console.log('%s - %d', data.filePath, data.errorCount); // eslint-disable-line
  });
}

(async () => {
  const workDir = getWorkingDir();
  try {
    const sheet = new SheetSync(getInput('spreadsheet_id') || SPREADSHEET_ID);
    const lint = new eslint.ESLint({
      cwd: workDir,
      extensions: EXTENSIONS,
    });
    logger('Running linter for projects: %o', PROJECTS);
    const result = await lint.lintFiles(PROJECTS);

    await sheet.saveResult(new AnalysesSummary(result).calculateSummary());

    printResult(result);
    console.log('Done.'); // eslint-disable-line
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
