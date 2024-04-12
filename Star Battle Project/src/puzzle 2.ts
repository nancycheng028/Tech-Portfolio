import assert from "assert";
import { parsePuzzle } from "../src/Parser";

export class Puzzle {
    public readonly rows: number;
    public readonly cols: number;
    private readonly stars: Array<Coordinate>;
    private readonly connectedRegions: Array<Array<Coordinate>>;

    // Abstraction function
    // AF(rows, cols, stars, connectedRegions) = a puzzle object with rows number of rows,
    // cols number of columns, stars indicating the position of stars on the board,
    // and connectedRegions indicating the connected regions on the board.
    //
    // Rep invariant
    // - rows is a positive integer
    // - cols is a positive integer
    // - stars and connectedRegions contain only valid coordinates within the bounds of the board
    //
    // Safety from rep exposure
    // - all fields are private
    // - Coordinate objects are immutable

    /**
     *
     * Constructs a new puzzle object
     *
     * @param rows a number that represents the number of rows of the board
     * @param cols a number that represents the number of columns of the board
     * @param stars array of coordinates that represent the positions of stars on the board
     * @param connectedRegions array of arrays of coordinates that represent the connected regions on the board
     *
     */
    public constructor(
        rows: number,
        cols: number,
        stars: Array<Coordinate>,
        connectedRegions: Array<Array<Coordinate>>
    ) {
        this.rows = rows;
        this.cols = cols;
        this.stars = stars.slice();
        this.connectedRegions = connectedRegions.map((region) =>
            region.slice()
        );
        this.checkRep();
    }

    /**
     * Checks that the rep invariant holds
     *
     * @throws AssertionError if the rep invariant is violated
     */
    private checkRep(): void {
        assert(
            this.rows > 0 && Number.isInteger(this.rows),
            "number of rows must be a positive integer"
        );
        assert(
            this.cols > 0 && Number.isInteger(this.cols),
            "number of columns must be a positive integer"
        );
        this.stars.forEach((coord) => {
            assert(
                this.isValidCoordinate(coord),
                `invalid coordinate: ${coord}`
            );
        });
        this.connectedRegions.forEach((region) => {
            region.forEach((coord) => {
                assert(
                    this.isValidCoordinate(coord),
                    `invalid coordinate: ${coord}`
                );
            });
        });
    }

    /**
     * Checks if the given coordinate is within the bounds of the board
     *
     * @param coord the coordinate to check
     * @returns true if the coordinate is within the bounds of the board, false otherwise
     */
    private isValidCoordinate(coord: Coordinate): boolean {
        return (
            coord.x >= 0 &&
            coord.x < this.rows &&
            coord.y >= 0 &&
            coord.y < this.cols
        );
    }

    /**
     * Parse a string representation of a puzzle into a Puzzle object
     *
     * @param puzzleString a string representation of the puzzle, in the format described
     *                     in the assignment handout
     * @returns a Puzzle object parsed from the string
     * @throws Error if the string is not a valid puzzle
     */
    public static fromString(puzzleString: string): Puzzle {
        return parsePuzzle(puzzleString);
    }

    /**
     * Check whether the puzzle has a star at the given row and column
     *
     * @param row row to check, must be a valid row coordinate
     * @param col column to check, must be a valid column coordinate
     * @returns true if the puzzle has a star at the given row and column, false otherwise
     * @throws AssertionError if the row or column is not a valid coordinate
     */
    public hasStarAt(row: number, col: number): boolean {
        const thisCoordinate = new Coordinate(row, col);
        assert(this.isValidCoordinate(thisCoordinate), "Invalid coordinate.");
        return this.stars.some((coord) => coord.equals(thisCoordinate));
    }

    /**
     * Put a star at the given row and column
     *
     * @param row row to put star at, must be a valid row coordinate
     * @param col column to put star at, must be a valid column coordinate
     * @returns a new puzzle with a star at the given row and column
     * @throws AssertionError if the puzzle already has a star at the given row and column, or
     *                        if the row or column is not a valid coordinate
     */
    public putStarAt(row: number, col: number): Puzzle {
        assert(
            this.isValidCoordinate(new Coordinate(row, col)),
            "Invalid coordinate."
        );
        assert(
            !this.hasStarAt(row, col),
            "A star already exists at the given coordinate."
        );
        const newCoordinate = new Coordinate(row, col);
        const newStars = this.stars.slice();
        newStars.push(newCoordinate);
        return new Puzzle(
            this.rows,
            this.cols,
            newStars,
            this.connectedRegions
        );
    }

    /**
     * Remove a star at the given row and column
     *
     * @param row row to remove star at, must be a valid row coordinate
     * @param col column to remove star at, must be a valid column coordinate
     * @returns a new puzzle with no star at the given row and column
     * @throws AssertionError if the puzzle does not have a star at the given row and column, or
     *                         if the row or column is not a valid coordinate
     */
    public removeStarAt(row: number, col: number): Puzzle {
        assert(
            this.isValidCoordinate(new Coordinate(row, col)),
            "Invalid coordinate."
        );
        assert(
            this.hasStarAt(row, col),
            "No star exists at the given coordinate."
        );
        const newStars = this.stars.filter(
            (coord) => !(coord.x === row && coord.y === col)
        );
        return new Puzzle(
            this.rows,
            this.cols,
            newStars,
            this.connectedRegions
        );
    }

    /**
     * Get a string representation of the puzzle without stars
     *
     * @returns a parseable string representation of the puzzle without stars such that
     *          Puzzle.fromString(puzzle.getParseableBlankPuzzle()) has the same regions
     *          as the original puzzle but no stars
     */
    public getParseableBlankPuzzle(): string {
        let result = "";
        result = result + this.rows + "x" + this.cols + "\n";
        for (const region of this.connectedRegions) {
            result += "|";
            for (const coord of region) {
                result += `${coord.x + 1},${coord.y + 1} `;
            }
            result += "\n";
        }
        return result;
    }

    /**
     * Get the connected regions of the puzzle
     *
     * @returns a copy of the connected regions of the puzzle
     */
    public getRegions(): Array<Array<Coordinate>> {
        // makes defensive copy, assuming that Coordinate objects are immutable
        return this.connectedRegions.map((region) => [...region]);
    }

    /**
     * Check whether the puzzle is solved
     *
     * @returns true iff the puzzle is solved, that is, each row, column, and region
     *         has exactly 2 stars
     */
    public isSolved(): boolean {
        // Check each row has exactly 2 stars
        for (let i = 0; i < this.rows; i++) {
            let count = 0;
            for (let j = 0; j < this.cols; j++) {
                if (this.hasStarAt(i, j)) {
                    count++;
                }
            }
            if (count !== 2) {
                return false;
            }
        }

        // Check each column has exactly 2 stars
        for (let j = 0; j < this.cols; j++) {
            let count = 0;
            for (let i = 0; i < this.rows; i++) {
                if (this.hasStarAt(i, j)) {
                    count++;
                }
            }
            if (count !== 2) {
                return false;
            }
        }

        // Check each region has exactly 2 stars
        for (const region of this.connectedRegions) {
            let count = 0;
            for (const coord of region) {
                if (this.hasStarAt(coord.x, coord.y)) {
                    count++;
                }
            }
            if (count !== 2) {
                return false;
            }
        }

        // Check no stars are vertically, horizontally, or diagonally adjacent
        for (const star1 of this.stars) {
            for (const star2 of this.stars) {
                if (star1 !== star2 && star1.isAdjacent(star2)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Check whether this puzzle is equal to another puzzle
     *
     * @param other puzzle to compare to
     * @returns true iff this puzzle is equal to the other puzzle, that is, they have the
     *         same dimensions, stars in the same place, and same regions (in any order)
     */
    public equals(other: Puzzle): boolean {
        if (this.rows !== other.rows || this.cols !== other.cols) {
            return false;
        }
        // check that stars match
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.hasStarAt(i, j) !== other.hasStarAt(i, j)) {
                    return false;
                }
            }
        }
        // check that regions match
        if (this.connectedRegions.length !== other.connectedRegions.length) {
            return false;
        }
        for (const thisRegion of this.connectedRegions) {
            let foundMatch = false;
            for (const otherRegion of other.connectedRegions) {
                if (otherRegion.length !== thisRegion.length) {
                    continue;
                }
                let foundMismatch = false;
                for (const thisCoordinate of thisRegion) {
                    if (
                        !otherRegion.some((otherCoordinate) =>
                            otherCoordinate.equals(thisCoordinate)
                        )
                    ) {
                        foundMismatch = true;
                        break;
                    }
                }
                if (!foundMismatch) {
                    foundMatch = true;
                    break;
                }
            }
            if (!foundMatch) {
                return false;
            }
        }
        return true;
    }
}

export class Coordinate {
    public readonly x: number;
    public readonly y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Compares this coordinate with another coordinate for equality
     *
     * @param other The other coordinate to compare with
     * @returns True if the coordinates are equal, false otherwise
     */
    public equals(other: Coordinate): boolean {
        return this.x === other.x && this.y === other.y;
    }

    /**
     * Checks if this coordinate is adjacent to another coordinate.
     *
     * @param other The other coordinate to check for adjacency.
     * @returns True if this coordinate is adjacent to the other, false otherwise.
     */
    public isAdjacent(other: Coordinate): boolean {
        const dx = Math.abs(this.x - other.x);
        const dy = Math.abs(this.y - other.y);

        // Coordinates are considered adjacent if the absolute difference in their
        // x and y coordinates is no greater than 1, and they are not equal.
        return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
    }

    /**
     * @inheritdoc
     */
    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}
