/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from './Rect';
import { RegionSet, makeRegionSet } from './RegionSet';
import * as utils from './utils';

/**
 * A mutable set of labeled "buildings" in 3D, where a building is a contiguous set of cubic cells
 * in a 3D grid with origin at (0,0,0) and extending to (`gridSize`,`gridSize`,`gridSize`)
 * (for some nonnegative integer `gridSize`, fixed when the set is created).
 * Coordinates (x,y,z) are interpreted as points in 3D space in the conventional way.
 * 
 * Buildings must rest on the ground (the z=0 plane), and a building must be *contiguous*:
 * any cell in the building must be reachable from any other cell in the building by a path
 * passing through adjacent cells, where we define adjacent cells as sharing a face (not just an edge or corner).
 * 
 * Buildings have floors numbered from 0 (the ground floor, resting on the ground plane) upwards to at
 * most `gridSize`-1. Each individual floor of a building must be contiguous.
 * 
 * Each building is labeled uniquely, and buildings must *not intersect*: no cell may be in more than one building.
 * 
 * Labels are of arbitrary type `L` and are compared for equality using ===. They may not be null or undefined.
 * 
 * PS2 instructions: this is a required ADT interface.
 * You may not change the specifications or add new methods.
 * 
 * @param L type of labels in this city, compared for equality using ===.
 */
export class City<L> {

    private readonly cityArray: Array<RegionSet<L>> = [];

    //   (must use RegionSet in the rep)

    // Abstraction function:
    // AF(cityArray, gridSize) = the city object of a set of buildings, the city has gridSize number of floors, for floors ranging from [0, gridSize - 1], 
    //                           and each floor is represented by a regionSet, which is an element in the cityArray. 
    //                           The ith floor corresponds to index i of cityArray. For each regionSet of the cityArray, 
    //                           it is a 2D plane that represents the labels of buildings on that floor, 
    //                           and the dimension of each 2D plane is also gridSize * gridSize. 
    //                           Each building is uniquely labeled, and a building is made up of cells from all floors with the same corresponding label.
    //
    // Representation invariant: 
    // - gridSize >= 0
    // - gridSize is an integer
    // - the length of the cityArray must be gridSize
    // - the gridSize of city must match with the gridSize for each regionSet
    // - each building formed by the set of cells with the same label across different floors must be contiguous, for any two cells in the building, 
    //   they must be reachable from each other through a path with adjacent faces (edges or corners don't count)
    // - within each floor of the building must be contiguous
    // - buildings must be grounded, with floors from 0 to at most (gridSize - 1)
    // - any two buildings in the city with different labels may not intersect with each other
    //   
    // Safety from rep exposure:
    // - cityArray is a private field so that is cannot be accessed outside the class and prevent mutation to the array
    // - cityArray is readonly so that it cannot be reassigned once created 
    // - gridSize is immutable and readonly
    // - we are never returning the cityArray itself in any methods, so this prevents the client from changing the rep
    // - expand() is the only method that mutates the cityArray, and we are passing in a floor number and a rectangle that is immutable,
    //   as well as label of type L, which could be compared for equality using === to prevent the client from modifying these objects
    // - for bounds(), the footprint rectangle and the height that we are returning is immutable so that it is safe 
    // - for owners(), we are returning a set, but changing the set would not change anything about the cityArray, so it is safe

    /**
     * Create an empty city with a `gridSize` x `gridSize` x `gridSize` grid.
     * 
     * @param gridSize dimension of city grid, must be nonnegative integer
     */
    public constructor(
        public readonly gridSize: number
    ) {
        for (let i = 0; i < this.gridSize; i++) {
            const newRegionSet = makeRegionSet<L>(this.gridSize);
            this.cityArray.push(newRegionSet);
        }

        this.checkRep();
    }

    //helper functions:
    /**
     * 
     * Given a floorNum, return the array of labels(or undefined) of that regionSet.
     * The numbering of the array is in row-major order, where the upmost, 
     * rightmost one represents the 0th index, and the downmost, rightmost one represents index (gridSize * gridSize - 1)
     * 
     * @param floorNum from [0, gridSize - 1]
     * @returns Array of labels of undefined 
     * 
     */
    private getRegionSetArray(floorNum: number): Array<L | undefined> {
        const floorRegion = this.cityArray[floorNum]; //this is the regioinSet that corresponds to that floor
        const floorArray: Array<L | undefined> = new Array<L | undefined>();
        const floorArrayLength = this.gridSize * this.gridSize;
        for (let i = 0; i < floorArrayLength; i++) {
            const cellRect = this.getRectangle(i); // this is the rectangle object correspond to the unit cell
            const cellLabel = floorRegion?.owners(cellRect); // this should give the label of that unit cell
            if (cellLabel?.size === 0) {
                floorArray.push(undefined);
            }
            if (cellLabel?.size !== 0) {
                assert(cellLabel?.size === 1); //cellLabel is a set of size 1

                for (const thisLabel of cellLabel) {
                    floorArray.push(thisLabel); // adds the label/undefined to the floorArray
                }
            }
        }
        return floorArray;
    }


    /**
     * 
     * Given an index in the regionSet array, return the rectangle corresponding to that cell.
     * 
     * @param index the number of element to be checked in the array
     * @returns rectangle of the given index 
     */
    private getRectangle(index: number): Rect {
        if (this.gridSize === 0) { return new Rect(0, 0, 0, 0); }
        const rowNum = Math.floor(index / this.gridSize);
        const colNum = index % this.gridSize;
        const x1 = colNum;
        const y1 = this.gridSize - 1 - rowNum;
        const x2 = x1 + 1;
        const y2 = y1 + 1;
        return new Rect(x1, y1, x2, y2);

    }

    /**
     * 
     * Given a rectangle within the grid, return the indices of the array that the rectangle covers
     * the length of the array is gridSize * gridSize, and the indices are in row-major order.
     * 
     * @param rect the rectangle to be checked
     * @returns an array of number of indices of the input rectangle 
     */
    private getRectangleIndex(rect: Rect): Array<number> {
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

    private checkRep(): void {
        // check that gridSize is a valid number
        if (this.gridSize < 0 || !Number.isInteger(this.gridSize)) {
            throw new Error("Grid size must be a nonnegative integer");
        }

        // check that the length of the cityArray must be gridSize
        if (this.cityArray.length !== this.gridSize) {
            throw new Error("Length of cityArray must be equal to gridSize");
        }

        // check that the gridSize of city must match with the gridSize for each regionSet
        for (let i = 0; i < this.gridSize; i++) {
            if (this.cityArray[i]?.gridSize !== this.gridSize) {
                throw new Error("gridSize for each RegionSet must be equal to gridSize of city");
            }
        }
        // check that each building formed by the set of cells with the same label across different floors must be contiguous
        const allLabelSet = new Set<L>;
        //get the set of all labels in city 
        for (let i = 0; i < this.gridSize; i++) {
            // this is the rect for each regionSet 
            const regionRect = new Rect(0, 0, this.gridSize, this.gridSize);
            const regionOwners = this.cityArray[i]?.owners(regionRect);
            assert(regionOwners !== undefined);
            for (const owner of regionOwners) {
                allLabelSet.add(owner);
            }
        }

        // this chunck of code is very different than the ones in line 242-254 (as mentioned in the comments from code review)
        // this is basically just trying to get all the labels that exist,  and then push the sets of indicies for each
        // while the lines in 242-254 is trying to make the coordinates with that label 
        for (const label of allLabelSet) {
            // iterate through each label of building
            const indexofLabelInBuilding = new Array<Set<number>>();
            // this holds the array of set of each floor's indices with that label
            for (let floor = 0; floor < this.gridSize; floor++) {
                // make a label set of indices all coordinates with that label 
                const indexOfLabelSet = new Set<number>();
                // creates a new empty set to hold the indices of regions with the given label for the current floor
                const floorLabelArray = this.getRegionSetArray(floor); //the array of all labels within each floor
                // get an array of all the labels present on the current floor
                for (let i = 0; i < floorLabelArray.length; i++) {
                    // iterates over each region on the current floor
                    if (floorLabelArray[i] === label) {
                        // checks whether the current region has the label
                        indexOfLabelSet.add(i);
                        // if the region has the label, adds its index to the set of indices for the label on the current floor
                    }
                }
                indexofLabelInBuilding.push(indexOfLabelSet);
            }
            for (let i = 0; i < indexofLabelInBuilding.length - 1; i++) {
                // iterates over each pair of adjacent floors in the building, up to but not including the last floor (no more to check)
                const j = i + 1;
                // sets j to the index of the next floor in the building in order to compare the current floor to the next floor
                let thisFloorCheck = false;
                // initializes a boolean variable thisFloorCheck to false, which will be used to 
                // check whether the current floor is contiguous with the next floor
                const thisIndexSet = indexofLabelInBuilding[i];
                // get the set of indices for the label on the current floor
                const nextIndexSet = indexofLabelInBuilding[j];
                // get the set of indices for the label on the next floor
                assert(thisIndexSet !== undefined);
                assert(nextIndexSet !== undefined);
                if (nextIndexSet.size === 0) {
                    // checks whether there are any regions with the label on the next floor
                    // If there are none, then the current floor is considered contiguous with the next floor
                    thisFloorCheck = true;
                }
                assert(thisIndexSet !== undefined);
                for (const index of thisIndexSet) {

                    if (nextIndexSet.has(index)) {
                        // checks whether the index is also present in the set of indices for the label on the next floor
                        thisFloorCheck = true;
                    }
                }
                if (!thisFloorCheck) {
                    throw new Error("Each building of same label must be contiguous");
                }
            }

        }

    }

    /**
     * Add a rectangle of grid cells to a particular floor of the building labeled by the given label (creating
     * a building or adding a floor if necessary), if the expanded building rests on the ground plane, is still
     * contiguous, and the expansion does not intersect with other existing buildings.
     * 
     * @param label label of building
     * @param floor floor of building to expand. Must be an integer in [0,`gridSize`-1].
     * @param rect rectangle to add to specified floor of the labeled building.  Required to have nonzero area
     *             and integer coordinates drawn from [0,`gridSize`].
     * @throws Error if adding the expansion would make the building ungrounded, the building or floor
     *         discontiguous, or cause an intersection with a cell in another building.
     */
    public expand(label: L, floor: number, rect: Rect): void {
    // response to comment: my logic is basically that if it is contiguous with the floor beneath it, or find some surface that it's connected to (not just an edge)
    // and that we keep checking every layer (similar to an induction feeling), then the whole building should be contiguous, which is why i'm only accessing the lables
    // from the floor below it 

        if (floor !== 0) {
            // only add if there's a block of the same label in the floor below it 
            const indexLabel = new Array<Set<number>>();
            // this holds the array of set of each floor's indices with that label
            for (let floor = 0; floor < this.gridSize; floor++) {
                // make a label set of indices all coordinates with that label 
                const indexOfLabelSet = new Set<number>();
                const floorLabelArray = this.getRegionSetArray(floor); //the array of all labels within each floor
                for (let i = 0; i < floorLabelArray.length; i++) {
                    if (floorLabelArray[i] === label) {
                        indexOfLabelSet.add(i);
                    }
                }
                indexLabel.push(indexOfLabelSet);
            }

            let contiguous = false;
            const addedRectIndexSet = this.getRectangleIndex(rect);
            // console.log(addedRectIndexSet)
            const belowFloorIndex = indexLabel[floor - 1];
            assert (belowFloorIndex !== undefined);
            // console.log(belowFloorIndex)
            const curFloorOwners = this.cityArray[floor]?.owners(new Rect(0, 0, this.gridSize, this.gridSize));
            if (curFloorOwners !== undefined) {
                assert(curFloorOwners !== undefined);
                // console.log('1')
                // console.log(curFloorOwners);
                if (curFloorOwners.has(label)) {
                    contiguous = true;
                    // console.log('2')
                }
            }
            for (const index of addedRectIndexSet) {
                if (belowFloorIndex.has(index)) {
                    contiguous = true;
                }
            }
            if (!contiguous) {
                throw new Error("Cannot add rectangle that would make building discontiguous");
            }
        }

        // add the rectangle
        this.cityArray[floor]?.add(label, rect);


    }

    /**
     * Get the labels of buildings whose projections onto the ground plane intersect the given rectangle
     * (where the intersection must contain at least one full grid cell).
     * 
     * @param rect rectangle to query. Its coordinates must be integers in [0,`gridSize`].
     * @returns the labels of buildings in this city whose projections onto the ground plane intersect with rect
     *          in at least one grid cell
     */
    public owners(rect: Rect): Set<L> {
        // Response to comment: I did not do it from scratch, I did call the owners method on every floor (regionset)
        // in the line const regionOwners = this.cityArray[i]?.owners(regionRect); 
        // and then I added all the owners from each floor together. 
        const labelSet = new Set<L>();
        const rectIndices = this.getRectangleIndex(rect);

        const allLabelSet = new Set<L>;
        //get the set of all labels in city 
        for (let i = 0; i < this.gridSize; i++) {
            // this is the rect for each regionSet 
            const regionRect = new Rect(0, 0, this.gridSize, this.gridSize);
            const regionOwners = this.cityArray[i]?.owners(regionRect);
            assert(regionOwners !== undefined);
            for (const owner of regionOwners) {
                allLabelSet.add(owner);
            }
        }

        for (const label of allLabelSet) {
            // iterate through each label of building
            const indexofLabelInBuilding = new Array<Set<number>>();
            // this holds the array of set of each floor's indices with that label
            for (let floor = 0; floor < this.gridSize; floor++) {
                // make a label set of indices all coordinates with that label 
                const indexOfLabelSet = new Set<number>();
                const floorLabelArray = this.getRegionSetArray(floor); //the array of all labels within each floor
                for (let i = 0; i < floorLabelArray.length; i++) {
                    if (floorLabelArray[i] === label) {
                        indexOfLabelSet.add(i);
                    }
                }
                indexofLabelInBuilding.push(indexOfLabelSet);
            }

            
            for (const rectIndex of rectIndices) {
                for (const index of indexofLabelInBuilding) {
                    if (index.has(rectIndex)) {
                        labelSet.add(label);
                    }
                }
            }
        }
        return labelSet;
    }

    /**
     * Get the footprint and height of a labeled building.
     * 
     * @param label label of building
     * @returns building's footprint (smallest rectangle that contains the projection of the building onto the
     *          ground plane) and height (number of floors in the building), or undefined if no building with
     *          that label exists in this city.
     */
    public bounds(label: L): { footprint: Rect, height: number } | undefined {

        const firstBound = this.cityArray[0]?.bounds(label);
        if (firstBound === undefined) {
            return undefined;
        }

        assert(firstBound !== undefined);

        let minx1 = firstBound.x1;
        let miny1 = firstBound.y1;
        let maxx2 = firstBound.x2;
        let maxy2 = firstBound.y2;
        let maxHeight = 0;

        for (let floor = 0; floor < this.gridSize; floor++) {
            const thisFloorBound = this.cityArray[floor]?.bounds(label);
            if (thisFloorBound !== undefined) {
                maxHeight = floor;
                //assert(thisFloorBound !== undefined);
                minx1 = Math.min(thisFloorBound.x1, minx1);
                miny1 = Math.min(thisFloorBound.y1, miny1);
                maxx2 = Math.max(thisFloorBound.x2, maxx2);
                maxy2 = Math.max(thisFloorBound.y2, maxy2);
                // if (thisFloorBound.x1 < minx1) {
                //     minx1 = thisFloorBound.x1;
                // }
                // if (thisFloorBound.y1 < miny1) {
                //     miny1 = thisFloorBound.x2;
                // }
                // if (thisFloorBound.x2 > maxx2) {
                //     maxx2 = thisFloorBound.x2;
                // }
                // if (thisFloorBound.y2 > maxy2) {
                //     maxy2 = thisFloorBound.y2;
                // }
            }
        }

        return { footprint: new Rect(minx1, miny1, maxx2, maxy2), height: maxHeight + 1 };

    }

    public toString(): string {
        let result = '';
        for (let i = 0; i < this.gridSize; i++) {
            const thisRegion = this.cityArray[i];
            if (thisRegion != undefined) {
                assert(thisRegion !== undefined);
                result += `Floor ${i}:\n${thisRegion.toString()}\n`;
            }
        }
        return result;
    }

}
