"use strict";
/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.implementations = exports.RepArrayRegionSet = exports.RepMapRegionSet = void 0;
const assert_1 = __importDefault(require("assert"));
const Rect_1 = require("./Rect");
/**
 * An implementation of RegionSet.
 *
 * PS2 instructions: you must use the provided rep.
 * You may not change the spec of the constructor.
 */
class RepMapRegionSet {
    // Abstraction function:
    // AF (map, gridSize) = a regionSet of labeled regions, where each region is 
    //                      uniquely labeled with a type L that is the key in the map, 
    //                      and represented by an array of rectangles that form a contiguous region, 
    //                      which is the value in the map corresponding to their label of the key.
    //
    // Representation invariant:
    // - gridSize >= 0
    // - gridSize is an integer
    // - each rectangle in the array must stay in the grid, in other words, 
    //   each coordinate of the rectangle must be in the range [0, gridSize]
    // - each coordinate of the rectangle must be an integer 
    // - each array of the label must have length of at least 1
    // - any two regions in the regionSet may not intersect with each other
    // - each region must be contiguous, for any two cells in the region, 
    //   they must be reachable from each other through a path with adjacent edges (corners don't count)
    //
    // Safety from rep exposure:
    // - map is a private field so that is cannot be accessed outside the class and prevent mutation to the map
    // - map is readonly so that it cannot be reassigned once created 
    // - gridSize is immutable and readonly
    // - add() is the only method that mutates the map, and we are passing in a rectangle that is immutable,
    //   as well as label of type L, which could be compared for equality using === to prevent the client from modifying these objects
    // - for bounds(), the rectangle that we are returning is immutable so that it is safe 
    // - for owners(), we are returning a set, but changing the set would not change anything about the map, so it is safe
    // - we are never returning the array itself in any methods, so this prevents the client from changing the rep
    /**
     * Create an empty region set for a `gridSize` x `gridSize` grid.
     *
     * @param gridSize dimension of grid, must be nonnegative integer
     */
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.map = new Map();
        this.checkRep();
    }
    // helper functions:
    /**
     * Given two rectangles, check if they intersect with each other.
     * Intersection means that there exists at least one cell in both rectangles.
     *
     * @param rectangle1 to be checked
     * @param rectangle2 to be checked
     * @returns boolean, indicating whether the two rectangles interesect with each other
     */
    intersect(rectangle1, rectangle2) {
        const X_LOWER_SELF = rectangle1.x1;
        const Y_LOWER_SELF = rectangle1.y1;
        const X_UPPER_SELF = rectangle1.x2;
        const Y_UPPER_SELF = rectangle1.y2;
        const X_LOWER_OTHER = rectangle2.x1;
        const Y_LOWER_OTHER = rectangle2.y1;
        const X_UPPER_OTHER = rectangle2.x2;
        const Y_UPPER_OTHER = rectangle2.y2;
        let X_FLAG;
        let Y_FLAG;
        if (X_UPPER_OTHER <= X_LOWER_SELF || X_UPPER_SELF <= X_LOWER_OTHER) {
            X_FLAG = true;
        }
        else {
            X_FLAG = false;
        }
        if (Y_UPPER_OTHER <= Y_LOWER_SELF || Y_UPPER_SELF <= Y_LOWER_OTHER) {
            Y_FLAG = true;
        }
        else {
            Y_FLAG = false;
        }
        if (!X_FLAG && !Y_FLAG) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Given two rectangles, check if they are connected, which includes both the possibility
     * that they are intersecting or they share an edge (touching a corner doesn't count)
     *
     * @param rectangle1 to be checked
     * @param rectangle2 to be checked
     * @returns boolean, indicating whether the two reactangles are connected to each other
     */
    connected(rectangle1, rectangle2) {
        if (this.intersect(rectangle1, rectangle2)) {
            return true;
        }
        else {
            // fix rectangle 1
            // check if rect2 is touching the right side of rect1 (r1.x2 = r2.x1)
            if (rectangle1.x2 === rectangle2.x1) {
                // if r2.y1 falls between (r1.y1, r1.y2)
                if (rectangle2.y1 > rectangle1.y1 && rectangle2.y1 < rectangle1.y2) {
                    return true;
                }
                // if r2.y2 falls between (r1.y1, r1.y2)
                if (rectangle2.y2 > rectangle1.y1 && rectangle2.y2 < rectangle1.y2) {
                    return true;
                }
                // if r2.y2 >= r1.y2 && r2.y1 <= r1.y1
                if (rectangle2.y2 >= rectangle1.y2 && rectangle2.y1 <= rectangle1.y1) {
                    return true;
                }
            }
            // check if rect2 is touching the left side of rect1 (r1.x1 = r2.x2)
            else if (rectangle1.x1 === rectangle2.x2) {
                // if r2.y1 falls between (r1.y1, r1.y2)
                if (rectangle2.y1 > rectangle1.y1 && rectangle2.y1 < rectangle1.y2) {
                    return true;
                }
                // if r2.y2 falls between (r1.y1, r1.y2)
                if (rectangle2.y2 > rectangle1.y1 && rectangle2.y2 < rectangle1.y2) {
                    return true;
                }
                // if r2.y2 >= r1.y2 && r2.y1 <= r1.y1
                if (rectangle2.y2 >= rectangle1.y2 && rectangle2.y1 <= rectangle1.y1) {
                    return true;
                }
            }
            // check if rect2 is touching the top side of rect1 (r1.y1 = r2.y2)
            else if (rectangle1.y1 === rectangle2.y2) {
                // if r2.x1 falls between (r1.x1, r1.x2)
                if (rectangle2.x1 > rectangle1.x1 && rectangle2.x1 < rectangle1.x2) {
                    return true;
                }
                // if r2.x2 falls between (r1.x1, r1.x2)
                if (rectangle2.x2 > rectangle1.x1 && rectangle2.x2 < rectangle1.x2) {
                    return true;
                }
                // if r2.x2 >= r1.x2 && r2.x1 <= r1.x1
                if (rectangle2.x2 >= rectangle1.x2 && rectangle2.x1 <= rectangle1.x1) {
                    return true;
                }
            }
            // check if rect2 is touching the bottom side of rect1 (r1.y2 = r2.y1)
            else if (rectangle1.y2 === rectangle2.y1) {
                // if r2.x1 falls between (r1.x1, r1.x2)
                if (rectangle2.x1 > rectangle1.x1 && rectangle2.x1 < rectangle1.x2) {
                    return true;
                }
                // if r2.x2 falls between (r1.x1, r1.x2)
                if (rectangle2.x2 > rectangle1.x1 && rectangle2.x2 < rectangle1.x2) {
                    return true;
                }
                // if r2.x2 >= r1.x2 && r2.x1 <= r1.x1
                if (rectangle2.x2 >= rectangle1.x2 && rectangle2.x1 <= rectangle1.x1) {
                    return true;
                }
            }
            return false;
        }
    }
    checkRep() {
        // check that gridSize is a valid number
        if (this.gridSize < 0 || !Number.isInteger(this.gridSize)) {
            throw new Error("Grid size must be a nonnegative integer");
        }
        // check that each rectangle in the map must stay in the grid and has integer coordinates
        for (const [label, rectangleArray] of this.map) {
            for (const rectangle of rectangleArray) {
                if (!Number.isInteger(rectangle.x1) || !Number.isInteger(rectangle.y1) ||
                    !Number.isInteger(rectangle.x2) || !Number.isInteger(rectangle.y2)) {
                    throw new Error("Rectangle coordinates must be integers");
                }
                if (rectangle.x1 < 0 || rectangle.x1 > this.gridSize ||
                    rectangle.y1 < 0 || rectangle.y1 > this.gridSize ||
                    rectangle.x2 < 0 || rectangle.x2 > this.gridSize ||
                    rectangle.y2 < 0 || rectangle.y2 > this.gridSize) {
                    throw new Error("Rectangle coordinates must be within the grid");
                }
            }
        }
        // check if each array of the label has length of at least 1
        for (const [label, rectangleArray] of this.map) {
            if (rectangleArray.length < 1) {
                throw new Error("Region cannot be empty");
            }
        }
        // Check that no two regions intersect with each other
        for (const [label1, rectangleArray1] of this.map) {
            for (const [label2, rectangleArray2] of this.map) {
                if (label1 !== label2) {
                    for (const rectangle1 of rectangleArray1) {
                        for (const rectangle2 of rectangleArray2) {
                            if (this.intersect(rectangle1, rectangle2)) {
                                throw new Error("Region must not intersect with another region of different label");
                            }
                        }
                    }
                }
            }
        }
        // Check that each region must be contiguous
        for (const [label, rectangleArray] of this.map) {
            for (const rectangle1 of rectangleArray) {
                let contiguous;
                contiguous = false;
                // iterate through every rectangle, see if it can find 
                // at least one other rectangle that is connected to it, if yes, set continuous to true
                for (const rectangle2 of rectangleArray) {
                    if (rectangle1 !== rectangle2) {
                        if (this.connected(rectangle1, rectangle2)) {
                            contiguous = true;
                        }
                    }
                }
                // this is the point where for each rectangles, it's checked all other rectangles' connected status
                if (!contiguous) {
                    throw new Error("Region of the same label must be contiguous");
                }
            }
        }
    }
    /**
     * @inheritDoc
     */
    add(label, rect) {
        const region = this.map.get(label) ?? []; // region is the array of rects
        let conditionCheck = true;
        let contiguous;
        contiguous = false;
        for (const rectangle of region) {
            if (this.connected(rectangle, rect)) {
                contiguous = true;
            }
        }
        if (region.length === 0) {
            contiguous = true;
        }
        if (!contiguous) {
            throw new Error("Cannot add a rectangle that would make current label's region discontiguous");
        }
        for (const [l, rectArray] of this.map) {
            if (l !== label) { // check it with all other regions
                for (const rectangle of rectArray) {
                    if (this.intersect(rectangle, rect)) {
                        conditionCheck = false;
                        throw new Error("Cannot add a rectangle that would intersect with another labeled region");
                    }
                }
            }
        }
        //check rect has nonzero area 
        if ((rect.x1 === rect.x2) || (rect.y1 === rect.y2)) {
            conditionCheck = false;
            throw new Error("Cannot add a rectangle that has zero area");
        }
        //check if rect is within the grid
        if (rect.x1 > this.gridSize || rect.x2 > this.gridSize ||
            rect.y1 > this.gridSize || rect.y2 > this.gridSize ||
            rect.x1 < 0 || rect.x2 < 0 ||
            rect.y1 < 0 || rect.y2 < 0) {
            throw new Error("Cannot add a rectangle that is outside the grid");
        }
        //now we can add the rectangle array 
        region.push(rect);
        this.map.set(label, region);
    }
    /**
     * @inheritDoc
     */
    owners(rect) {
        const result = new Set;
        if (rect.x1 === rect.x2 || rect.y1 === rect.y2) {
            return new Set();
        }
        for (const [label, rectangleArray] of this.map) {
            for (const rectangle of rectangleArray) {
                if (this.intersect(rectangle, rect)) {
                    result.add(label);
                }
            }
        }
        return result;
    }
    /**
     * @inheritDoc
     */
    bounds(label) {
        if (!this.map.has(label)) {
            return undefined;
        }
        else {
            const region = this.map.get(label); // region is the array of rects
            (0, assert_1.default)(region !== undefined);
            const first = region[0];
            (0, assert_1.default)(first !== undefined);
            let minx1 = first.x1;
            let miny1 = first.y1;
            let maxx2 = first.x2;
            let maxy2 = first.y2;
            for (const rectangle of region) {
                if (rectangle.x1 < minx1) {
                    minx1 = rectangle.x1;
                }
                if (rectangle.y1 < miny1) {
                    miny1 = rectangle.y1;
                }
                if (rectangle.x2 > maxx2) {
                    maxx2 = rectangle.x2;
                }
                if (rectangle.y2 > maxy2) {
                    maxy2 = rectangle.y2;
                }
            }
            return new Rect_1.Rect(minx1, miny1, maxx2, maxy2);
        }
    }
    /**
     * @inheritDoc
     */
    toString() {
        const lines = [];
        for (const [label, rectArr] of this.map.entries()) {
            const rectString = rectArr.map((rect) => rect.toString());
            const line = label + ": [" + rectString.join(", ") + "]";
            lines.push(line);
        }
        return lines.join("\n");
    }
}
exports.RepMapRegionSet = RepMapRegionSet;
/**
 * An implementation of RegionSet.
 *
 * PS2 instructions: you must use the provided rep.
 * You may not change the spec of the constructor.
 */
class RepArrayRegionSet {
    // Abstraction function:
    // AF(array, gridSize) = a regionSet of labeled regions where each element in array is the label 
    //                       of type L that corresponds to the label of the region that the unit cell
    //                       belongs to, or undefined if there's no label of region corresponding to
    //                       that cell. A labeled region is represented by the set of cells with that label,
    //                       and the order of the elements in the array is stored in row-major order,
    //                       (first list the top row from left to right, and then the second row, and so on)
    // 
    // Representation invariant:
    // - gridSize >= 0
    // - gridSize is an integer
    // - the length of the array must be equal to (gridSize * gridSize)
    // - the type of each element in the array must be either L or undefined
    // - each region formed by the set of cells with the same label must be contiguous, for any two cells in the region, 
    //   they must be reachable from each other through a path with adjacent edges (corners don't count)
    // - any two regions in the regionSet may not intersect with each other
    //   
    // Safety from rep exposure:
    // - array is a private field so that is cannot be accessed outside the class and prevent mutation to the array
    // - array is readonly so that it cannot be reassigned once created 
    // - gridSize is immutable and readonly
    // - we are never returning the array itself in any methods, so this prevents the client from changing the rep
    // - add() is the only method that mutates the array, and we are passing in a rectangle that is immutable,
    //   as well as label of type L, which could be compared for equality using === to prevent the client from modifying these objects
    // - for bounds(), the rectangle that we are returning is immutable so that it is safe 
    // - for owners(), we are returning a set, but changing the set would not change anything about the array, so it is safe
    /**
     * Create an empty region set for a `gridSize` x `gridSize` grid.
     *
     * @param gridSize dimension of grid, must be nonnegative integer
     */
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.array = [];
        const arrayLen = gridSize * gridSize;
        for (let i = 0; i < arrayLen; i++) {
            this.array.push(undefined);
        }
        this.checkRep();
    }
    /**
     *
     * Given an index in the array, return the rectangle corresponding to that cell.
     *
     * @param index the number of element to be checked in the array
     * @returns a rectangle object of the given index
     */
    getRectangle(index) {
        if (this.gridSize === 0) {
            return new Rect_1.Rect(0, 0, 0, 0);
        }
        const rowNum = Math.floor(index / this.gridSize);
        const colNum = index % this.gridSize;
        const x1 = colNum;
        const y1 = this.gridSize - 1 - rowNum;
        const x2 = x1 + 1;
        const y2 = y1 + 1;
        return new Rect_1.Rect(x1, y1, x2, y2);
    }
    /**
     * Given two rectangles, check if they intersect with each other.
     * Intersection means that there exists at least one cell in both rectangles.
     *
     * @param rectangle1 to be checked
     * @param rectangle2 to be checked
     * @returns a boolean value indicating whether the two rectangles intersect
     */
    intersect(rectangle1, rectangle2) {
        const X_LOWER_SELF = rectangle1.x1;
        const Y_LOWER_SELF = rectangle1.y1;
        const X_UPPER_SELF = rectangle1.x2;
        const Y_UPPER_SELF = rectangle1.y2;
        const X_LOWER_OTHER = rectangle2.x1;
        const Y_LOWER_OTHER = rectangle2.y1;
        const X_UPPER_OTHER = rectangle2.x2;
        const Y_UPPER_OTHER = rectangle2.y2;
        let X_FLAG;
        let Y_FLAG;
        if (X_UPPER_OTHER <= X_LOWER_SELF || X_UPPER_SELF <= X_LOWER_OTHER) {
            X_FLAG = true;
        }
        else {
            X_FLAG = false;
        }
        if (Y_UPPER_OTHER <= Y_LOWER_SELF || Y_UPPER_SELF <= Y_LOWER_OTHER) {
            Y_FLAG = true;
        }
        else {
            Y_FLAG = false;
        }
        if (!X_FLAG && !Y_FLAG) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Given two rectangles, check if they are connected, which includes both the possibility
     * that they are intersecting or they share an edge (touching a corner doesn't count)
     *
     * @param rectangle1 to be checked
     * @param rectangle2 to be checked
     * @returns a boolean value indicating whether the two rectangles are connected
     */
    connected(rectangle1, rectangle2) {
        if (this.intersect(rectangle1, rectangle2)) {
            return true;
        }
        else {
            // fix rectangle 1
            // check if rect2 is touching the right side of rect1 (r1.x2 = r2.x1)
            if (rectangle1.x2 === rectangle2.x1) {
                // if r2.y1 falls between (r1.y1, r1.y2)
                if (rectangle2.y1 > rectangle1.y1 && rectangle2.y1 < rectangle1.y2) {
                    return true;
                }
                // if r2.y2 falls between (r1.y1, r1.y2)
                if (rectangle2.y2 > rectangle1.y1 && rectangle2.y2 < rectangle1.y2) {
                    return true;
                }
                // if r2.y2 >= r1.y2 && r2.y1 <= r1.y1
                if (rectangle2.y2 >= rectangle1.y2 && rectangle2.y1 <= rectangle1.y1) {
                    return true;
                }
            }
            // check if rect2 is touching the left side of rect1 (r1.x1 = r2.x2)
            else if (rectangle1.x1 === rectangle2.x2) {
                // if r2.y1 falls between (r1.y1, r1.y2)
                if (rectangle2.y1 > rectangle1.y1 && rectangle2.y1 < rectangle1.y2) {
                    return true;
                }
                // if r2.y2 falls between (r1.y1, r1.y2)
                if (rectangle2.y2 > rectangle1.y1 && rectangle2.y2 < rectangle1.y2) {
                    return true;
                }
                // if r2.y2 >= r1.y2 && r2.y1 <= r1.y1
                if (rectangle2.y2 >= rectangle1.y2 && rectangle2.y1 <= rectangle1.y1) {
                    return true;
                }
            }
            // check if rect2 is touching the top side of rect1 (r1.y1 = r2.y2)
            else if (rectangle1.y1 === rectangle2.y2) {
                // if r2.x1 falls between (r1.x1, r1.x2)
                if (rectangle2.x1 > rectangle1.x1 && rectangle2.x1 < rectangle1.x2) {
                    return true;
                }
                // if r2.x2 falls between (r1.x1, r1.x2)
                if (rectangle2.x2 > rectangle1.x1 && rectangle2.x2 < rectangle1.x2) {
                    return true;
                }
                // if r2.x2 >= r1.x2 && r2.x1 <= r1.x1
                if (rectangle2.x2 >= rectangle1.x2 && rectangle2.x1 <= rectangle1.x1) {
                    return true;
                }
            }
            // check if rect2 is touching the bottom side of rect1 (r1.y2 = r2.y1)
            else if (rectangle1.y2 === rectangle2.y1) {
                // if r2.x1 falls between (r1.x1, r1.x2)
                if (rectangle2.x1 > rectangle1.x1 && rectangle2.x1 < rectangle1.x2) {
                    return true;
                }
                // if r2.x2 falls between (r1.x1, r1.x2)
                if (rectangle2.x2 > rectangle1.x1 && rectangle2.x2 < rectangle1.x2) {
                    return true;
                }
                // if r2.x2 >= r1.x2 && r2.x1 <= r1.x1
                if (rectangle2.x2 >= rectangle1.x2 && rectangle2.x1 <= rectangle1.x1) {
                    return true;
                }
            }
            return false;
        }
    }
    /**
     *
     * Given a rectangle within the grid, return the indices of the array that the rectangle covers
     * the length of the array is gridSize * gridSize, and the indices are in row-major order.
     *
     * @param rect the rectangle to be checked
     * @returns an array of numbers indicating the indecies that the input rectangle covers
     */
    getRectangleIndex(rect) {
        const result = [];
        if (rect.x1 > this.gridSize || rect.x2 > this.gridSize ||
            rect.y1 > this.gridSize || rect.y2 > this.gridSize) {
            throw new Error("Rectangle must be within the grid");
        }
        if (rect.x1 === rect.x2 || rect.y1 === rect.y2) {
            return [];
        }
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const rowNum = Math.floor(i / this.gridSize);
            const colNum = i % this.gridSize;
            const x1 = colNum;
            const y1 = this.gridSize - 1 - rowNum;
            const x2 = x1 + 1;
            const y2 = y1 + 1;
            if (x1 >= rect.x1 && x2 <= rect.x2 && y1 >= rect.y1 && y2 <= rect.y2) {
                result.push(i);
            }
        }
        return result;
    }
    checkRep() {
        // check that gridSize is a valid number
        if (this.gridSize < 0 || !Number.isInteger(this.gridSize)) {
            throw new Error("Grid size must be a nonnegative integer");
        }
        const arrayLen = this.gridSize * this.gridSize;
        // Check that the array length is equal to gridSize * gridSize
        if (this.array.length !== arrayLen) {
            throw new Error("Array length is not equal to gridSize * gridSize");
        }
        // Check that each region must be contiguous
        const labelSet = new Set;
        for (let i = 0; i < arrayLen; i++) {
            if (this.array[i] !== undefined) {
                const element = this.array[i];
                (0, assert_1.default)(element !== undefined);
                labelSet.add(element);
            }
        }
        for (const label of labelSet) {
            const labeledRegion = new Set; // set of rectangles with the same current label
            for (let i = 0; i < arrayLen; i++) {
                if (this.array[i] === label) {
                    const thisRect = this.getRectangle(i);
                    labeledRegion.add(thisRect);
                }
            }
            for (const rectangle of labeledRegion) {
                let contiguous = false;
                for (const rectangle2 of labeledRegion) {
                    if (rectangle !== rectangle2) {
                        if (this.connected(rectangle, rectangle2)) {
                            contiguous = true;
                        }
                    }
                }
                if (!contiguous) {
                    throw new Error("Region of the same label must be contiguous");
                }
            }
        }
    }
    /**
     * @inheritDoc
     */
    add(label, rect) {
        //check rect has nonzero area 
        if ((rect.x1 === rect.x2) || (rect.y1 === rect.y2)) {
            throw new Error("Cannot add a rectangle that has zero area");
        }
        //check if rect is within the grid
        if (rect.x1 > this.gridSize || rect.x2 > this.gridSize ||
            rect.y1 > this.gridSize || rect.y2 > this.gridSize ||
            rect.x1 < 0 || rect.x2 < 0 ||
            rect.y1 < 0 || rect.y2 < 0) {
            throw new Error("Cannot add a rectangle that is outside the grid");
        }
        const indexArray = this.getRectangleIndex(rect);
        // check if it will intersect with another label
        for (const index of indexArray) {
            const currentLabel = this.array[index];
            if (currentLabel !== label && currentLabel !== undefined) {
                throw new Error("Cannot add a rectangle that would intersect with another labeled region");
            }
        }
        // check if adding the new rect would make current labeled region discontiguous
        const arrayLen = this.gridSize * this.gridSize;
        const labeledRegion = new Set; // set of rectangles with the current label
        for (let i = 0; i < arrayLen; i++) {
            if (this.array[i] === label) {
                const thisRect = this.getRectangle(i);
                labeledRegion.add(thisRect);
            }
        }
        let contiguous = false;
        for (const rectangle of labeledRegion) {
            if (this.connected(rectangle, rect)) {
                contiguous = true;
            }
        }
        if (labeledRegion.size === 0) {
            contiguous = true;
        }
        if (!contiguous) {
            throw new Error("Cannot add a rectangle that would make the label's region discontiguous");
        }
        // now, it can be added
        for (const index of indexArray) {
            this.array[index] = label;
        }
    }
    /**
     * @inheritDoc
     */
    owners(rect) {
        const indexArray = this.getRectangleIndex(rect);
        const labelSet = new Set;
        for (const index of indexArray) {
            const thisLabel = this.array[index];
            if (thisLabel !== undefined) {
                labelSet.add(thisLabel);
            }
        }
        return labelSet;
    }
    /**
     * @inheritDoc
     */
    bounds(label) {
        const arrLen = this.gridSize * this.gridSize;
        const indexSet = new Set;
        for (let i = 0; i < arrLen; i++) {
            if (this.array[i] === label) {
                indexSet.add(i);
            }
        }
        if (indexSet === undefined || indexSet.size === 0) {
            return undefined;
        }
        const firstIndex = Array.from(indexSet)[0];
        (0, assert_1.default)(firstIndex !== undefined);
        const firstRec = this.getRectangle(firstIndex);
        let minx1 = firstRec.x1;
        let miny1 = firstRec.y1;
        let maxx2 = firstRec.x2;
        let maxy2 = firstRec.y2;
        for (const index of indexSet) {
            const thisRec = this.getRectangle(index);
            if (thisRec.x1 < minx1) {
                minx1 = thisRec.x1;
            }
            if (thisRec.y1 < miny1) {
                miny1 = thisRec.y1;
            }
            if (thisRec.x2 > maxx2) {
                maxx2 = thisRec.x2;
            }
            if (thisRec.y2 > maxy2) {
                maxy2 = thisRec.y2;
            }
        }
        return new Rect_1.Rect(minx1, miny1, maxx2, maxy2);
    }
    /**
     * @inheritDoc
     */
    toString() {
        let strOutput = "";
        for (const label of this.array) {
            strOutput += "\n";
            if (label !== undefined) {
                strOutput += `${label}`;
            }
            else {
                strOutput += " ";
            }
            strOutput += " ";
        }
        return strOutput;
    }
}
exports.RepArrayRegionSet = RepArrayRegionSet;
/**
 * @returns RegionSet implementations to test, not intended for clients
 *
 * PS2 instructions: do not modify this function.
 * The `string` that appears in this signature does *not* become a generic parameter.
 */
function implementations() {
    return [RepMapRegionSet, RepArrayRegionSet];
}
exports.implementations = implementations;
//# sourceMappingURL=RegionSetImpl.js.map