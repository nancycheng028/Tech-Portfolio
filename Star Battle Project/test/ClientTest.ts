import assert from "assert";
import { Client } from "../src/client";
import { WebServer } from "../src/StarbServer";
import fs from "fs";
import { Puzzle } from "../src/puzzle";

describe("client", function () {
    /**
     * Testing Partition:
     *
     * requestBlankPuzzle:
     *      partition on if the file name is valid: yes, no
     *      partition on the final state of the promise: resolved, rejected
     *
     * getCurrentPuzzle:
     *      partition on the puzzle to get: valid, undefined
     *
     * setCurrentPuzzle, isSolved:
     *      partition on whether there is already a puzzle: yes, no
     *
     * putStarAt, removeStarAt:
     *      partition on if there is existing star at the coordinate: yes, no
     *      partition on if the coordinate is valid: yes, no
     *
     * isSolved:
     *      partition on puzzle solving state: fully solved, partially solved, not solved at all
     */
    it("requestBlankPuzzle: valid file name, promise resolved, returns valid puzzle", async function () {
        this.timeout(5000);
        const server = new WebServer(8789);
        const client = new Client();
        await server.start();
        try {
            const puzzle = await client.requestBlankPuzzle("kd-1-1-1");
            const expectedPuzzleString = await fs.promises.readFile(
                "./puzzles/kd-1-1-1.starb",
                "utf8"
            );
            const expectedBlankPuzzleString =
                Puzzle.fromString(
                    expectedPuzzleString
                ).getParseableBlankPuzzle();
            const expectedPuzzle = Puzzle.fromString(expectedBlankPuzzleString);
            assert(puzzle.equals(expectedPuzzle));
        } catch (err) {
            // gracefully exit
            await server.stop();
            throw err;
        }
        await server.stop();
    });

    it("requestBlankPuzzle: invalid file name, promise rejected", async function () {
        this.timeout(5000);
        const server = new WebServer(8789);
        const client = new Client();
        await server.start();
        try {
            await client.requestBlankPuzzle("invalid-file-name");
            await server.stop();
            assert.fail("should not reach here");
        } catch (err) {
            // gracefully exit
            await server.stop();
        }
    });
    it("setCurrentPuzzle, getCurrentPuzzle: undefined puzzle, valid puzzle, and overwriting puzzle", async function () {
        const client = new Client();
        assert.strictEqual(client.getCurrentPuzzle(), undefined);

        const puzzleString = await fs.promises.readFile(
            "./puzzles/kd-1-1-1.starb",
            "utf8"
        );
        const puzzle = Puzzle.fromString(puzzleString);
        client.setCurrentPuzzle(puzzle);
        assert(client.getCurrentPuzzle()?.equals(puzzle));
        // change to blank puzzle
        const blankPuzzleString = puzzle.getParseableBlankPuzzle();
        const blankPuzzle = Puzzle.fromString(blankPuzzleString);
        client.setCurrentPuzzle(blankPuzzle);

        assert(client.getCurrentPuzzle()?.equals(blankPuzzle));
        assert(!client.getCurrentPuzzle()?.equals(puzzle));
    });

    it("putStarAt, removeStarAt: valid coordinate, no existing star", async function () {
        const puzzleString = await fs.promises.readFile(
            "./puzzles/kd-1-1-1.starb",
            "utf8"
        );
        const blankPuzzleString =
            Puzzle.fromString(puzzleString).getParseableBlankPuzzle();
        const puzzle = Puzzle.fromString(blankPuzzleString);
        const client = new Client();
        client.setCurrentPuzzle(puzzle);
        assert(!client.getCurrentPuzzle()?.hasStarAt(1, 1));
        client.putStarAt(1, 1);
        assert(client.getCurrentPuzzle()?.hasStarAt(1, 1));
        client.removeStarAt(1, 1);
        assert(!client.getCurrentPuzzle()?.hasStarAt(1, 1));
    });

    it("putStarAt, removeStarAt: valid coordinate, existing star", async function () {
        const puzzleString = await fs.promises.readFile(
            "./puzzles/kd-1-1-1.starb",
            "utf8"
        );
        const blankPuzzleString =
            Puzzle.fromString(puzzleString).getParseableBlankPuzzle();
        const puzzle = Puzzle.fromString(blankPuzzleString);
        const client = new Client();
        client.setCurrentPuzzle(puzzle);
        assert(!client.getCurrentPuzzle()?.hasStarAt(1, 1));
        client.putStarAt(1, 1);
        assert(client.getCurrentPuzzle()?.hasStarAt(1, 1));
        try {
            client.putStarAt(1, 1);
            assert.fail("should not reach here");
        } catch (err) {
            assert(err instanceof Error);
        }
        assert(client.getCurrentPuzzle()?.hasStarAt(1, 1));
        client.removeStarAt(1, 1);
        assert(!client.getCurrentPuzzle()?.hasStarAt(1, 1));
    });

    it("putStarAt, removeStarAt: invalid coordinate", async function () {
        const puzzleString = await fs.promises.readFile(
            "./puzzles/kd-1-1-1.starb",
            "utf8"
        );
        const blankPuzzleString =
            Puzzle.fromString(puzzleString).getParseableBlankPuzzle();
        const puzzle = Puzzle.fromString(blankPuzzleString);
        const client = new Client();
        client.setCurrentPuzzle(puzzle);
        try {
            client.putStarAt(15, 15);
            assert.fail("should not reach here");
        } catch (err) {
            assert(err instanceof Error);
        }
    });

    it("isSolved: fully solved puzzle", async function () {
        const puzzleString = await fs.promises.readFile(
            "./puzzles/kd-1-1-1.starb",
            "utf8"
        );
        const puzzle = Puzzle.fromString(puzzleString);
        const client = new Client();
        client.setCurrentPuzzle(puzzle);
        assert(client.isSolved());
    });

    it("isSolved: partially solved puzzle", async function () {
        const puzzleString = await fs.promises.readFile(
            "./puzzles/kd-1-1-1.starb",
            "utf8"
        );
        const puzzle = Puzzle.fromString(puzzleString);
        const blankPuzzleString = puzzle.getParseableBlankPuzzle();
        const blankPuzzle = Puzzle.fromString(blankPuzzleString);
        const client = new Client();
        client.setCurrentPuzzle(blankPuzzle);
        client.putStarAt(1, 1);
        assert(!client.isSolved());
    });

    it("isSolved: unsolved puzzle", async function () {
        const puzzleString = await fs.promises.readFile(
            "./puzzles/kd-1-1-1.starb",
            "utf8"
        );
        const puzzle = Puzzle.fromString(puzzleString);
        const blankPuzzleString = puzzle.getParseableBlankPuzzle();
        const blankPuzzle = Puzzle.fromString(blankPuzzleString);
        const client = new Client();
        client.setCurrentPuzzle(blankPuzzle);
        assert(!client.isSolved());
    });

    it("isSolved: undefined puzzle", async function () {
        const client = new Client();
        try {
            client.isSolved();
            assert.fail("should not reach here");
        } catch (err) {
            assert(err instanceof Error);
        }
    });

});

