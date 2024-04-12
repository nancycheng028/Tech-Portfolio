"use strict";
/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rect = void 0;
/**
 * PS2 instructions: do NOT change this file.
 */
const assert_1 = __importDefault(require("assert"));
/**
 * Represents an immutable rectangle in 2D space.
 *
 * PS2 instructions: DO NOT change this class.
 * If you need more operations, define functions in `utils.ts`.
 */
class Rect {
    /**
     * Make a rectangle with opposing corners (x1, y1) and (x2, y2).
     * Requires x1 <= x2 and y1 <= y2.
     *
     * @param x1 x-coordinate of one corner
     * @param y1 y-coordinate of one corner
     * @param x2 x-coordinate of other corner
     * @param y2 y-coordinate of other corner
     */
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.checkRep();
    }
    // AF(x1, y1, x2, y2) = rectangle with one corner at (x1,y1) and opposite corner at (x2,y2)
    // RI: x1 <= x2 && y1 <= y2
    // Safety from rep exposure: all rep fields are unreassignable and have immutable primitive type
    checkRep() {
        (0, assert_1.default)(this.x1 <= this.x2, `expected x1=${this.x1} <= x2=${this.x2}`);
        (0, assert_1.default)(this.y1 <= this.y2, `expected y1=${this.y1} <= y2=${this.y2}`);
    }
    toString() {
        this.checkRep();
        return 'Rect[' + this.x1 + ',' + this.y1 + '->' + this.x2 + ',' + this.y2 + ']';
    }
}
exports.Rect = Rect;
//# sourceMappingURL=Rect.js.map