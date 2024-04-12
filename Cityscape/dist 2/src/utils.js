"use strict";
/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSquare = void 0;
/**
 * PS2 instructions: use this file to define public utility functions.
 * You may also define private helper functions in `RegionSetImpl.ts` and `City.ts`.
 */
/**
 * @param rect rectangle
 * @returns true iff the x- and y-extents of rect are equal
 */
function isSquare(rect) {
    // PS2 instructions: this function is an example, feel free to delete it.
    return rect.x2 - rect.x1 === rect.y2 - rect.y1;
}
exports.isSquare = isSquare;
//# sourceMappingURL=utils.js.map