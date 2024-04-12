/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from "assert";
import { Puzzle, Coordinate } from "../src/puzzle";

export class Client {
    // AF(currentPuzzle) = a person who is playing the Star Battle game, specifically the puzzle
    //                  currentPuzzle. If currentPuzzle is undefined, they are still loading the puzzle.
    // RI: true
    //
    // Safety from rep exposure:
    //      the only instance variable is immutable and private
    private currentPuzzle: Puzzle | undefined;

    /**
     * Make a new Client.
     */
    public constructor() {
        this.currentPuzzle = undefined;
    }

    /**
     * Check that the representation invariant holds
     *
     * @throws AssertionError if the representation invariant is violated
     */
    private checkRep(): void {
        assert(true);
    }

    /**
     * Send a request to the server to get a blank puzzle, and set the current puzzle to the blank puzzle
     *
     * @param filename filename of the puzzle to request
     * @returns a promise that resolves to the blank puzzle
     */
    public async requestBlankPuzzle(filename: string): Promise<Puzzle> {
        const response = await fetch(
            `http://localhost:8789/emptyPuzzle/${filename}`
        );
        const data = await response.text();
        const puzzle = Puzzle.fromString(data);
        this.setCurrentPuzzle(puzzle);
        return puzzle;
    }

    /**
     * Set the current puzzle to the given puzzle
     *
     * @param puzzle puzzle to set the current puzzle to
     */
    public setCurrentPuzzle(puzzle: Puzzle): void {
        this.currentPuzzle = puzzle;
    }

    /**
     * Get the current puzzle
     *
     * @returns the current puzzle
     */
    public getCurrentPuzzle(): Puzzle | undefined {
        return this.currentPuzzle;
    }

    /**
     * Puts a star at the given row and column in the Client puzzle
     *
     * @param row row to put the star at
     * @param col column to put the star at
     * @returns the new puzzle with the star at the given row and column
     * @throws AssertionError if the Client currently has no puzzle, or if the given row and column are invalid
     */
    public putStarAt(row: number, col: number): Puzzle {
        assert(this.currentPuzzle !== undefined);
        const newPuzzle = this.currentPuzzle?.putStarAt(row, col);
        this.setCurrentPuzzle(newPuzzle);
        return newPuzzle;
    }

    /**
     * Remove the star at the given row and column in the Client puzzle
     *
     * @param row row to remove the star at
     * @param col column to remove the star at
     * @returns the new puzzle with the star removed at the given row and column
     * @throws AssertionError if the Client currently has no puzzle, or if the given row and column are invalid
     */
    public removeStarAt(row: number, col: number): Puzzle {
        assert(this.currentPuzzle !== undefined);
        const newPuzzle = this.currentPuzzle?.removeStarAt(row, col);
        this.setCurrentPuzzle(newPuzzle);
        return newPuzzle;
    }

    /**
     * Check whether the current puzzle is solved
     *
     * @returns true iff the current puzzle is solved
     * @throws AssertionError if the Client currently has no puzzle
     */
    public isSolved(): boolean {
        assert(this.currentPuzzle !== undefined);
        return this.currentPuzzle?.isSolved();
    }
}
