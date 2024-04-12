#!/usr/bin/env python3

import doctest
import sys
sys.setrecursionlimit(10000)



# NO ADDITIONAL IMPORTS!


#############################
# Scheme-related Exceptions #
#############################


class SchemeError(Exception):
    """
    A type of exception to be raised if there is an error with a Scheme
    program.  Should never be raised directly; rather, subclasses should be
    raised.
    """

    pass


class SchemeSyntaxError(SchemeError):
    """
    Exception to be raised when trying to evaluate a malformed expression.
    """

    pass


class SchemeNameError(SchemeError):
    """
    Exception to be raised when looking up a name that has not been defined.
    """

    pass


class SchemeEvaluationError(SchemeError):
    """
    Exception to be raised if there is an error during evaluation other than a
    SchemeNameError.
    """

    pass


############################
# Tokenization and Parsing #
############################


def number_or_symbol(x):
    """
    Helper function: given a string, convert it to an integer or a float if
    possible; otherwise, return the string itself

    >>> number_or_symbol('8')
    8
    >>> number_or_symbol('-5.32')
    -5.32
    >>> number_or_symbol('1.2.3.4')
    '1.2.3.4'
    >>> number_or_symbol('x')
    'x'
    """
    try:
        return int(x)
    except ValueError:
        try:
            return float(x)
        except ValueError:
            return x


def tokenize(source):
    """
    Splits an input string into meaningful tokens (left parens, right parens,
    other whitespace-separated values).  Returns a list of strings.
    tokenize("(foo (bar 3.14))") -> ['(', 'foo', '(', 'bar', '3.14', ')', ')']


    Arguments:
        source (str): a string containing the source code of a Scheme
                      expression
    """
    # splited_with_space = source.split()
    # for word in splited_with_space:
    #     if '(' or ')' in word:
    new_source = ''
    comment = False
    for char in source:
        if comment is True:
            if char == '\n':
                comment = False
        elif char == '(' :
            new_source += ' '
            new_source += char
            new_source += ' '
            comment = False
        elif char == ')':
            new_source += ' '
            new_source += char
            new_source += ' '
            comment = False
        elif char == ';':
            comment = True
        else:
            new_source += char
            comment = False
            
    output = new_source.split()
    return output

# x = "(cat (dog (tomato)))"
# print(tokenize(x))

def parse(tokens):
    """
    Parses a list of tokens, constructing a representation where:
        * symbols are represented as Python strings
        * numbers are represented as Python ints or floats
        * S-expressions are represented as Python lists

    Arguments:
        tokens (list): a list of strings representing tokens
    """
    #check if it's well-formed:
    left_counter = 0
    right_counter = 0
    for token in tokens:
        if token == '(':
            left_counter += 1
        if token == ')':
            right_counter += 1
        if right_counter > left_counter:
            raise SchemeSyntaxError
    if right_counter != left_counter:
        raise SchemeSyntaxError
    if len(tokens) > 1:
        if left_counter == 0 and right_counter == 0:
            raise SchemeSyntaxError
    # print('hi')
    # return 
    def parse_expression(index):
        token = tokens[index]
        if token == '(' : #if token is an operation
            operation = []
            next_index = index + 1  
            while tokens[next_index] != ')':
                # print('hi')
                expression, next_index = parse_expression(next_index)
                operation.append(expression)
            return (operation, next_index + 1)
        
        else:
            return (number_or_symbol(token), index + 1)
    parsed_expression, next_index = parse_expression(0)
    return parsed_expression

# x = parse(['(', 'cat', '(', 'dog', '(', 'tomato', ')', ')', ')'])
# print(x)

######################
# Built-in Functions #
######################

def mult (args):
    """
    Args:
        args (list): list of numbers to be multiplied together
    Returns:
        int/float: product of numbers 
    """
    #base case
    if len(args) == 1:
        return args[0]
    else:
        return args[0] * mult(args[1:])

# print(mult([3, 4, 5]))

def div (args):
    if len(args) == 1:
        return args[0]
    # if len(args) == 2:
    #     return args[0] / args[1]
    # else:
    #     return div(args[:2]) / div(args[2:])
    else:
        ans = args[0]
        for i in range(1, len(args)):
            ans = ans / args[i]
        return ans     
# print(div([60, 5, 3]))

def equal(args):
    for arg in args:
        if arg != args[0]:
            return False
    return True

def greater(args):
    length = len(args)
    for i in range(length - 1):
        if args[i] <= args[i + 1]:
            return False
    return True
    
def greater_or_equal(args):
    length = len(args)
    for i in range(length - 1):
        if args[i] < args[i + 1]:
            return False
    return True

def less(args):
    length = len(args)
    for i in range(length - 1):
        if args[i] >= args[i + 1]:
            return False
    return True



def less_or_equal(args):
    length = len(args)
    for i in range(length - 1):
        if args[i] > args[i + 1]:
            return False
    return True

def not_builtin(arg):
    
    if len(arg) > 1 or len(arg) == 0:
        raise SchemeEvaluationError
    if arg[0] is True:
        return False
    if arg[0] is False:
        return True

def car(cons_cell):
    if len(cons_cell) != 1:
        raise SchemeEvaluationError
    if isinstance(cons_cell[0], Pair):
        return cons_cell[0].car
    else:
        raise SchemeEvaluationError('hi')
    

def cdr(cons_cell):
    if len(cons_cell) != 1:
        raise SchemeEvaluationError
    if isinstance(cons_cell[0], Pair):
        return cons_cell[0].cdr
    else:
        raise SchemeEvaluationError

def list_func(args):
    """
    This function should take zero or more arguments 
    and should construct a linked list that contains those arguments, in order. 
    You should make sure that calling list with no arguments produces our representation for an empty list.
    (list) should evaluate to the same thing as nil
    (list 1) should evaluate to the same thing as (cons 1 nil)
    (list 1 2) should evaluate to the same thing as (cons 1 (cons 2 nil))
    """
    #base case:
    if len(args) == 0:
        return None
    # if len(args) == 1:
    #     pair = Pair(args[0], None)
    #     return pair
    #recursive case:
    else:
        sub_pair = list_func(args[1:])
        new_pair = Pair(args[0], sub_pair)
        return new_pair

        # new_pair = Pair(args[0], args[1:])
        # return list_func(new_pair.cdr)  

def list_check(OBJECT):
    """
    (list? OBJECT) should take an arbitrary object as input, 
    and it should return #t if that object is a linked list, and #f otherwise.
    """
    if OBJECT[0] is None:
        return True
    
    elif not isinstance(OBJECT[0], Pair):
        return False
    else: #object is a pair instance
        
        #base case
        if OBJECT[0].cdr is None:
            return True
        #recursive step
        else:
            return list_check([OBJECT[0].cdr])

def length(LIST):
    """
    (length LIST) should take a list as argument 
    and should return the length of that list. 
    When called on any object that is not a linked list, it should raise a SchemeEvaluationError.
    """
    if LIST[0] is None:
        return 0
    elif not list_check(LIST):
        raise SchemeEvaluationError
    else:
        #base case 
        if LIST[0].cdr is None:
            return 1
        #recursive step 
        else:
            return 1 + length([LIST[0].cdr])


def list_ref(LIST):
    """
    (list-ref LIST INDEX) should take a list and a nonnegative index, 
    and it should return the element at the given index in the given list. 
    As in Python, indices start from 0. 
    If LIST is a cons cell (but not a list), then asking for index 0 should produce the car of that cons cell, 
    and asking for any other index should raise a SchemeEvaluationError. You do not need to support negative indices.
    """
    if LIST[0] is None:
        raise SchemeEvaluationError('1')
    if len(LIST) != 2:
        raise SchemeEvaluationError('2')

    elif list_check([LIST[0]]):
        if LIST[1] == 0:
            return LIST[0].car
        else:
            return list_ref([LIST[0].cdr, LIST[1] - 1])

    elif isinstance(LIST[0], Pair):
        print('hi')
        if LIST[1] == 0:
            return LIST[0].car
        else:
            raise SchemeEvaluationError

    elif not list_check([LIST[0]]):
        raise SchemeEvaluationError('3')        
    

def deep_copy(LIST):
    if LIST is None:
        return None
    else:
        current_copy = Pair(LIST.car, deep_copy(LIST.cdr))
        return current_copy

def append(LISTS):
    """
    (append LIST1 LIST2 LIST3 ...) should take an arbitrary number of lists as arguments 
    and should return a new list representing the concatenation of these lists. 
    If exactly one list is passed in, it should return a copy of that list. 
    If append is called with no arguments, it should produce an empty list. 
    Calling append on any elements that are not lists should result in a SchemeEvaluationError. 
    Note that this append is different from Python's, in that this should not mutate any of its arguments.
    """
    for list in LISTS:
         if not list_check([list]):
            raise SchemeEvaluationError
    if len(LISTS) == 0:
        return None
    if len(LISTS) == 1:
        l0_copy = deep_copy(LISTS[0])
        return l0_copy
    if LISTS[0] is None:
        return append(LISTS[1:])
    else:
        l0_copy = deep_copy(LISTS[0])
        l0_length = length([LISTS[0]])
        current_pair = l0_copy
        for i in range(l0_length - 1):
            current_pair = current_pair.cdr
        current_pair.cdr = append(LISTS[1:])
        return l0_copy
        
def begin(args):
    """
    begin should simply return its last argument
    """
    return args[-1]


scheme_builtins = {
    "+": sum,
    "-": lambda args: -args[0] if len(args) == 1 else (args[0] - sum(args[1:])),
    '*': mult,
    '/': div,
    'equal?': equal,
    '>': greater,
    '>=': greater_or_equal,
    '<': less,
    '<=': less_or_equal,
    'not': not_builtin,
    "#f": False, 
    "#t": True,
    'car': car,
    'cdr': cdr,
    'nil': None,
    'list': list_func,
    'list?': list_check, 
    'length': length,
    'list-ref': list_ref,
    'append': append,
    'begin': begin
}

class Frame:
    def __init__(self, parent_frame = None):
        self.variable_value_Dict = {}
        self.parent_frame = parent_frame

    def __setitem__(self, variable, value):
        self.variable_value_Dict[variable] = value
        
    def __getitem__(self, variable):
        if variable in self.variable_value_Dict:
            return self.variable_value_Dict[variable]
        elif self.parent_frame is not None:
            return self.parent_frame[variable]
        else:
            raise SchemeNameError(variable)

    def __contains__(self, variable):
        if variable in self.variable_value_Dict:
            return True
        elif self.parent_frame is not None:
            return self.parent_frame.__contains__(variable)
        else:
            return False


    def closest_frame(self, variable):
        if variable in self.variable_value_Dict:
            return self
        elif self.parent_frame is not None:
            return self.parent_frame.closest_frame(variable)
        else:
            return None


class Function:
    def __init__(self, parameters, expression, enclosing_frame):
        self.parameters = parameters
        self.expression = expression
        self.enclosing_frame = enclosing_frame
   
    def __call__(self, args):
        """
        Args:
            args(list): corresponding to the values of the parameters
        Returns:
            _type_: _description_
        """
        #make a new frame whose parent is the function's enclosing frame
        new_frame = Frame(self.enclosing_frame)

        #in that new frame, bind the function's parameters to the arguments that are passed to it
        len_parameter = len(self.parameters)
        len_args = len(args)
        if len_parameter != len_args:
            raise SchemeEvaluationError
        else:
            for i in range(len_parameter):
                new_frame[self.parameters[i]] = args[i]
        
        #evaluate the body of the function in that new frame
        return evaluate(self.expression, new_frame)

class Pair:
    def __init__(self, car, cdr):
        self.car = car
        self.cdr = cdr
    def __str__(self):
        return f'{self.car}, {self.cdr}'
   

##############
# Evaluation #
##############

def result_and_frame (tree, frame = None):
    """
    returns a tuple with two elements: 
    the result of the evaluation and the frame in which the expression was evaluated
    """
    if frame is None:
        f_empty = Frame(f_builtin)
        frame = f_empty
    result = evaluate(tree, frame)
    # print(frame)
    return (result, frame)

f_builtin = Frame()
f_builtin.variable_value_Dict = scheme_builtins

def evaluate(tree, frame = None):
    """
    Evaluate the given syntax tree according to the rules of the Scheme
    language.

    Arguments:
        tree (type varies): a fully parsed expression, as the output from the
                            parse function
    """
    # print('tree is', tree)
    
    if frame is None:
        f_empty = Frame(f_builtin)
        frame = f_empty
    if type(tree) is list: #If the expression is a list (representing an S-expression)
        if len(tree) == 0:
            raise SchemeEvaluationError
        if tree[0] == 'define':
            if type(tree[1]) is list:
                # function_object = Function(tree[1][1:], tree[2], frame)
                # return function_object
                new_list = ['define', tree[1][0], ['lambda', tree[1][1:], tree[2]]]
                evaluation = evaluate(new_list[2], frame)
                frame[new_list[1]] = evaluation
                return evaluation
            else:
                evaluation = evaluate(tree[2], frame)
                frame[tree[1]] = evaluation
                # print('define will return', evaluation)
                return evaluation

        if tree[0] == 'lambda':
            function_object = Function(tree[1], tree[2], frame)
            return function_object

        if tree[0] == 'if':
            eval_condition = evaluate(tree[1], frame)
            if eval_condition is True:
                return evaluate(tree[2], frame)
            else:
                return evaluate(tree[3], frame)

        if tree[0] == 'and':
            for arg in tree[1:]:
                if evaluate(arg, frame) is False:
                    return False
            return True

        if tree[0] == 'or':
            for arg in tree[1:]:
                if evaluate(arg, frame) is True:
                    return True
            return False

        if tree[0] == 'cons':
            if len(tree) != 3:
                raise SchemeEvaluationError('hello')
            new_pair_object = Pair(evaluate(tree[1], frame), evaluate(tree[2], frame))
            return new_pair_object

        if tree[0] == 'del':
            var = tree[1]
            if var not in frame.variable_value_Dict:
                raise SchemeNameError
            else:
                return frame.variable_value_Dict.pop(var)
                
        if tree[0] == 'let':
            #It takes the form: (let ((VAR1 VAL1) (VAR2 VAL2) (VAR3 VAL3) ...) BODY)
            #Evaluating all the given values in the current frame.
            #Creating a new frame whose parent is the current frame, binding each name to its associated value in this new frame.
            #Evaluating the BODY expression in this new frame (this value is the result of evaluating the let special form).
            bindings = tree[1]
            body = tree[2]
            new_frame = Frame(frame)
            for binding in bindings:
                new_frame[binding[0]] = evaluate(binding[1], frame)
            return evaluate(body, new_frame)

        if tree[0] == 'set!':
            #It takes the form: (set! VAR EXPR)
            #Evaluating the given expression in the current frame
            #Finding the nearest enclosing frame in which VAR is defined 
            # (starting from the current frame and working upward until it finds a binding) 
            # and updating its binding in that frame to be the result of evaluating EXPR
            
            var = tree[1]
            expr = tree[2]
            if var in frame:
                closest = frame.closest_frame(var)
                closest[var] = evaluate(expr, frame)
                return closest[var]
            else:
                raise SchemeNameError

        args = []
        for element in tree[1:]:
            args.append(evaluate(element, frame))
        # print(evaluate(tree[0]))
        # if tree[0] in scheme_builtins: #if it's a function that we have in our current frame 
        #     # print('list will return', evaluate(tree[0], frame)(args))
        #     return evaluate(tree[0], frame)(args)
        # print(tree[0])
        # if tree[0] in frame: #if it's a function that we have in our current frame 
            
        # try:
        eval_result = evaluate(tree[0], frame)
        if callable(eval_result):
            return eval_result(args)
        else:
            raise SchemeEvaluationError('Function not callable')
        # try:
        #     return eval_result(args)
        # except SchemeNameError:
        #     raise SchemeNameError
        # except:
        #     raise SchemeEvaluationError('function call failed')

        # else:
        #     raise SchemeEvaluationError
        
    # elif tree in scheme_builtins: #If the expression is a symbol representing a name in scheme_builtins
    #     return scheme_builtins[tree]
    elif type(tree) is int or type(tree) is float: #If the expression is a number
        return tree
    elif type(tree) is str:
        return frame[tree]
    else: #If the expression is a symbol that is not in scheme_builtins
        raise SchemeEvaluationError

def evaluate_file(FILE_NAME, FRAME = None):
    """
    This function should take a single argument (a string containing the name of a file to be evaluated) 
    and an optional argument (the frame in which to evaluate the expression), 
    and it should return the result of evaluating the expression contained in the file 
    (you may assume that each file contains a single expression).
    """
    with open(FILE_NAME) as file:
        # print(file.read())
        updated = parse(tokenize(file.read()))
        return evaluate(updated, FRAME)
    

########
# REPL #
########


def repl(raise_all=False):
    global_frame = Frame(f_builtin)
    for file in sys.argv[1:]:
        evaluate_file(file, global_frame)
    while True:
        # read the input.  pressing ctrl+d exits, as does typing "EXIT" at the
        # prompt.  pressing ctrl+c moves on to the next prompt, ignoring
        # current input
        try:
            inp = input("in> ")
            if inp.strip().lower() == "exit":
                print("  bye bye!")
                return
        except EOFError:
            print()
            print("  bye bye!")
            return
        except KeyboardInterrupt:
            print()
            continue

        try:
            # tokenize and parse the input
            tokens = tokenize(inp)
            ast = parse(tokens)
            # if global_frame has not been set, we want to call
            # result_and_frame without it (which will give us our new frame).
            # if it has been set, though, we want to provide that value
            # explicitly.
            args = [ast]
            if global_frame is not None:
                args.append(global_frame)
            result, global_frame = result_and_frame(*args)
            # finally, print the result
            print("  out> ", result)
        except SchemeError as e:
            # if raise_all was given as True, then we want to raise the
            # exception so we see a full traceback.  if not, just print some
            # information about it and move on to the next step.
            #
            # regardless, all Python exceptions will be raised.
            if raise_all:
                raise
            print(f"{e.__class__.__name__}:", *e.args)
        print()

if __name__ == "__main__":
    # code in this block will only be executed if lab.py is the main file being
    # run (not when this module is imported)

    # uncommenting the following line will run doctests from above
    # doctest.testmod()
    repl()
    # x = 'abc'
    # print(number_or_symbol(x))

    # x = tokenize("(nested (expressions (test) (is here) ((((now))))))")
    # print(x)
    # print(parse(x))
    # [["*",7,8],   [     "*",     9,     8,     0.5,     3,     5,     -2   ],   [     "/",     9,     7   ],   [     "/",     30,     0.5,     2,     4,     5,     9,     -2,     1,     9   ] ] 
    # f = Frame()