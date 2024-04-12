/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from '../src/Rect';
import { RegionSet } from '../src/RegionSet';
import { implementations } from '../src/RegionSetImpl';

/**
 * Tests for instance methods of {@link RegionSet}.
 * 
 * Warning: all the tests you write in this file must be runnable against any
 * implementations that follow the spec. Your tests will be run against several staff
 * implementations.
 * 
 * DO NOT strengthen the spec of any of the tested methods.
 * 
 * Your tests MUST only obtain RegionSet instances by calling new SomeRegionSetOfString().
 * Your tests MUST NOT refer to specific concrete implementations.
 */

// Can't use makeRegionSet here, because it will only return one particular implementation.
const makeRegionSet = undefined;
// Can't refer to specific concrete implementations.
const RepMapRegionSet = undefined, RepArrayRegionSet = undefined;

// Iterate over the different implementations and run the test suite on each of them:
implementations().forEach(SomeRegionSetOfString => describe(SomeRegionSetOfString.name, function () {
    /*
     * Testing strategy for RegionSet
     * 
     * Test for constructor()
     * 
     * partition on gridSize:
     * - gridSize = 0
     * - gridSize = 1
     * - gridSize > 1
     * 
     * Test each of the methods respectively:
     * 
     * add()
     * 
     * partition on if the given labeled region is empty or not 
     * - adding a rectangle to an empty region (create this labeled region)
     * - adding a rectangle to a non-empty region
     * 
     * partition on types of errors:
     * - no error 
     * - adding the rectangle would make label's region discontiguous (shared corner/completely outside)
     * - adding the rectangle would intersect with a cell in another labeled region
     * 
     * partition on the relative location of the adding rect and the existing label of region
     * - the rectangle is completely within the existing label of region
     * - the rectangle intersects with the existing label of region
     * - the rectangle has a shared edge with the existing label of region
     * - the rectangle can make the region discontiguous (throws error)
     * 
     * 
     * bounds()
     * 
     * partition on return values:
     * - if no region with label exists, undefined
     * - if the region with label exists, return a rectangle
     * 
     * partition on the shape of label of region:
     * - region is a rectangle
     * - region is convex
     * - region is concave
     * 
     * partition on the number of labels in regionSet:
     * - zero label in regionSet (undefined)
     * - one label in regionSet
     * - more than one labels in regionSet
     * 
     * 
     * owners()
     * 
     * partition on whether the rectangle is empty:
     * - rectangle is empty (no area)
     * - rectangle is nonempty 
     * 
     * partition on number of labels in regionSet:
     * - 0 label in regionSet
     * - 1 label in regionSet
     * > 1 labels in regionSet
     * 
     * partition on the relationship of the rectangle and the labels in region
     * - all labels of regionSet are completely inside the rectangle
     * - some labels of regionSet are inside the rectangle, some are not
     * - no labels of regionSet are inside the rectangle
     * 
     * partition on whether labels in regionSet intersects with rectangle
     * - labels intersect with rectangle
     * - labels do not intersect with rectangle 
     * 
     * partition on whether there is a label of region that has a shared edge with the rectangle
     * - there is a label of region with a shared edge
     * - no label of region with shared edge
     */

    // Testing on constructor:
    // gridSize = 0
    it("creates an empty region set for gridSize=0", function () {
        const empty = new SomeRegionSetOfString(0);
        assert.strictEqual(empty.gridSize, 0);
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 0, 0)), new Set());
        assert.strictEqual(empty.bounds("A"), undefined);
    });

    // gridSize = 1
    it('creates an empty region set with gridSize = 1', function () {
        const regionSet = new SomeRegionSetOfString(1);
        assert.strictEqual(regionSet.gridSize, 1);
        assert.deepStrictEqual(regionSet.owners(new Rect(0, 0, 0, 0)), new Set());
        assert.strictEqual(regionSet.bounds("A"), undefined);
      });

    // gridSize > 1
    it("creates an empty region set for a given grid size > 1", function () {
        const empty = new SomeRegionSetOfString(10);
        assert.strictEqual(empty.gridSize, 10);
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 10, 10)), new Set());
        assert.strictEqual(empty.bounds("A"), undefined);
    });



    // Testing on add():
    // empty given region, no error 
    it('adding a rectangle to an empty region should create the labeled region)', function () {
        const empty = new SomeRegionSetOfString(10);
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 10, 10)), new Set());
        empty.add( "A", new Rect(0, 0, 5, 5));
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 10, 10)), new Set(["A"]));
        assert.deepStrictEqual(empty.bounds("A"), new Rect(0, 0, 5, 5));
    });

    // non-empty given region, no error
    it('adding a rectangle to a non-empty region should not create a new labeled region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(1, 1, 5, 5));
        region.add("A", new Rect(4, 4, 6, 6));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A"]));
    });

    // non-empty region, intersection error
    it('adding a rectangle that intersects with another labeled region should throw an error', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        assert.throws(() => region.add("B", new Rect(3, 3, 8, 8)), Error);
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A"]));
        assert.deepStrictEqual(region.bounds("A"), new Rect(0, 0, 5, 5));
    });

    // non-empty region, discontiguous error (completely outside)
    it('adding a rectangle that makes labeled region discontiguous should throw an error', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        assert.throws(() => region.add("A", new Rect(6, 6, 9, 8)), Error);
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A"]));
        assert.deepStrictEqual(region.bounds("A"), new Rect(0, 0, 5, 5));
    });

    // non-empty region, discontiguous error (sharing a corner)
    it('adding a rectangle that makes labeled region discontiguous should throw an error', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        assert.throws(() => region.add("A", new Rect(5, 5, 9, 8)), Error);
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A"]));
        assert.deepStrictEqual(region.bounds("A"), new Rect(0, 0, 5, 5));
    });
    
    // non-empty region, no error, rectangle within existing label
    it('adding a rectangle completely within an existing labeled region should not create a new labeled region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        region.add("A", new Rect(1, 1, 4, 4));
        assert.deepStrictEqual(region.bounds("A"), new Rect(0, 0, 5, 5));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A"]));
      });

    // non-empty region, no error, rectangle intersects with existing label
    it('adding a rectangle that intersects an existing labeled region should expand the existing labeled region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        region.add("A", new Rect(3, 4, 8, 8));
        assert.deepStrictEqual(region.bounds("A"), new Rect(0, 0, 8, 8));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A"]));
      });

    // non-empty region, no error, rectangle shares an edge with existing label
    it('adding a rectangle that shares an edge with an existing labeled region should expand the existing labeled region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(2, 2, 5, 5));
        region.add("A", new Rect(5, 3, 7, 7));
        assert.deepStrictEqual(region.bounds("A"), new Rect(2, 2, 7, 7));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A"]));
      });

    
    it('adding a rectangle that shares an edge with a different labeled region should be ok', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(2, 2, 5, 5));
        region.add("B", new Rect(5, 3, 7, 7));
        assert.deepStrictEqual(region.bounds("A"), new Rect(2, 2, 5, 5));
        assert.deepStrictEqual(region.bounds("B"), new Rect(5, 3, 7, 7));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A", "B"]));
      });

    it('adding a rectangle that shares an edge with a different labeled region should be ok', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 2, 2));
        region.add("B", new Rect(2, 0, 3, 2));
        assert.deepStrictEqual(region.bounds("A"), new Rect(0, 0, 2, 2));
        assert.deepStrictEqual(region.bounds("B"), new Rect(2, 0, 3, 2));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 3, 2)), new Set(["A", "B"]));
      });
    
    // Testing on bounds(): 
    // zero label in region, no region with label exists
    it('adding a rectangle to an empty region should create the labeled region)', function () {
        const empty = new SomeRegionSetOfString(10);
        assert.strictEqual(empty.bounds("A"), undefined);
    });

    // one label in region, no region with label exists
    it('should return undefined if no region with label exists', function () {
        const empty = new SomeRegionSetOfString(10);
        empty.add( "A", new Rect(0, 0, 5, 5));
        assert.strictEqual(empty.bounds("B"), undefined);
    });

    // one label in region, label exists in region, return a rectangle
    it('should return the smallest rectangle that contains all grid cells in the labeled region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(2, 2, 5, 5));
        assert.deepStrictEqual(region.bounds("A"), new Rect(2, 2, 5, 5));
    });

    // more than one labels in region, label exists in region, label is rectangle
    it('should return the smallest rectangle that contains all grid cells in the labeled region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        region.add("B", new Rect(6, 7, 8, 8));
        assert.deepStrictEqual(region.bounds("A"), new Rect(0, 0, 5, 5));
    });
    
    // one label in region, label exists in region, label is convex
    it('should return the smallest rectangle that contains all grid cells in the convex labeled region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(2, 2, 5, 5));
        region.add("A", new Rect(5, 3, 7, 7));
        assert.deepStrictEqual(region.bounds("A"), new Rect(2, 2, 7, 7));
    });

    // one label in region, label exists in region, label is concave
    it('should return the smallest rectangle that contains all grid cells in the concave labeled region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(2, 2, 5, 5));
        region.add("A", new Rect(5, 2, 6, 3));
        region.add("A", new Rect(6, 2, 7, 5));
        assert.deepStrictEqual(region.bounds("A"), new Rect(2, 2, 7, 5));
    });

    // more than one labels in region, label doesn't exist in region
    it('should return undefined when the label passed in does not exist in the region', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(2, 2, 5, 5));
        region.add("B", new Rect(6, 6, 8, 8));
        assert.strictEqual(region.bounds("C"), undefined);
    });


    // Testing on owners():
    // rectangle is empty, 1 label in region
    it('should return an empty set if the rectangle is empty', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 0, 0)), new Set());
    });

    // nonempty rectangle, 0 label in region
    it('empty region set should have no owners', function () {
        const empty = new SomeRegionSetOfString(10);
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 10, 10)), new Set());
    });

    // nonempty rectangle, 1 label in region, label completely covers the rectangle
    it('should return a set with the label if the label completely covers the rectangle', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        assert.deepStrictEqual(region.owners(new Rect(1, 1, 3, 3)), new Set(["A"]));
    });

    // nonempty rectangle, 1 label in region, label is completely inside the rectangle, no shared edge
    it('should return a set with the label if the label is completely inside the rectangle', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(1, 1, 3, 3));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 5, 5)), new Set(["A"]));
    });

    // nonempty rectangle, 1 label in region, label is completely inside the rectangle, there is a shared edge
    it('should return a set with the label if the label is completely inside the rectangle', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(3, 1, 5, 4));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 5, 5)), new Set(["A"]));
    });
  
    // nonempty rectangle, 1 label in region, label is not inside the rectangle, there is a shared edge 
    it('should return an empty set if the label is not inside the rectangle', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(5, 3, 7, 6));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 5, 5)), new Set());
    });
  
    // nonempty rectangle, >1 labels in region, all labels completely inside the rectangle
    it('should return a set with all the labels inside the rectangle', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        region.add("B", new Rect(6, 6, 7, 7));
        assert.deepStrictEqual(region.owners(new Rect(0, 0, 10, 10)), new Set(["A", "B"]));
    });
  
    // nonempty rectangle, >1 labels in region, some labels inside the rectangle
    it('should return a set with only the labels inside the rectangle', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 5, 5));
        region.add("B", new Rect(7, 7, 9, 9));
        assert.deepStrictEqual(region.owners(new Rect(6, 6, 10, 10)), new Set(["B"]));
    });
  
    // nonempty rectangle, >1 labels in region, no labels inside the rectangle
    it('should return an empty set if no labels are inside the rectangle', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 3, 3));
        region.add("B", new Rect(7, 8, 9, 9));
        assert.deepStrictEqual(region.owners(new Rect(4, 5, 7, 7)), new Set());
    });

    // nonempty rectangle, >1 labels in region, labels intersect with 1 rectangle
    it('should return a set with all the intersecting labels', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 3, 3));
        region.add("B", new Rect(7, 8, 9, 9));
        assert.deepStrictEqual(region.owners(new Rect(2, 2, 6, 6)), new Set(["A"]));
    });
  
    // nonempty rectangle, >1 labels in region, labels intersect with >1 rectangles
    it('should return a set with all the intersecting labels', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 3, 3));
        region.add("B", new Rect(4, 5, 7, 7));
        assert.deepStrictEqual(region.owners(new Rect(2, 2, 6, 6)), new Set(["A", "B"]));
    });

    it ('should give empty set when area is zero', function () {
        const region = new SomeRegionSetOfString(10);
        region.add("A", new Rect(0, 0, 3, 3));
        region.add("B", new Rect(4, 5, 7, 7));
        assert.deepStrictEqual(region.owners(new Rect(2, 2, 2, 2)), new Set());
    });

}));
