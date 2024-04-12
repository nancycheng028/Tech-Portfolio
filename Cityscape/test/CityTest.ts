/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from '../src/Rect';
import { City } from '../src/City';

/**
 * Tests for instance methods of {@link City}.
 * 
 * Warning: all the tests you write in this file must be runnable against any
 * implementations that follow the spec. Your tests will be run against several staff
 * implementations.
 * 
 * DO NOT strengthen the spec of any of the tested methods.
 */

describe('City', function () {
    /*
     * Test for constructor()
     * 
     * Partition on gridSize:
     * - gridSize = 0
     * - gridSize = 1
     * - gridSize > 1
     * 
     * Test for expand()
     * 
     * partition on floor number:
     * - floor = 0
     * - floor = 1
     * - floor = gridSize - 1
     * 
     * partition on types of errors:
     * - if adding the expansion would make the building ungrounded by missing either ground floor or middle floor (error)
     * - if adding the expansion would make the building discontiguous (error)
     * - if adding the expansion would make the floor discontiguous (error)
     * - if adding the expansion would cause an intersection with a cell in another building (error)
     * - no error
     * 
     * partition on if the given labeled region is empty or not 
     * - adding a rectangle to an empty region (create this labeled region)
     * - adding a rectangle to a non-empty region
     * 
     * partition on the relative location between the rectangle and the existing label of building:
     * - the rectangle shares a face with the existing label of building
     * - the rectangle intersects with the existing label of building 
     * 
     * Test for owners()
     * 
     * partition on number of buildings in city
     * - 0 building in city
     * - 1 building in city 
     * - > 1 buildings in city
     * 
     * partition on whether the rectangle is empty:
     * - rectangle is empty (no area)
     * - rectangle is nonempty 
     * 
     * partition on relationship of buildings an rectangle
     * - all buildings are in rectangle
     * - some buildings are inside the rectanlge, some are not
     * - no buildings are inside the rectangle
     * 
     * partition on floor number of buildings:
     * - floor number = 0
     * - floor number = 1
     * - floor number > 1
     * 
     * partition on whether there are buildings with a shared face (or edge if we were looking at projection) with the rectangle 
     * - there are buildings with shared face with the rectangle
     * - no building with shared face with the rectangle 
     * 
     * 
     * Test for bounds()
     * partition on return values:
     * - if no building with label exists, undefined
     * - if there are buildings with label exists, return a footprint and a height
     * 
     * partition on height returned:
     * - height = 0
     * - height > 0
     * 
     * partition on the shape of projected building:
     * - projected building is a rectangle
     * - projected building is convex
     * - projected building is concave
     * 
     * partition on shape between different floors of labeled building:
     * - shape is different among floors
     * - all floors have the same shape 
     * 
     * partition on the number of buildings in city:
     * - 0 building in city (undefined)
     * - 1 building in city
     * - > 1 buildings in city
     * 
     */


    // Testing on constructor:
    // gridSize = 0
    it("creates an empty region set for gridSize=0", function () {
        const empty = new City(0);
        assert.strictEqual(empty.gridSize, 0);
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 0, 0)), new Set(), 'expect no owners in an empty region');
        assert.strictEqual(empty.bounds('A'), undefined);
    });

    // gridSize = 1
    it('creates an empty region set with gridSize = 1', function () {
        const regionSet = new City(1);
        assert.strictEqual(regionSet.gridSize, 1);
        assert.deepStrictEqual(regionSet.owners(new Rect(0, 0, 0, 0)), new Set());
        assert.strictEqual(regionSet.bounds('A'), undefined);
      });

    // gridSize > 1
    it("creates an empty region set for a given grid size > 1", function () {
        const empty = new City(10);
        assert.strictEqual(empty.gridSize, 10);
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 10, 10)), new Set());
        assert.strictEqual(empty.bounds('A'), undefined);
    });

    // Testing on expand():
    // Adding to empty region (creating this labeled region), floor 0, no error
    it('adds a rectangle to an empty region without error', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 1, 1)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
    });

    // Adding to non-empty region, floor 0, no error
    it('adds a rectangle to a non-empty region on floor 0 without error', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 2, 2)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 2, 2), height: 1});
    });

    // Adding to floor 1, non-empty, no error
    it('adds a rectangle to floor 1 without error', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        city.expand('A', 1, new Rect(0, 0, 1, 1));
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 1, 1)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 2});
    });

    // Adding to top floor (gridSize - 1), non-empty, no error, intersect with existing label
    it('adds a rectangle to top floor that intersects with existing label without error', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('A', 1, new Rect(0, 0, 2, 2));
        city.expand('A', 2, new Rect(0, 0, 2, 2));
        city.expand('A', 2, new Rect(1, 1, 2, 2));
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 2, 2)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 2, 2), height: 3});
    });

    // Adding to middle floor, nonempty, no error, shares a face with existing label
    it('adds a rectangle to middle floor that shares a face with existing label without error', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        city.expand('A', 1, new Rect(0, 0, 1, 1));
        city.expand('A', 1, new Rect(1, 0, 2, 1));
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 2, 1)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 2, 1), height: 2});
    });

    // Error: Intersection with another building, floor 0
    it('throws error when adding a rectangle intersects with another labeled building', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        city.expand('B', 0, new Rect(1, 0, 3, 2));
        assert.throws(() => city.expand('A', 0, new Rect(0, 0, 2, 2)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 3, 3)), new Set(['A', 'B']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
        assert.deepStrictEqual(city.bounds('B'), {footprint: new Rect(1, 0, 3, 2), height: 1});
    });

    // Error: intersection with another building, middle floor
    it('throws error when adding a rectangle intersects with another labeled building', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        city.expand('B', 0, new Rect(1, 0, 3, 2));
        city.expand('B', 1, new Rect(1, 0, 3, 2));
        assert.throws(() => city.expand('A', 1, new Rect(0, 0, 2, 2)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 3, 2)), new Set(['A', 'B']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
        assert.deepStrictEqual(city.bounds('B'), {footprint: new Rect(1, 0, 3, 2), height: 2});
    });

    // Error: make the building discontiguous
    it('throws an error when expansion would make the building discontiguous', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.throws(() => city.expand('A', 0, new Rect(2, 2, 3, 3)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 2, 2)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
    });

    // Error: make the building discontiguous
    it('throws an error when expansion of a new floor would make the building discontiguous', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.throws(() => city.expand('A', 1, new Rect(2, 2, 3, 3)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 2, 2)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
    });

    // Error: make the building discontiguous
    it('throws an error when expansion of a new floor would make the building discontiguous', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.throws(() => city.expand('A', 1, new Rect(1, 1, 2, 2)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 2, 2)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
    });

    // Error: make the building discontiguous
    it('throws an error when expansion of a new floor would make the building discontiguous', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.throws(() => city.expand('A', 2, new Rect(0, 0, 1, 1)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 2, 2)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
    });

    // Error: make the floor discontiguous 
    it('throws an error when expansion would make the floor discontiguous', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 3, 1));
        city.expand('A', 1, new Rect(0, 0, 1, 1));
        assert.throws(() => city.expand('A', 1, new Rect(2, 0, 3, 1)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 3, 3)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 3, 1), height: 2});
    });
  
    // Error: expansion would make the building ungrounded (missing ground floor)
    it('throws an error when expansion would make the building ungrounded', function () {
        const city = new City(3);
        assert.throws(() => city.expand('A', 1, new Rect(2, 2, 3, 3)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 3, 3)), new Set());
        assert.strictEqual(city.bounds('A'), undefined);
    });

    // Error: expansion would make the building ungrounded (missing middle floor)
    it('throws an error when expansion would make the building ungrounded', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.throws(() => city.expand('A', 2, new Rect(0, 0, 1, 1)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 3, 3)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
    });

    // Error: expansion would make the building ungrounded by adding a floor of different label
    it('throws an error when expansion would make the building ungrounded', function () {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.throws(() => city.expand('B', 1, new Rect(0, 0, 1, 1)), Error);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 3, 3)), new Set(['A']));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
    });


    // testing on owners():
    // rectangle is empty, 1 building in city, floor = 0, building outisde the rectangle 
    it('returns an empty set if rectangle is empty and contains no buildings', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.deepStrictEqual(city.owners(new Rect(3, 1, 3, 2)), new Set());
    });

    // nonempty rectangle, 0 building in city
    it('empty city should have no owners', function () {
        assert.deepStrictEqual(new City(10).owners(new Rect(0, 0, 10, 10)), new Set());
    });

    // nonempty rectangle, 1 building in city, building intersect with rectangle, floor = 1
    it('returns the owner of the single building of floor 1 that intersects with a nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('A', 1, new Rect(1, 1, 3, 3));
        assert.deepStrictEqual(city.owners(new Rect(1, 1, 3, 3)), new Set(['A']));
    });

    // nonempty rectangle, 1 building in city, building shares edge with projected rectangle, floor = 0 
    it('returns no owner of the single building of floor 0 that shares an edge with the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        assert.deepStrictEqual(city.owners(new Rect(2, 0, 3, 2)), new Set());
    });

    // nonempty rectangle, 1 building in city, building outside rectangle, floor > 1
    it('returns no owner of the single building of floor 2 that is outisde the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(1, 1, 2, 2));
        city.expand('A', 1, new Rect(1, 1, 2, 2));
        city.expand('A', 2, new Rect(1, 1, 2, 2));
        assert.deepStrictEqual(city.owners(new Rect(2, 2, 3, 3)), new Set());
    });

    // nonempty rectangle, > 1 buildings in city, all buildings in rectangle, floor = 0
    it('returns the owners of all buildings of floor 0 that are within the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 2, 3, 3));
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 3, 3)), new Set(['A', 'B']));
    });

    // nonempty rectangle, > 1 buildings in city, all buildings in rectangle, floor = 1
    it('returns the owners of all buildings that intersect with the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('A', 1, new Rect(1, 1, 3, 3));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        assert.deepStrictEqual(city.owners(new Rect(2, 0, 3, 2)), new Set(['A', 'B']));
    });

    // nonempty rectangle, > 1 buildings in city, all buildings in rectangle, floor > 1
    it('returns the owners of all buildings that intersect with the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('A', 1, new Rect(1, 1, 3, 3));
        city.expand('A', 2, new Rect(2, 2, 4, 4));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        city.expand('B', 1, new Rect(1, 0, 3, 1));
        assert.deepStrictEqual(city.owners(new Rect(3, 0, 4, 4)), new Set(['A', 'B']));
    });

    // nonempty rectangle, > 1 buildings in city, some buildings in rectangle, floor = 0
    it('returns the owners of the correct buildings that intersect with the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        assert.deepStrictEqual(city.owners(new Rect(3, 0, 4, 2)), new Set(['B']));
    });

    // nonempty rectangle, > 1 buildings in city, some buildings in rectangle, floor = 1, there are building sharing a face
    it('returns the owners of the correct buildings that intersect with the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        city.expand('B', 1, new Rect(2, 0, 3, 2));
        assert.deepStrictEqual(city.owners(new Rect(2, 1, 4, 2)), new Set(['B']));
    });

    // nonempty rectangle, > 1 buildings in city, some buildings in rectangle, floor > 1
    it('returns the owners of the correct buildings that intersect with the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        city.expand('B', 1, new Rect(2, 0, 3, 2));
        city.expand('B', 2, new Rect(2, 1, 4, 2));
        city.expand('C', 0, new Rect(0, 2, 3, 3));
        assert.deepStrictEqual(city.owners(new Rect(2, 1, 3, 3)), new Set(['B', 'C']));
    });

    // nonempty rectangle, > 1 buildings in city, some buildings in rectangle, floor > 1
    it('returns the owners of the correct buildings that intersect with the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        city.expand('B', 1, new Rect(2, 0, 3, 2));
        city.expand('B', 2, new Rect(2, 1, 4, 2));
        city.expand('C', 0, new Rect(0, 2, 3, 3));
        assert.deepStrictEqual(city.owners(new Rect(3, 1, 4, 2)), new Set(['B']));
    });

    // nonempty rectangle, > 1 buildings in city, no building in rectangle, floor = 0
    it('returns no building when none is inside the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        city.expand('C', 0, new Rect(0, 2, 3, 3));
        assert.deepStrictEqual(city.owners(new Rect(2, 1, 4, 2)), new Set());
    });

    // nonempty rectangle, > 1 buildings in city, no building in rectangle, floor = 1
    it('returns no building when none is inside the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        city.expand('C', 0, new Rect(0, 2, 3, 3));
        city.expand('C', 1, new Rect(2, 2, 4, 3));
        assert.deepStrictEqual(city.owners(new Rect(2, 1, 4, 2)), new Set());
    });

    // nonempty rectangle, > 1 buildings in city, no building in rectangle, floor > 1
    it('returns no building when none is inside the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        city.expand('B', 1, new Rect(2, 0, 3, 2));
        city.expand('B', 2, new Rect(2, 1, 4, 2));
        city.expand('C', 0, new Rect(0, 2, 3, 3));
        assert.deepStrictEqual(city.owners(new Rect(3, 2, 4, 3)), new Set());
    });

    // nonempty rectangle, > 1 buildings in city, no building in rectangle, there is building that shares an edge with the projected rectangle, floor > 1
    it('returns no building when none is inside the nonempty rectangle', function () {
        const city = new City(5);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        city.expand('B', 0, new Rect(2, 0, 4, 1));
        city.expand('B', 1, new Rect(2, 0, 3, 2));
        city.expand('B', 2, new Rect(2, 1, 4, 2));
        city.expand('C', 0, new Rect(0, 2, 3, 3));
        assert.deepStrictEqual(city.owners(new Rect(1, 3, 3, 4)), new Set());
    });

    // testing on bounds():
    // 0 building in city, no building with label exists, undefined
    it('returns undefined if no building with label exists', function() {
        const city = new City(3);
        assert.strictEqual(city.bounds('A'), undefined);
    });

    // 1 building in city, no building with label exists, undefined
    it('returns undefined if no building with label exists', function() {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 2, 2));
        assert.strictEqual(city.bounds('B'), undefined);
    });

    // 1 building in city, building with label exists, height = 0, building is rectangle
    it('returns correct bounds when building with label exists, height = 0', function() {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 1, 1));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 1, 1), height: 1});
    });

    // 1 building in city, building with label exists, height = 0, building is convex
    it('returns correct bounds when building with label exists, height = 0', function() {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 3, 1));
        city.expand('A', 0, new Rect(1, 1, 2, 2));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 3, 2), height: 1});
    });

    // 1 building in city, building with label exists, height > 0, building is rectangle, shape is different among floors
    it('returns correct bounds when building with label exists, height > 0', function() {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 3, 1));
        city.expand('A', 1, new Rect(0, 0, 1, 2));
        city.expand('A', 2, new Rect(0, 1, 3, 2));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 3, 2), height: 3});
    });

    // 1 building in city, building with label exists, height > 0, building is convex, shape is different among floors
    it('returns correct bounds when building with label exists, height > 0', function() {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 3, 1));
        city.expand('A', 1, new Rect(0, 0, 1, 2));
        city.expand('A', 1, new Rect(1, 0, 2, 1));
        city.expand('A', 1, new Rect(2, 0, 3, 2));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 3, 2), height: 2});
    });

    // 1 building in city, building with label exists, height > 0, building is concave, same shape among floors
    it('returns correct bounds when building with label exists, height > 0', function() {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 3, 1));
        city.expand('A', 0, new Rect(0, 1, 1, 2));
        city.expand('A', 0, new Rect(2, 1, 3, 2));
        city.expand('A', 1, new Rect(0, 0, 3, 1));
        city.expand('A', 1, new Rect(0, 1, 1, 2));
        city.expand('A', 1, new Rect(2, 1, 3, 2));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 3, 2), height: 2});
    });

    // > 1 building in city, building with label exists, height = 0, building is rectangle
    it('returns correct bounds when building with label exists, height = 0', function() {
        const city = new City(3);
        city.expand('A', 0, new Rect(0, 0, 3, 1));
        city.expand('B', 0, new Rect(0, 1, 1, 2));
        assert.deepStrictEqual(city.bounds('A'), {footprint: new Rect(0, 0, 3, 1), height: 1});
    });


    
});
