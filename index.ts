/**
 * index.ts
 *
 * @module index.ts
 */
require('dotenv/config');

import { ESLint } from 'eslint';
import SheetSync from './src/data/spread-sheet';
import AnalysesSummary from './src/analyses-summary';

const eslint = require('eslint');

const {
  SPREADSHEET_ID,
} = process.env;

(async () => {
  const sheet = new SheetSync(SPREADSHEET_ID!);
  const lint: ESLint = new eslint.ESLint();
  const result: ESLint.LintResult[] = await lint.lintFiles('./');

  await sheet.saveResult(new AnalysesSummary('collector', result).calculateSummary());

  // console.log('Result: %o', result); // eslint-disable-line
  console.log('Done.'); // eslint-disable-line
})();
