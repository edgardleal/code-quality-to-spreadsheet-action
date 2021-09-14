"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
class AnalysesSummary {
    constructor(result) {
        this.projectName = (core_1.getInput('project_name') || process.env.PROJECT_NAME);
        this.result = result || [];
    }
    calculateSummary() {
        const summary = {
            name: this.projectName,
            user: github_1.context.actor,
            branch: github_1.context.ref,
            environment: process.env.ENV || 'dev',
            date: new Date(),
            errors: this.result.reduce((prev, item) => prev + item.errorCount, 0),
            warnings: this.result.reduce((prev, item) => prev + item.warningCount, 0),
        };
        return summary;
    }
}
exports.default = AnalysesSummary;
