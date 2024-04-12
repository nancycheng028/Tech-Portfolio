/**
 * Testing strategy for integration tests:
 * 
 *      partition on whether the puzzle is solved: yes, no
 *      partition on whether the puzzle has 2 stars in each row and column but is not solved: yes, no
 *      partition on whether the puzzle has 2 stars in each row and region but is not solved: yes, no
 *      partition on whether the puzzle has 2 stars in each column and region but is not solved: yes, no
 *      partition on whether clicking should add or remove a star: add, remove
 * 
 * Manual test: solve an empty puzzle
 * Covers: solved puzzle, clicking adds star, clicking removes star
 *      1. Enter `npm run server` in the terminal to start the server.
 *      2. Navigate to localhost:8080 in a browser.
 *      3. Verify that there is a 10x10 grid of cells with no stars placed.
 *      4. Verify that there are 10 distinct regions.
 *      5. Verify that clicking on an empty cell places a star in that cell.
 *      6. Verify that clicking on a cell with a star removes the star from that cell.
 *      7. Solve the puzzle, according to the rules of StarBattles.
 *      8. Verify that some indication of success is displayed.
 * 
 * Manual test: give nonsolutions to the puzzle
 * Covers: not solved, 2 stars in each row and column, 2 stars in each row and region, 2 stars in each column and region
 *      1. Enter `npm run server` in the terminal to start the server.
 *      2. Navigate to localhost:8080 in a browser.
 *      3. Change the puzzle to the puzzle so that it is not solved, but still has 2 stars in each row and column.
 *      4. Verify that the indication of success is not displayed.
 *      5. Change the puzzle so that it is not solved, but still has 2 stars in each row and region.
 *      6. Verify that the indication of success is not displayed.
 *      7. Change the puzzle to the puzzle so that it is not solved, but still has 2 stars in each column and region.
 *      8. Verify that the indication of success is not displayed.
 * 
 * Manual test: initialize an empty game board
 *      1. Create a new game board with no stars placed.
 *      2. Verify that the game board has the correct dimensions and no stars are placed.
 *      3. Add some stars manually to the game board.
 *      4. Verify that the stars are placed correctly and the game board still has the correct dimensions.
 *      5. Remove the stars from the game board.
 *      6. Verify that the stars are removed correctly and the game board has no stars.
 *      
 *
 * Manual test: place stars on the boardCreate a new game board with no stars placed.
 *      1. Place some stars on the board using the placeStar method
 *      2. Verify that the stars are placed in the correct positions.
 *      3. Attempt to place stars outside of the board.
 *      4. Verify that the placement of stars outside of the board is not allowed.
 *    
 * 
 * Manual test: check correctness of game board
 *      1. Create a new game board with some stars placed.
 *      2. Verify that the game board is in a valid state.
 *      3. Add some additional stars to the game board.
 *      4. Verify that the game board is still in a valid state.
 *      5. Add some additional stars to the game board such that a row or column violates the star battle rules.
 *      6. Verify that the game board is in an invalid state and the error message is displayed.
 *      7. Remove some stars from the game board such that the board becomes invalid.
 *      8. Verify that the game board is in an invalid state and the error message is displayed.
 *      9. Test the solving of the game board:
 * 
 * Manual test: solve the game board
 *      1. Create a new game board with some stars placed.
 *      2. Verify that the game board is in a valid state.
 *      3. Solve the game board using the solve method.
 *      4. Verify that the game board is solved correctly.
 *      5. Create a new game board that cannot be solved.
 *      6. Attempt to solve the game board using the solve method.
 *      7. Verify that the game board is not solved and the error message is displayed.
 *
 * Manual test: generate game board
 *      1. Use the generate method to create a new game board.
 *      2. Verify that the game board has the correct dimensions and contains a valid set of stars.
 *      3. Attempt to generate a game board with invalid dimensions.
 *      4. Verify that the generation of a game board with invalid dimensions is not allowed.
 **/