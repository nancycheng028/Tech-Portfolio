import { Puzzle, Coordinate } from '../src/puzzle';
const assert = require("assert");


/**
 * Testing Partition:
 * 
 * fromString:
 *      partition on if the string is a valid puzzle board representation: yes, no
 * 
 * putStarAt, removeStarAt, hasStarAt:
 *      partition on the row to put/remove/has star at: 1, (1,10), 10
 *      partition on the column to put/remove/has star at: 1, (1,10), 10
 *      partition on if there is existing star at the coordinate: yes, no
 *      partition on if the coordinate is valid: yes, no
 * 
 * isSolved:
 *      partition on puzzle solving state: fully solved, partially solved, not solved at all
 *      partition on if the puzzle satisfies 2 stars in each row: yes, no
 *      partition on if the puzzle satisfies 2 stars in each column: yes, no
 *      partition on if the puzzle satisfies 2 stars in each region: yes, no
 */
   

describe("Puzzle", () => {
    // Test rep invariants
    it("should throw an error if rows is not a positive integer", () => {
      assert.throws(() => new Puzzle(-1, 10, [], []), {
        message: "number of rows must be a positive integer",
      });
    });
  
    it("should throw an error if cols is not a positive integer", () => {
      assert.throws(() => new Puzzle(10, 0, [], []), {
        message: "number of columns must be a positive integer",
      });
    });
  
    it("should throw an error if stars contains an invalid coordinate", () => {
      assert.throws(
        () => new Puzzle(10, 10, [new Coordinate(-1, 5)], []),
        { message: "invalid coordinate: (-1, 5)" }
      );
    });
  
    it("should throw an error if connectedRegions contains an invalid coordinate", () => {
      assert.throws(
        () =>
          new Puzzle(10, 10, [], [
            [new Coordinate(5, 5), new Coordinate(15, 15)],
          ]),
        { message: "invalid coordinate: (15, 15)" }
      );
    });
  
    // Test hasStarAt method
    it("should return true if there is a star at the given coordinate", () => {
      const puzzle = new Puzzle(10, 10, [new Coordinate(5, 5)], []);
      assert.strictEqual(puzzle.hasStarAt(5, 5), true);
    });
  
    it("should return false if there is no star at the given coordinate", () => {
      const puzzle = new Puzzle(10, 10, [new Coordinate(5, 5)], []);
      assert.strictEqual(puzzle.hasStarAt(4, 5), false);
    });
  
    it("should throw an error if the given coordinate is invalid", () => {
      const puzzle = new Puzzle(10, 10, [new Coordinate(5, 5)], []);
      assert.throws(() => puzzle.hasStarAt(-1, 5), {
        message: "Invalid coordinate.",
      });
    });
  
    // Test putStarAt method
    it("should add a star at the given coordinate", () => {
      const puzzle = new Puzzle(10, 10, [], []);
      const newPuzzle = puzzle.putStarAt(5, 5);
      assert.strictEqual(newPuzzle.hasStarAt(5, 5), true);
    });
  
    it("should throw an error if there is already a star at the given coordinate", () => {
      const puzzle = new Puzzle(10, 10, [new Coordinate(5, 5)], []);
      assert.throws(() => puzzle.putStarAt(5, 5), {
        message: "A star already exists at the given coordinate.",
      });
    });
  
    it("should throw an error if the given coordinate is invalid", () => {
      const puzzle = new Puzzle(10, 10, [], []);
      assert.throws(() => puzzle.putStarAt(-1, 5), {
        message: "Invalid coordinate.",
      });
    });

    // Test removeStarAt method
    it("should remove the star at the given coordinate", () => {
        const puzzle = new Puzzle(10, 10, [new Coordinate(5, 5)], []);
        const newPuzzle = puzzle.removeStarAt(5, 5);
        assert.strictEqual(newPuzzle.hasStarAt(5, 5), false);
    });
    
    it("should throw an error if the given coordinate is invalid", () => {
        const puzzle = new Puzzle(10, 10, [new Coordinate(5, 5)], []);
        assert.throws(() => puzzle.removeStarAt(-1, 5), {
        message: "Invalid coordinate.",
        });
    });


})


describe("isSolved method", () => {
    
    it("should return false if the puzzle is not solved at all", () => {
      const puzzle = new Puzzle(5, 5, [], []);
      assert.strictEqual(puzzle.isSolved(), false);
    });
  
    it("should return false when puzzle is not solved", function() {
        const puzzle = new Puzzle(2, 2, [new Coordinate(0, 1)], [[new Coordinate(0, 1)]]);
        assert.strictEqual(puzzle.isSolved(), false);
      });
  
      it("should return false when there is only one star", function() {
        const puzzle = new Puzzle(2, 2, [new Coordinate(0, 1)], [[new Coordinate(0, 1), new Coordinate(1, 0)]]);
        assert.strictEqual(puzzle.isSolved(), false);
      });
  
      it("should return false when there is more than one connected region", function() {
        const puzzle = new Puzzle(2, 2, [new Coordinate(0, 1), new Coordinate(1, 0)], [[new Coordinate(0, 1)], [new Coordinate(1, 0)]]);
        assert.strictEqual(puzzle.isSolved(), false);
      });
  
      it("should return false when there is a disconnected star", function() {
        const puzzle = new Puzzle(2, 2, [new Coordinate(0, 1), new Coordinate(1, 1)], [[new Coordinate(0, 1)]]);
        assert.strictEqual(puzzle.isSolved(), false);
      });
    
})
