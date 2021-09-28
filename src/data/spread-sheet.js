/**
 * spread-sheet.ts
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal
 * @module spread-sheet.ts
 */
const debug = require('debug');
const { getInput } = require('@actions/core');
const {
  GoogleSpreadsheet,
} = require('google-spreadsheet');

const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
} = process.env;

const logger = debug('eslint-collector:spreadsheet');

function compareStrings(a = '', b = '') {
  return (a || '').toLowerCase().trim() === b.toLowerCase().trim();
}

module.exports = class SheetSync {
  sheetNumber = 1;

  isAuthenticated = false;

  doc = {};

  sheet = {};

  id = '';

  constructor(
    id = '',
    sheet = 0,
  ) {
    this.id = id;
    this.sheetNumber = sheet;
    this.doc = new GoogleSpreadsheet(id);
  }

  async auth() {
    if (this.isAuthenticated) {
      return Promise.resolve(this.doc);
    }
    logger('Authenticating...');
    const credentials = {
      client_email: getInput('google_service_account_email') || GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (getInput('google_private_key') || GOOGLE_PRIVATE_KEY).replace(/\\+n/g, '\n'),
    };
    await this.doc.useServiceAccountAuth(credentials);
    await this.doc.loadInfo();
    logger(`Doc: ${this.doc.title}`);
    this.sheet = this.doc.sheetsByIndex[this.sheetNumber];
    logger(`Sheet: ${this.sheet.title}`);
    logger(`Rowns: ${this.sheet.rowCount}`);
    this.isAuthenticated = true;
    return this.doc;
  }

  async saveResult(data = {
    name: '',
    user: '',
    environment: '',
    date: '',
    errors: '',
    warnings: '',
    branch: '',
  }) {
    await this.auth();
    await this.sheet.addRow(data);
    const summaryData = {
      Name: data.name,
      Errors: data.errors,
      Warnings: data.warnings,
      LastUpdate: data.date,
    };
    const summarySheet = new SheetSync(this.id, 1);
    const exists = await this.findRown('name', data.name);
    if (exists) {
      exists.Errors = summaryData.Errors;
      exists.Warnings = summaryData.Warnings;
      exists.LastUpdate = summaryData.LastUpdate;
      return exists.save();
    }
    return summarySheet.sheet.addRow(summaryData);
  }

  /**
   * Return a bunch of 30 rows
   */
  async getRows(offset = 0) {
    await this.auth();
    return this.sheet.getRows({
      offset,
      limit: 30,
    });
  }

  async findRown(field = '', value = '') {

    let list = [];
    let skip = 0;
    do {
      list = await this.getRows(skip);
      for (let i = 0; i < list.length; i += 1) {
        const item = list[i];
        const fieldValue = item[field];
        if (!item[fieldNameToValidate]) {
          return null;
        }
        if (compareStrings(value, fieldValue)) {
          return item;
        }
      }

      skip += list.length;
    } while (list.length && list[list.length - 1][fieldNameToValidate]);
    return null;
  }
  /**
   * Get all rows from current sheet.
   * the `fieldNameToValidate` will be used to check if
   * a row is not empty, if the row is empty, the lines bellow
   * will not be used.
   */
  async getAllRows(fieldNameToValidate = 'name') {
    const result = [];

    let list = [];
    let skip = 0;
    do {
      list = await this.getRows(skip);
      for (let i = 0; i < list.length; i += 1) {
        const item = list[i];
        if (!item[fieldNameToValidate]) {
          return result;
        }
        result.push(item);
      }

      skip += list.length;
    } while (list.length && list[list.length - 1][fieldNameToValidate]);
    return result;
  }
}
