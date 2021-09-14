/**
 * analyses-summary.ts
 * Copyright (C) 2021 edgardleal
 *
 * Distributed under terms of the MIT license.
 */
import { ESLint } from 'eslint';

export default class AnalysesSummary {
  private result: ESLint.LintResult[];

  private projectName: string;

  constructor(name: string, result: ESLint.LintResult[]) {
    this.projectName = name;
    this.result = result;
  }

  calculateSummary() {
    const summary: any = {
      name: this.projectName,
      user: '',
      environment: process.env.ENV || 'dev',
      date: new Date(),
      errors: this.result.reduce(
        (prev: number, item: ESLint.LintResult) => prev + item.errorCount, 0,
      ),
      warnings: this.result.reduce(
        (prev: number, item: ESLint.LintResult) => prev + item.warningCount, 0,
      ),
    };

    return summary;
  }
}
