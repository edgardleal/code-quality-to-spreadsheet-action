/**
 * analyses-summary.ts
 * Copyright (C) 2021 edgardleal
 *
 * Distributed under terms of the MIT license.
 */
const { getInput } = require('@actions/core');
const { context } = require('@actions/github');

module.exports = class AnalysesSummary {
  result = [];

  projectName = '';

  constructor(result = []) {
    this.projectName = (getInput('project_name') || process.env.PROJECT_NAME);
    this.result = result || [];
  }

  calculateSummary() {
    const summary = {
      name: this.projectName,
      user: context.actor,
      branch: context.ref,
      environment: process.env.ENV || 'dev',
      date: new Date(),
      errors: this.result.reduce(
        (prev = 0, item = {}) => prev + item.errorCount, 0,
      ),
      warnings: this.result.reduce(
        (prev = 0, item = {}) => prev + item.warningCount, 0,
      ),
    };

    return summary;
  }
}
