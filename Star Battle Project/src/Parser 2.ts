import assert from "assert";
import { Parser, ParseTree, compile, visualizeAsUrl } from "parserlib";
import { Puzzle } from "../src/puzzle";
import { Coordinate } from "../src/puzzle";

// the grammar
const grammar = `
@skip whitespace {
    puzzle ::= (comment newline)* size newline constraints newline;
    size ::= number 'x' number;
    constraints ::= constraint (newline constraint)*;
    constraint ::= ('' | star star) '|' position*;
    star ::= row ',' column;
    position ::= row ',' column;
    comment ::= '#' [^\\n]*;

    row ::= number;
    column ::= number;
    newline ::= '\\n';

}
whitespace ::= [ \\t\\r]+;
number ::= [0-9]+;
`;

enum PuzzleGrammar {
    Puzzle,
    Size,
    Constraint,
    Constraints,
    Position,
    Row,
    Column,
    Number,
    Star,
    Newline,
    Whitespace,
    Comment,
}

// compile the grammar into a parser
const parser: Parser<PuzzleGrammar> = compile(
    grammar,
    PuzzleGrammar,
    PuzzleGrammar.Puzzle
);

/**
 * Parse a string into a Puzzle.
 *
 * @param input string to parse
 * @returns Puzzle parsed from the string
 * @throws ParseError if the string doesn't match the Expression grammar
 */
export function parsePuzzle(input: string): Puzzle {
    // parse the example into a parse tree
    const parseTree: ParseTree<PuzzleGrammar> = parser.parse(input);

    // make an AST from the parse tree
    const puzzle: Puzzle = makeAbstractSyntaxTree(parseTree);
    return puzzle;
}

/**
 * Convert a parse tree into an abstract syntax tree.
 *
 * @param parseTree constructed according to the grammar for the puzzle
 * @returns abstract syntax tree corresponding to the parseTree
 */
function makeAbstractSyntaxTree(parseTree: ParseTree<PuzzleGrammar>): Puzzle {
    const sizeNode = parseTree.childrenByName(PuzzleGrammar.Size)[0];
    assert(sizeNode !== undefined);
    const constraintsNode = parseTree.childrenByName(
        PuzzleGrammar.Constraints
    )[0];

    const dimensions = sizeNode.childrenByName(PuzzleGrammar.Number);
    const rows = parseInt((dimensions[0] ?? assert.fail()).text);
    const cols = parseInt((dimensions[1] ?? assert.fail()).text);

    const starsArray: Array<Coordinate> = new Array<Coordinate>();
    const connectedRegions: Array<Array<Coordinate>> = [];

    const constraints = constraintsNode?.childrenByName(
        PuzzleGrammar.Constraint
    );

    assert(constraints !== undefined);
    for (const constraint of constraints) {
        const regionArray = new Array<Coordinate>();

        const stars = constraint.childrenByName(PuzzleGrammar.Star);
        assert(stars.length === 2 || stars.length === 0);
        for (const star of stars) {
            const x = star.childrenByName(PuzzleGrammar.Row);
            const y = star.childrenByName(PuzzleGrammar.Column);
            const newStar = new Coordinate(
                parseInt((x[0] ?? assert.fail()).text) - 1,
                parseInt((y[0] ?? assert.fail()).text) - 1
            );
            starsArray.push(newStar);
            regionArray.push(newStar);
        }

        const positions = constraint.childrenByName(PuzzleGrammar.Position);
        for (const position of positions) {
            const x = position.childrenByName(PuzzleGrammar.Row);
            const y = position.childrenByName(PuzzleGrammar.Column);
            const newPos = new Coordinate(
                parseInt((x[0] ?? assert.fail()).text) - 1,
                parseInt((y[0] ?? assert.fail()).text) - 1
            );
            regionArray.push(newPos);
        }
        connectedRegions.push(regionArray);
    }

    return new Puzzle(rows, cols, starsArray, connectedRegions);
}

/**
 * Main function for testing.
 */
function main(): void {
    const input = `
    10x10
    1,2  1,5  | 1,1 1,3 1,4 1,6 1,7 1,8 2,1 2,2 2,3 2,4 2,5 2,6 2,8 3,5
    2,9  4,10 | 1,9 1,10 2,10 3,9 3,10 4,9 5,9 5,10 6,9 6,10 7,10 8,10
    3,2  3,4  | 3,3
    2,7  4,8  | 3,6 3,7 3,8
    6,1  9,1  | 3,1 4,1 4,2 4,3 4,4 5,1 5,2 5,3 6,2 7,1 7,2 8,1 8,2 8,3 8,4 8,5 8,6
    5,4  5,6  | 4,5 5,5 6,4 6,5 6,6
    6,8  8,7  | 4,6 4,7 5,7 5,8 6,7 7,6 7,7 7,8 8,8
    7,3  7,5  | 6,3 7,4
    8,9 10,10 | 7,9 9,9 9,10
    9,3  10,6 | 9,2 9,4 9,5 9,6 9,7 9,8 10,1 10,2 10,3 10,4 10,5 10,7 10,8 10,9
    
    `;
    console.log(input);
    const puzzle = parsePuzzle(input);
    console.log(puzzle);
}

if (require.main === module) {
    main();
}
