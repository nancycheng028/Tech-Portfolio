#!/usr/bin/env python3

import typing
import doctest

# NO ADDITIONAL IMPORTS ALLOWED!


def dump(game):
    """
    Prints a human-readable version of a game (provided as a dictionary)
    """
    for key, val in sorted(game.items()):
        if isinstance(val, list) and val and isinstance(val[0], list):
            print(f"{key}:")
            for inner in val:
                print(f"    {inner}")
        else:
            print(f"{key}:", val)


# 2-D IMPLEMENTATION

def new_game_structure (dimensions, val):
    """

    Args:
        dimensions (tuple): ex. (2, 4, 2)

    Returns:
        list: structure of the list of lists
        ex. 
        [[[True, True], [True, True], [True, True], [True, True]],
        [[True, True], [True, True], [True, True], [True, True]]]
    """
    #base case: one dimension 
    if len(dimensions) == 1:
        return [val] * dimensions [0]
    
    #recursive step: more than one dimensions 
    else:
        # last_layer = new_game_structure(dimensions[1:], val)
        new_layer = []
        for i in range(dimensions[0]):
            new_layer.append(new_game_structure(dimensions[1:], val))
        return new_layer 

def new_game_2d(num_rows, num_cols, bombs):
    """
    Start a new game.

    Return a game state dictionary, with the 'dimensions', 'state', 'board' and
    'hidden' fields adequately initialized.

    Parameters:
       num_rows (int): Number of rows
       num_cols (int): Number of columns
       bombs (list): List of bombs, given in (row, column) pairs, which are
                     tuples

    Returns:
       A game state dictionary

    >>> dump(new_game_2d(2, 4, [(0, 0), (1, 0), (1, 1)]))
    board:
        ['.', 3, 1, 0]
        ['.', '.', 1, 0]
    dimensions: (2, 4)
    hidden:
        [True, True, True, True]
        [True, True, True, True]
    state: ongoing
    """
    return new_game_nd((num_rows, num_cols), bombs)


    # hidden = new_game_structure((num_rows, num_cols), True)
    # board = new_game_structure((num_rows, num_cols), 0)

    # board = []
    # for r in range(num_rows):
    #     row = []
    #     for c in range(num_cols):
    #         if [r, c] in bombs or (r, c) in bombs:
    #             row.append(".")
    #         else:
    #             row.append(0)
    #     board.append(row)
    # hidden = []
    # for r in range(num_rows):
    #     row = []
    #     for c in range(num_cols):
    #         row.append(True)
    #     hidden.append(row)
    # for r in range(num_rows):
    #     for c in range(num_cols):
    #         if board[r][c] == 0:
    #             neighbor_bombs = 0
    #             if 0 <= r - 1 < num_rows:
    #                 if 0 <= c - 1 < num_cols:
    #                     if board[r - 1][c - 1] == ".":
    #                         neighbor_bombs += 1
    #             if 0 <= r < num_rows:
    #                 if 0 <= c - 1 < num_cols:
    #                     if board[r][c - 1] == ".":
    #                         neighbor_bombs += 1
    #             if 0 <= r + 1 < num_rows:
    #                 if 0 <= c - 1 < num_cols:
    #                     if board[r + 1][c - 1] == ".":
    #                         neighbor_bombs += 1
    #             if 0 <= r - 1 < num_rows:
    #                 if 0 <= c < num_cols:
    #                     if board[r - 1][c] == ".":
    #                         neighbor_bombs += 1
    #             if 0 <= r < num_rows:
    #                 if 0 <= c < num_cols:
    #                     if board[r][c] == ".":
    #                         neighbor_bombs += 1
    #             if 0 <= r + 1 < num_rows:
    #                 if 0 <= c < num_cols:
    #                     if board[r + 1][c] == ".":
    #                         neighbor_bombs += 1
    #             if 0 <= r - 1 < num_rows:
    #                 if 0 <= c + 1 < num_cols:
    #                     if board[r - 1][c + 1] == ".":
    #                         neighbor_bombs += 1
    #             if 0 <= r < num_rows:
    #                 if 0 <= c + 1 < num_cols:
    #                     if board[r][c + 1] == ".":
    #                         neighbor_bombs += 1
    #             if 0 <= r + 1 < num_rows:
    #                 if 0 <= c + 1 < num_cols:
    #                     if board[r + 1][c + 1] == ".":
    #                         neighbor_bombs += 1
    #             board[r][c] = neighbor_bombs
    # return {
    #     "dimensions": (num_rows, num_cols),
    #     "board": board,
    #     "hidden": hidden,
    #     "state": "ongoing",
    # }


def dig_2d(game, row, col):
    """
    Reveal the cell at (row, col), and, in some cases, recursively reveal its
    neighboring squares.

    Update game['hidden'] to reveal (row, col).  Then, if (row, col) has no
    adjacent bombs (including diagonally), then recursively reveal (dig up) its
    eight neighbors.  Return an integer indicating how many new squares were
    revealed in total, including neighbors, and neighbors of neighbors, and so
    on.

    The state of the game should be changed to 'defeat' when at least one bomb
    is revealed on the board after digging (i.e. game['hidden'][bomb_location]
    == False), 'victory' when all safe squares (squares that do not contain a
    bomb) and no bombs are revealed, and 'ongoing' otherwise.

    Parameters:
       game (dict): Game state
       row (int): Where to start digging (row)
       col (int): Where to start digging (col)

    Returns:
       int: the number of new squares revealed

    >>> game = {'dimensions': (2, 4),
    ...         'board': [['.', 3, 1, 0],
    ...                   ['.', '.', 1, 0]],
    ...         'hidden': [[True, False, True, True],
    ...                  [True, True, True, True]],
    ...         'state': 'ongoing'}
    >>> dig_2d(game, 0, 3)
    4
    >>> dump(game)
    board:
        ['.', 3, 1, 0]
        ['.', '.', 1, 0]
    dimensions: (2, 4)
    hidden:
        [True, False, False, False]
        [True, True, False, False]
    state: victory

    >>> game = {'dimensions': [2, 4],
    ...         'board': [['.', 3, 1, 0],
    ...                   ['.', '.', 1, 0]],
    ...         'hidden': [[True, False, True, True],
    ...                  [True, True, True, True]],
    ...         'state': 'ongoing'}
    >>> dig_2d(game, 0, 0)
    1
    >>> dump(game)
    board:
        ['.', 3, 1, 0]
        ['.', '.', 1, 0]
    dimensions: [2, 4]
    hidden:
        [False, False, True, True]
        [True, True, True, True]
    state: defeat
    """

    return dig_nd(game, (row, col))


    # if game["state"] == "defeat" or game["state"] == "victory":
    #     game["state"] = game["state"]  # keep the state the same
    #     return 0

    # if game["board"][row][col] == ".":
    #     game["hidden"][row][col] = False
    #     game["state"] = "defeat"
    #     return 1

    # bombs = 0
    # hidden_squares = 0
    # for r in range(game["dimensions"][0]):
    #     for c in range(game["dimensions"][1]):
    #         if game["board"][r][c] == ".":
    #             if game["hidden"][r][c] == False:
    #                 bombs += 1
    #         elif game["hidden"][r][c] == True:
    #             hidden_squares += 1
    # if bombs != 0:
    #     # if bombs is not equal to zero, set the game state to defeat and
    #     # return 0
    #     game["state"] = "defeat"
    #     return 0
    # if hidden_squares == 0:
    #     game["state"] = "victory"
    #     return 0

    # if game["hidden"][row][col] != False:
    #     game["hidden"][row][col] = False
    #     revealed = 1
    # else:
    #     return 0

    # if game["board"][row][col] == 0:
    #     num_rows, num_cols = game["dimensions"]
    #     if 0 <= row - 1 < num_rows:
    #         if 0 <= col - 1 < num_cols:
    #             if game["board"][row - 1][col - 1] != ".":
    #                 if game["hidden"][row - 1][col - 1] == True:
    #                     revealed += dig_2d(game, row - 1, col - 1)
    #     if 0 <= row < num_rows:
    #         if 0 <= col - 1 < num_cols:
    #             if game["board"][row][col - 1] != ".":
    #                 if game["hidden"][row][col - 1] == True:
    #                     revealed += dig_2d(game, row, col - 1)
    #     if 0 <= row + 1 < num_rows:
    #         if 0 <= col - 1 < num_cols:
    #             if game["board"][row + 1][col - 1] != ".":
    #                 if game["hidden"][row + 1][col - 1] == True:
    #                     revealed += dig_2d(game, row + 1, col - 1)
    #     if 0 <= row - 1 < num_rows:
    #         if 0 <= col < num_cols:
    #             if game["board"][row - 1][col] != ".":
    #                 if game["hidden"][row - 1][col] == True:
    #                     revealed += dig_2d(game, row - 1, col)
    #     if 0 <= row < num_rows:
    #         if 0 <= col < num_cols:
    #             if game["board"][row][col] != ".":
    #                 if game["hidden"][row][col] == True:
    #                     revealed += dig_2d(game, row, col)
    #     if 0 <= row + 1 < num_rows:
    #         if 0 <= col < num_cols:
    #             if game["board"][row + 1][col] != ".":
    #                 if game["hidden"][row + 1][col] == True:
    #                     revealed += dig_2d(game, row + 1, col)
    #     if 0 <= row - 1 < num_rows:
    #         if 0 <= col + 1 < num_cols:
    #             if game["board"][row - 1][col + 1] != ".":
    #                 if game["hidden"][row - 1][col + 1] == True:
    #                     revealed += dig_2d(game, row - 1, col + 1)
    #     if 0 <= row < num_rows:
    #         if 0 <= col + 1 < num_cols:
    #             if game["board"][row][col + 1] != ".":
    #                 if game["hidden"][row][col + 1] == True:
    #                     revealed += dig_2d(game, row, col + 1)
    #     if 0 <= row + 1 < num_rows:
    #         if 0 <= col + 1 < num_cols:
    #             if game["board"][row + 1][col + 1] != ".":
    #                 if game["hidden"][row + 1][col + 1] == True:
    #                     revealed += dig_2d(game, row + 1, col + 1)

    # bombs = 0  # set number of bombs to 0
    # hidden_squares = 0
    # for r in range(game["dimensions"][0]):
    #     # for each r,
    #     for c in range(game["dimensions"][1]):
    #         # for each c,
    #         if game["board"][r][c] == ".":
    #             if game["hidden"][r][c] == False:
    #                 # if the game hidden is False, and the board is '.', add 1 to
    #                 # bombs
    #                 bombs += 1
    #         elif game["hidden"][r][c] == True:
    #             hidden_squares += 1
    # bad_squares = bombs + hidden_squares
    # if bad_squares > 0:
    #     game["state"] = "ongoing"
    #     return revealed
    # else:
    #     game["state"] = "victory"
    #     return revealed


def render_2d_locations(game, xray=False):
    """
    Prepare a game for display.

    Returns a two-dimensional array (list of lists) of '_' (hidden squares),
    '.' (bombs), ' ' (empty squares), or '1', '2', etc. (squares neighboring
    bombs).  game['hidden'] indicates which squares should be hidden.  If
    xray is True (the default is False), game['hidden'] is ignored and all
    cells are shown.

    Parameters:
       game (dict): Game state
       xray (bool): Whether to reveal all tiles or just the that are not
                    game['hidden']

    Returns:
       A 2D array (list of lists)

    >>> render_2d_locations({'dimensions': (2, 4),
    ...         'state': 'ongoing',
    ...         'board': [['.', 3, 1, 0],
    ...                   ['.', '.', 1, 0]],
    ...         'hidden':  [[True, False, False, True],
    ...                   [True, True, False, True]]}, False)
    [['_', '3', '1', '_'], ['_', '_', '1', '_']]

    >>> render_2d_locations({'dimensions': (2, 4),
    ...         'state': 'ongoing',
    ...         'board': [['.', 3, 1, 0],
    ...                   ['.', '.', 1, 0]],
    ...         'hidden':  [[True, False, True, False],
    ...                   [True, True, True, False]]}, True)
    [['.', '3', '1', ' '], ['.', '.', '1', ' ']]
    """
    
    return render_nd(game, xray)


    # new_location_list = []
    # board_list = game['board']
    # for r in range(len(board_list)): #r is the row index 
    #     row_copy = board_list[r][:]
    #     new_location_list.append(row_copy)
    #     for c in range(len(board_list[0])): #c is the column index 
    #         if new_location_list[r][c] == 0:
    #             new_location_list[r][c] = " "
    #         else:
    #             new_location_list[r][c] = str(new_location_list[r][c])
        
    # if xray:
    #     return new_location_list
    # else: #if xray is False
    #     hidden_list = game['hidden']
    #     for r in range(len(hidden_list)):
    #         for c in range(len(hidden_list[0])):
    #             if hidden_list[r][c]:
    #                 new_location_list[r][c] = "_"
    #     return new_location_list


def render_2d_board(game, xray=False):
    """
    Render a game as ASCII art.

    Returns a string-based representation of argument 'game'.  Each tile of the
    game board should be rendered as in the function
        render_2d_locations(game)

    Parameters:
       game (dict): Game state
       xray (bool): Whether to reveal all tiles or just the ones allowed by
                    game['hidden']

    Returns:
       A string-based representation of game

    >>> render_2d_board({'dimensions': (2, 4),
    ...                  'state': 'ongoing',
    ...                  'board': [['.', 3, 1, 0],
    ...                            ['.', '.', 1, 0]],
    ...                  'hidden':  [[False, False, False, True],
    ...                            [True, True, False, True]]})
    '.31_\\n__1_'
    """
    location_list = render_2d_locations(game, xray) #[['.', '3', '1', ' '], ['.', '.', '1', ' ']]
    string_list = []

    for r in range(len(location_list)):
        row_string = ""
        for c in range(len(location_list[0])):
            row_string += location_list[r][c]
        string_list.append(row_string)

    final_string = ""
    for s in range(len(string_list)-1):
        final_string += string_list[s] + "\n"
    final_string += string_list[-1]
    return final_string

# N-D IMPLEMENTATION

def get_value(board, dimensions, location):
    """

    Args:
        board (list): 
        [[[0, 0], [0, 0], [0, 0], [0, 0]], 
        [[0, 0], [0, 0], [0, 0], [0, 0]]]

        dimensions (tuple):
        location (tuple): 

    Returns:
        int: value at the location 
    """

    #base case: 1d board
    if len(dimensions) == 1:
        return board[location[0]]

    #recursive step
    else:
        one_less_layer = board[location[0]]
        return get_value(one_less_layer, dimensions[1:], location[1:])


# board = [[1, 2, 3, 4], [5, 6, 7, 8]]
# dimensions = (2, 4)
# location = (0, 2)

# print(get_value(board, dimensions, location))

def set_value(board, dimensions, location, new_val):
    """

    Args: 
        board (list): 
        location (_type_): 
        new_val (_type_): 

    Returns:
        list: updated board 
    """

    #base case: 1d board
    if len(dimensions) == 1:
        board[location[0]] = new_val
    
    #recursive step
    else:
        one_less_layer = board[location[0]]
        return set_value(one_less_layer, dimensions[1:], location[1:], new_val)

# board = [[[1, 2, 3, 4], [5, 6, 7, 8]], [[1, 2, 3, 4], [5, 6, 7, 8]], [[1, 2, 3, 4], [5, 6, 7, 8]]]
# dimensions = (3, 2, 4)
# location = (0, 1, 2)
# set_value(board, dimensions, location, 3)
# print(board)

# hi = set_value(board, dimensions, location, 6)
# print(hi)

# neighbors_tuple = {
# "left" : (-1,),
# "middle": (0,),
# "right": (+1,)
# }

def get_neighbors_with_iteself(dimensions, location): 
    """

    Args:
        board (list): 
        dimensions (tuple): 
        location (tuple): 

    Returns:
        list: list of tuples of locations of all neighbors
    """

    #base case: 1d board
    if len(location) == 1:
        left_neighbor = (location[0] - 1,)
        middle_neighbor = (location[0] + 0,)
        right_neighbor = (location[0] + 1,)
        return [left_neighbor, middle_neighbor, right_neighbor]
    
    #recursive step
    else:
        # print(1)
        lower_neighbors = get_neighbors_with_iteself(dimensions[1:], location[1:]) #list of tuples 
        # print(lower_neighbors)
        new = []
        for each_neighbor in lower_neighbors: #each neighbor is a tuple
            # print(2)
            # print(lower_neighbors)
            new_tuple_one = (location[0] - 1, ) + each_neighbor 
            new_tuple_two = (location[0], ) + each_neighbor 
            new_tuple_three = (location[0] + 1, ) + each_neighbor 
            
            new.append(new_tuple_one)
            new.append(new_tuple_two)
            new.append(new_tuple_three)
        return new

# board = [[1, 2, 3, 4], [5, 6, 7, 8], [0, 0, 0, 0] ]
# location = (5, 13, 0)
# dimensions = (10, 20, 3)
# print(get_neighbors_with_iteself(dimensions, location))

def get_neighbors (dimensions, location):
    """

    Args:
        dimensions (tuple): 
        location (tuple): 

    Returns:
        list: list of all neighbors in bound, exclude itself
    """
    list_with_center = get_neighbors_with_iteself(dimensions, location)
    #list_with_center: [(4, 12, -1), (5, 12, -1), (6, 12, -1), (4, 13, -1), (5, 13, -1), (6, 13, -1), (4, 14, -1), (5, 14, -1), (6, 14, -1), (4, 12, 0), (5, 12, 0), (6, 12, 0), (4, 13, 0), (5, 13, 0), (6, 13, 0), (4, 14, 0), (5, 14, 0), (6, 14, 0), (4, 12, 1), (5, 12, 1), (6, 12, 1), (4, 13, 1), (5, 13, 1), (6, 13, 1), (4, 14, 1), (5, 14, 1), (6, 14, 1)]
    list_with_center.remove(location)
    # print(list_with_center)

    #check if in-bound:
    remove_list = set()
    for i in range(len(list_with_center)):
        for j in range(len(dimensions)):
            if list_with_center[i][j] < 0 or list_with_center[i][j] >= dimensions[j]:
                remove_list.add(list_with_center[i])
    # print("remove list is")
    # print(remove_list)
    for element in remove_list:
        # print("element is", element)
        list_with_center.remove(element)
    return list_with_center

# location = (0, 13, 0)
# dimensions = (10, 20, 3)
# print(get_neighbors(dimensions, location))

def new_game_nd(dimensions, bombs):
    """
    Start a new game.

    Return a game state dictionary, with the 'dimensions', 'state', 'board' and
    'hidden' fields adequately initialized.


    Args:
       dimensions (tuple): Dimensions of the board
       bombs (list): Bomb locations as a list of tuples, each an
                     N-dimensional coordinate

    Returns:
       A game state dictionary

    >>> g = new_game_nd((2, 4, 2), [(0, 0, 1), (1, 0, 0), (1, 1, 1)])
    >>> dump(g)
    board:
        [[3, '.'], [3, 3], [1, 1], [0, 0]]
        [['.', 3], [3, '.'], [1, 1], [0, 0]]
    dimensions: (2, 4, 2)
    hidden:
        [[True, True], [True, True], [True, True], [True, True]]
        [[True, True], [True, True], [True, True], [True, True]]
    state: ongoing
    """
    hidden = new_game_structure(dimensions, True)
    list_structure = new_game_structure(dimensions, 0)
    for each_bomb in bombs: #each bomb is a tuple     ex. (0, 0, 1)
        set_value(list_structure, dimensions, each_bomb, '.')
        bomb_neighbors = get_neighbors(dimensions, each_bomb)
        # print(2)
        for each_neighbor in bomb_neighbors:
            original_val = get_value(list_structure, dimensions, each_neighbor)
            # print(original_val)
            # print(type(original_val))
            if type(original_val) is int:
                new_val = original_val + 1
                # print(new_val)
                set_value(list_structure, dimensions, each_neighbor, new_val)
    

    game_state_dict = {
        "board":list_structure,
        "dimensions" : dimensions,
        "hidden": hidden,
        "state": "ongoing",
    }
    return game_state_dict

def game_state(game):
    """given a game, returns the state of that game ('ongoing', 'defeat', or 'victory')

    Args:
        game (dictionary): {'dimensions': (2, 4, 2),
    ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
    ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
    ...      'hidden': [[[True, True], [True, False], [True, True],
    ...                [True, True]],
    ...               [[True, True], [True, True], [True, True],
    ...                [True, True]]],
    ...      'state': 'ongoing'}

    Returns:
        string: 'ongoing', 'defeat', or 'victory'
    """
    coordinates = all_possible_coordinates(game['dimensions'])
    
    for each_coordinate in coordinates: 
        this_val = get_value(game['board'], game['dimensions'], each_coordinate)
        hidden_status = get_value(game['hidden'], game['dimensions'], each_coordinate)
        # if this_val == '.': #a bomb is revealed
        #     if hidden_status is False:
        #         return 'defeat'
        # else: #if it's not a bomb
        if this_val != '.' and hidden_status is True: 
            return 'ongoing'
    
    return 'victory'
    

def dig_nd(game, coordinates):
    """
    Recursively dig up square at coords and neighboring squares.

    Update the hidden to reveal square at coords; then recursively reveal its
    neighbors, as long as coords does not contain and is not adjacent to a
    bomb.  Return a number indicating how many squares were revealed.  No
    action should be taken and 0 returned if the incoming state of the game
    is not 'ongoing'.

    The updated state is 'defeat' when at least one bomb is revealed on the
    board after digging, 'victory' when all safe squares (squares that do
    not contain a bomb) and no bombs are revealed, and 'ongoing' otherwise.

    Args:
       coordinates (tuple): Where to start digging

    Returns:
       int: number of squares revealed

    >>> g = {'dimensions': (2, 4, 2),
    ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
    ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
    ...      'hidden': [[[True, True], [True, False], [True, True],
    ...                [True, True]],
    ...               [[True, True], [True, True], [True, True],
    ...                [True, True]]],
    ...      'state': 'ongoing'}
    >>> dig_nd(g, (0, 3, 0))
    8
    >>> dump(g)
    board:
        [[3, '.'], [3, 3], [1, 1], [0, 0]]
        [['.', 3], [3, '.'], [1, 1], [0, 0]]
    dimensions: (2, 4, 2)
    hidden:
        [[True, True], [True, False], [False, False], [False, False]]
        [[True, True], [True, True], [False, False], [False, False]]
    state: ongoing
    >>> g = {'dimensions': (2, 4, 2),
    ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
    ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
    ...      'hidden': [[[True, True], [True, False], [True, True],
    ...                [True, True]],
    ...               [[True, True], [True, True], [True, True],
    ...                [True, True]]],
    ...      'state': 'ongoing'}
    >>> dig_nd(g, (0, 0, 1))
    1
    >>> dump(g)
    board:
        [[3, '.'], [3, 3], [1, 1], [0, 0]]
        [['.', 3], [3, '.'], [1, 1], [0, 0]]
    dimensions: (2, 4, 2)
    hidden:
        [[True, False], [True, False], [True, True], [True, True]]
        [[True, True], [True, True], [True, True], [True, True]]
    state: defeat
    """
    

    #if clicked location is already revealed, do nothing
    if get_value(game['hidden'], game['dimensions'], coordinates) is False:
        return 0

    #if the game state is already defeat or victory 
    if game["state"] == "defeat" or game["state"] == "victory":
        game["state"] = game["state"]  # keep the state the same
        return 0

    #if the coordinate has a bomb, game ends, defeat
    this_val = get_value(game['board'], game['dimensions'], coordinates)
    if this_val == ".":
        set_value(game['hidden'], game['dimensions'], coordinates, False)
        game["state"] = "defeat"
        return 1

    if type(this_val) is int and this_val != 0: #if the coordinate is not a bomb:
    #     set_value(game['hidden'], game['dimensions'], coordinates, False)
    #     # print(this_val)
    #     if game_state(game) == 'victory':
    #         game['state'] = 'victory'
    #     return 1
        return non_zero_helper(game, coordinates, this_val)

    if this_val == 0: 
        set_value(game['hidden'], game['dimensions'], coordinates, False)
        neighbors = get_neighbors(game['dimensions'], coordinates)
        total_count = 1
        # print('this val is', this_val)
        if game_state(game) == 'victory':
            game['state'] = 'victory'
        for each_neighbor in neighbors:
            total_count += dig_nd(game, each_neighbor)
        return total_count

def non_zero_helper(game, coordinates, this_val):
    """if it's not a bomb

    Args:
        game (dictionary): 
        val (int): 
    """
    
    set_value(game['hidden'], game['dimensions'], coordinates, False)
    # print(this_val)
    if game_state(game) == 'victory':
        game['state'] = 'victory'
    return 1

# def dig_nd_helper(game, coordinates):
#     """
#     Recursively dig up square at coords and neighboring squares.

#     Update the hidden to reveal square at coords; then recursively reveal its
#     neighbors, as long as coords does not contain and is not adjacent to a
#     bomb.  Return a number indicating how many squares were revealed.  No
#     action should be taken and 0 returned if the incoming state of the game
#     is not 'ongoing'.

#     The updated state is 'defeat' when at least one bomb is revealed on the
#     board after digging, 'victory' when all safe squares (squares that do
#     not contain a bomb) and no bombs are revealed, and 'ongoing' otherwise.

#     Args:
#        coordinates (tuple): Where to start digging

#     Returns:
#        int: number of squares revealed

#     >>> g = {'dimensions': (2, 4, 2),
#     ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
#     ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
#     ...      'hidden': [[[True, True], [True, False], [True, True],
#     ...                [True, True]],
#     ...               [[True, True], [True, True], [True, True],
#     ...                [True, True]]],
#     ...      'state': 'ongoing'}
#     >>> dig_nd(g, (0, 3, 0))
#     8
#     >>> dump(g)
#     board:
#         [[3, '.'], [3, 3], [1, 1], [0, 0]]
#         [['.', 3], [3, '.'], [1, 1], [0, 0]]
#     dimensions: (2, 4, 2)
#     hidden:
#         [[True, True], [True, False], [False, False], [False, False]]
#         [[True, True], [True, True], [False, False], [False, False]]
#     state: ongoing
#     >>> g = {'dimensions': (2, 4, 2),
#     ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
#     ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
#     ...      'hidden': [[[True, True], [True, False], [True, True],
#     ...                [True, True]],
#     ...               [[True, True], [True, True], [True, True],
#     ...                [True, True]]],
#     ...      'state': 'ongoing'}
#     >>> dig_nd(g, (0, 0, 1))
#     1
#     >>> dump(g)
#     board:
#         [[3, '.'], [3, 3], [1, 1], [0, 0]]
#         [['.', 3], [3, '.'], [1, 1], [0, 0]]
#     dimensions: (2, 4, 2)
#     hidden:
#         [[True, False], [True, False], [True, True], [True, True]]
#         [[True, True], [True, True], [True, True], [True, True]]
#     state: defeat
#     """

#     #if clicked location is already revealed, do nothing
#     if get_value(game['hidden'], game['dimensions'], coordinates) is False:
#         return 0

#     #if the game state is already defeat or victory 
#     if game["state"] == "defeat" or game["state"] == "victory":
#         game["state"] = game["state"]  # keep the state the same
#         return 0

#     #if the coordinate has a bomb, game ends, defeat
#     this_val = get_value(game['board'], game['dimensions'], coordinates)
#     if this_val == ".":
#         set_value(game['hidden'], game['dimensions'], coordinates, False)
#         game["state"] = "defeat"
#         return 1

#     if type(this_val) is int and this_val != 0: #if the coordinate is not a bomb:
#         set_value(game['hidden'], game['dimensions'], coordinates, False)
#         # print(this_val)
#         if game_state(game) == 'victory':
#             game['state'] = 'victory'
#         return 1

#     if this_val == 0: 
#         set_value(game['hidden'], game['dimensions'], coordinates, False)
#         neighbors = get_neighbors(game['dimensions'], coordinates)
#         total_count = 1
#         # print('this val is', this_val)
#         if game_state(game) == 'victory':
#             game['state'] = 'victory'
#         for each_neighbor in neighbors:
#             total_count += dig_nd_helper(game, each_neighbor)
#         return total_count



def all_possible_coordinates(dimensions):
    """A function that returns all possible coordinates in a given board.

    Args:
        dimensions (tuple): 

    Returns:
        list: list of tuples of all possible coordinates
    """
    #base case: 1d board 
    if len(dimensions) == 1:
        #coordinates_list = []
        for i in range(dimensions[0]):
            yield (i, )
            #coordinates_list.append((i,))
        #return coordinates_list

    #recursive step:
    else:
        first_list = all_possible_coordinates(dimensions[:-1]) #list of tuples
        #new_list = []
        for each_tuple in first_list:
            for i in range(dimensions[-1]):
                new_tuple = each_tuple + (i,)
                #new_list.append(new_tuple)
                yield new_tuple
        #return new_list
# dimensions = (3, 2)
# print(all_possible_coordinates(dimensions))


def render_nd(game, xray=False):
    """
    Prepare the game for display.

    Returns an N-dimensional array (nested lists) of '_' (hidden squares), '.'
    (bombs), ' ' (empty squares), or '1', '2', etc. (squares neighboring
    bombs).  The game['hidden'] array indicates which squares should be
    hidden.  If xray is True (the default is False), the game['hidden'] array
    is ignored and all cells are shown.

    Args:
       xray (bool): Whether to reveal all tiles or just the ones allowed by
                    game['hidden']

    Returns:
       An n-dimensional array of strings (nested lists)

    >>> g = {'dimensions': (2, 4, 2),
    ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
    ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
    ...      'hidden': [[[True, True], [True, False], [False, False],
    ...                [False, False]],
    ...               [[True, True], [True, True], [False, False],
    ...                [False, False]]],
    ...      'state': 'ongoing'}
    >>> render_nd(g, False)
    [[['_', '_'], ['_', '3'], ['1', '1'], [' ', ' ']],
     [['_', '_'], ['_', '_'], ['1', '1'], [' ', ' ']]]

    >>> render_nd(g, True)
    [[['3', '.'], ['3', '3'], ['1', '1'], [' ', ' ']],
     [['.', '3'], ['3', '.'], ['1', '1'], [' ', ' ']]]
    """

    coordinates_list = all_possible_coordinates(game['dimensions'])
    rendered_board = new_game_structure(game['dimensions'], 0)
    for each_coordinate in coordinates_list:
        coordinate_val = get_value(game['board'], game['dimensions'], each_coordinate)
        if coordinate_val == 0:
            set_value(rendered_board, game['dimensions'], each_coordinate, ' ')
        if coordinate_val == '.':
            set_value(rendered_board, game['dimensions'], each_coordinate, '.')
        if type(coordinate_val) is int and coordinate_val != 0:
            set_value(rendered_board, game['dimensions'], each_coordinate, str(coordinate_val))
        if xray is False:
            if get_value(game['hidden'], game['dimensions'], each_coordinate) is True:
                set_value(rendered_board, game['dimensions'], each_coordinate, '_')

    return rendered_board



if __name__ == "__main__":
    # Test with doctests. Helpful to debug individual lab.py functions.
    _doctest_flags = doctest.NORMALIZE_WHITESPACE | doctest.ELLIPSIS
    # print("hello")
    doctest.testmod(optionflags=_doctest_flags)  # runs ALL doctests
    # game = {'dimensions': (2, 4),
    # 'board': [['.', 3, 1, 0],
    # ['.', '.', 1, 0]],
    # 'hidden': [[True, False, True, True],
    # [True, True, True, True]],
    # 'state': 'ongoing'}
    # dig_2d(game, 0, 3)
    # print("hi")
    # print(dump(game))
    # print(new_game_nd((2, 4, 2), [(0, 0, 1), (1, 0, 0), (1, 1, 1)]))
    # Alternatively, can run the doctests JUST for specified function/methods,
    # e.g., for render_2d_locations or any other function you might want.  To
    # do so, comment out the above line, and uncomment the below line of code.
    # This may be useful as you write/debug individual doctests or functions.
    # Also, the verbose flag can be set to True to see all test results,
    # including those that pass.
    #
    #doctest.run_docstring_examples(
    #    render_2d_locations,
    #    globals(),
    #    optionflags=_doctest_flags,
    #    verbose=False
    # )
