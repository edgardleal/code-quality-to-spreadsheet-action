/**
 * spread-sheet.ts
 * Copyright (C) 2020 Editora Sanar
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal
 * @module spread-sheet.ts
 */
import debug from 'debug';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet, GoogleSpreadsheetRow } from 'google-spreadsheet';

const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
} = process.env;

const logger = debug('eslint-collector:spreadsheet');

export default class SheetSync {
  private sheetNumber: number;

  private isAuthenticated = false;

  private doc: GoogleSpreadsheet;

  private sheet: GoogleSpreadsheetWorksheet;

  constructor(
    id: string,
    sheet: number = 0,
  ) {
    this.sheetNumber = sheet;
    this.doc = new GoogleSpreadsheet(id);
  }

  async auth(): Promise<any> {
    if (this.isAuthenticated) {
      return Promise.resolve(this.doc);
    }
    logger('Authenticating...');
    const credentials = {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: (GOOGLE_PRIVATE_KEY!).replace(/\\+n/g, '\n'),
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

  async saveResult(data: any) {
    await this.auth();
    await this.sheet.addRow(data);
  }

  /**
   * Return a bunch of 30 rows
   */
  async getRows(offset: number = 0): Promise<GoogleSpreadsheetRow[]> {
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
  async getAllRows(fieldNameToValidate: string): Promise<GoogleSpreadsheetRow[]> {
    const result: any[] = [];

    let list: any[] = [];
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
