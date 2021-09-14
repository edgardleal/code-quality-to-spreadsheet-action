"use strict";
/**
 * date.ts
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal
 * @module date.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE_SECOND = 1000;
/**
 * 1000 * 60
 */
exports.ONE_MINUTE = exports.ONE_SECOND * 60;
exports.ONE_HOUR = exports.ONE_MINUTE * 60;
exports.ONE_DAY = exports.ONE_HOUR * 24;
function splitDate(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return {
        year,
        month,
        day,
        hour,
        minute,
        second,
    };
}
exports.splitDate = splitDate;
function twoDigits(value) {
    const prefix = value < 10 ? '0' : '';
    return `${prefix}${value}`;
}
function formatYMD(date = new Date()) {
    const fields = splitDate(date);
    return `${twoDigits(fields.year)}-${twoDigits(fields.month)}-${twoDigits(fields.day)}`;
}
exports.formatYMD = formatYMD;
