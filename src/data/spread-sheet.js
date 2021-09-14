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

module.exports = class SheetSync {
  sheetNumber = 1;

  isAuthenticated = false;

  doc = {};

  sheet = {};

  constructor(
    id = '',
    sheet = 0,
  ) {
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

  async saveResult(data = {}) {
    await this.auth();
    await this.sheet.addRow(data);
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

  /**
   * Get all rows from current sheet.
   * the `fieldNameToValidate` will be used to check if
   * a row is not empty, if the row is empty, the lines bellow
   * will not be used.
   */
  async getAllRows(fieldNameToValidate) {
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
