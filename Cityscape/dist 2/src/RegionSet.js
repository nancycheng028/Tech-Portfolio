"use strict";
/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRegionSet = void 0;
const RegionSetImpl_1 = require("./RegionSetImpl");
/**
 * Create an empty region set for a `gridSize` x `gridSize` grid.
 *
 * @template L type of labels in the set
 * @param gridSize dimension of grid, must be nonnegative integer
 * @returns a new empty region set
 */
function makeRegionSet(gridSize) {
    return new RegionSetImpl_1.RepArrayRegionSet(gridSize);
}
exports.makeRegionSet = makeRegionSet;
//# sourceMappingURL=RegionSet.js.map