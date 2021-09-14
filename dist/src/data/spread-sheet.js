"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * spread-sheet.ts
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal
 * @module spread-sheet.ts
 */
const debug_1 = __importDefault(require("debug"));
const core_1 = require("@actions/core");
const google_spreadsheet_1 = require("google-spreadsheet");
const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, } = process.env;
const logger = debug_1.default('eslint-collector:spreadsheet');
class SheetSync {
    constructor(id, sheet = 0) {
        this.isAuthenticated = false;
        this.sheetNumber = sheet;
        this.doc = new google_spreadsheet_1.GoogleSpreadsheet(id);
    }
    auth() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAuthenticated) {
                return Promise.resolve(this.doc);
            }
            logger('Authenticating...');
            const credentials = {
                client_email: core_1.getInput('google_service_account_email') || GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: (core_1.getInput('google_private_key') || GOOGLE_PRIVATE_KEY).replace(/\\+n/g, '\n'),
            };
            yield this.doc.useServiceAccountAuth(credentials);
            yield this.doc.loadInfo();
            logger(`Doc: ${this.doc.title}`);
            this.sheet = this.doc.sheetsByIndex[this.sheetNumber];
            logger(`Sheet: ${this.sheet.title}`);
            logger(`Rowns: ${this.sheet.rowCount}`);
            this.isAuthenticated = true;
            return this.doc;
        });
    }
    saveResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth();
            yield this.sheet.addRow(data);
        });
    }
    /**
     * Return a bunch of 30 rows
     */
    getRows(offset = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth();
            return this.sheet.getRows({
                offset,
                limit: 30,
            });
        });
    }
    /**
     * Get all rows from current sheet.
     * the `fieldNameToValidate` will be used to check if
     * a row is not empty, if the row is empty, the lines bellow
     * will not be used.
     */
    getAllRows(fieldNameToValidate) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            let list = [];
            let skip = 0;
            do {
                list = yield this.getRows(skip);
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
        });
    }
}
exports.default = SheetSync;
