# NO ADDITIONAL IMPORTS!
import doctest
from text_tokenize import tokenize_sentences


class PrefixTree:
    def __init__(self):
        self.value = None
        self.children = {}

    def __setitem__(self, key, value):
        """
        Add a key with the given value to the prefix tree, or reassign the
        associated value if it is already present.  Assume that key is an
        immutable ordered sequence.  Raise a TypeError if the given key is not
        a string.
        """
        if type(key) is not str:
            raise TypeError
        #base case: nothing left in the string 
        if key == '':
            self.value = value 
        elif self.children is {}:
            raise KeyError
        #recursive step 
        else:
            if key[0] in self.children:
                self.children[key[0]].__setitem__(key[1:], value)
                # print('key in tree')
                # print(key)
                # print(self.children)
            if key[0] not in self.children:
                new = PrefixTree()
                new.__setitem__(key[1:], value)
                self.children[key[0]] = new
                # print('key not in tree')
                # print(key)
                # print(self.children)
                

    def __getitem__(self, key):
        """
        Return the value for the specified prefix.  If the given key is not in
        the prefix tree, raise a KeyError.  If the given key is not a string,
        raise a TypeError.
        """
        if type(key) is not str:
            raise TypeError
        if key == '':
            return self.value
        elif self.children is {}:
            raise KeyError
        else:
            if key[0] in self.children:
                return self.children[key[0]].__getitem__(key[1:])
            if key[0] not in self.children:
                raise KeyError

    def __delitem__(self, key):
        """
        Delete the given key from the prefix tree if it exists. If the given
        key is not in the prefix tree, raise a KeyError.  If the given key is
        not a string, raise a TypeError.
        """
        if type(key) is not str:
            raise TypeError
        #base case: nothing left in the string 
        
        if key == '':
            if self.value is None:
                raise KeyError
            self.value = None
        
        elif self.children is {}:
            raise KeyError
        #recursive step 
        else:
            if key[0] in self.children:
                self.children[key[0]].__delitem__(key[1:])
            if key[0] not in self.children:
                raise KeyError
                
    def __contains__(self, key):
        """
        Is key a key in the prefix tree?  Return True or False.  If the given
        key is not a string, raise a TypeError.
        """
        if type(key) is not str:
            raise TypeError
        #base case: nothing left in the string 
        if key == '':
            if self.value is not None:
                return True
            else:
                return False
        elif self.children is {}:
            return False
        #recursive step 
        else:
            if key[0] in self.children:
                return self.children[key[0]].__contains__(key[1:])
            if key[0] not in self.children:
                return False 

    def __iter__(self):
        """
        Generator of (key, value) pairs for all keys/values in this prefix tree
        and its children.  Must be a generator!
        """
        if self.value is not None:
            yield ('', self.value)
        for child in self.children:
            for i in self.children[child]:
                yield (child + i[0], i[1])
        # if self.children is not {}:
        #     yield from self.children.__iter__()
        # for elt in self:
        #     yield (self.key, self.value)
        


def word_frequencies(text):
    """
    Given a piece of text as a single string, create a prefix tree whose keys
    are the words in the text, and whose values are the number of times the
    associated word appears in the text.
    """
    frequency_map = PrefixTree()
    tokenized_text = tokenize_sentences(text)
    for sentence in tokenized_text:
        words = sentence.split()
        for each_word in words:
            if each_word not in frequency_map: #not in the tree
                frequency_map[each_word] = 1
            else: #if already in tree
                current_frequency = frequency_map[each_word]
                frequency_map[each_word] = current_frequency + 1
    return frequency_map


def autocomplete(tree, prefix, max_count=None):
    """
    Return the list of the most-frequently occurring elements that start with
    the given prefix.  Include only the top max_count elements if max_count is
    specified, otherwise return all.

    Raise a TypeError if the given prefix is not a string.
    """
    
    if type(prefix) is not str:
        raise TypeError
    # if prefix not in tree:
    #     return []
    else: #prefix in tree, all the types correct
        for char in prefix:
            if char not in tree.children:
                return []
            else:
                tree = tree.children[char]

        iter_list = list(tree)
        prefix_frequency = []
        for k, v in iter_list:
            prefix_str = prefix + k
            prefix_frequency.append((prefix_str, v))
        prefix_frequency = sorted(prefix_frequency, reverse=True, key = lambda x: x[1])

        word_list = []
        for i in range(len(prefix_frequency)):
            word_list.append(prefix_frequency[i][0])
        
        if max_count is None:
            final_list = word_list
        elif len(prefix_frequency) >= max_count:
            final_list = word_list[:max_count]
        else:
            final_list = word_list
        return final_list

def valid_edit (prefix):
    """generate all possiblilities of applying one valid edit of prefix
        An edit for a word can be any one of the following:
        A single-character insertion (add any one character in the range "a" to "z" at any place in the word)
        A single-character deletion (remove any one character from the word)
        A single-character replacement (replace any one character in the word with a character in the range a-z)
        A two-character transpose (switch the positions of any two adjacent characters in the word) 
    Args:
        prefix (str)
    Returns:
        list of possible words 
    """

    alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    # print(prefix[0])
    #single character insertion:
    insertion = []
    for position in range (len(prefix) + 1):
        first_half = prefix[:position]
        # print(first_half)
        second_half = prefix[position:]
        # print(second_half)
        for letter in alphabet:
            inserted_word = first_half + letter + second_half
            if inserted_word not in insertion:
                insertion.append(inserted_word)
            
    #single character deletion:
    deletion = []
    for position in range (len(prefix)):
        first_half = prefix[:position]
        second_half = prefix[position + 1:]
        deleted_word = first_half + second_half
        deletion.append(deleted_word)
    
    #single character replacement:
    replacement = []
    for position in range (len(prefix)):
        first_half = prefix[:position]
        second_half = prefix[position + 1:]
        for letter in alphabet:
            if letter != prefix[position]:
                replaced_word = first_half + letter + second_half
                replacement.append(replaced_word)

    #two character transpose
    transpose = []
    for position in range(len(prefix) - 1):
        first_half = prefix[:position]
        second_half = prefix[position + 2:]
        char_1 = prefix[position]
        char_2 = prefix[position + 1]
        # print(char_1, char_2)
        transposed_word = first_half + char_2 + char_1 + second_half
        if transposed_word != prefix:
            transpose.append(transposed_word)
        # print('transpose', transpose)
        # print('transpose is', transpose)
    return insertion + deletion + replacement + transpose
    
# x = 'cat'
# print(valid_edit(x))

def autocorrect(tree, prefix, max_count=None):
    """
    Return the list of the most-frequent words that start with prefix or that
    are valid words that differ from prefix by a small edit.  Include up to
    max_count elements from the autocompletion.  If autocompletion produces
    fewer than max_count elements, include the most-frequently-occurring valid
    edits of the given word as well, up to max_count total elements.
    """
    # print('max count', max_count)
    autocomplete_list = autocomplete(tree, prefix, max_count)
    # print('autocomplete list is', autocomplete_list)

    if max_count is not None:
        if len(autocomplete_list) >= max_count:
            return autocomplete_list
        else: #if autocomplete generate less than what we want, suggest additional words by applying one valid edit 
            missing_amount = max_count - len(autocomplete_list)
            possible_words = valid_edit(prefix)
            option_list = []
            for word in possible_words:
                if word in tree and word not in autocomplete_list:
                    word_tuple = (word, tree[word])
                    option_list.append(word_tuple)
            option_list = sorted(option_list, reverse=True, key=lambda x: x[1])
            # print('option list is', option_list)
            autocorrect_word_list = []
            for i in range(len(option_list)):
                autocorrect_word_list.append(option_list[i][0])
            autocorrect_list = autocorrect_word_list[:missing_amount]
            return autocomplete_list + autocorrect_list
    if max_count is None:
        possible_words = valid_edit(prefix)
        option_list = []
        for word in possible_words:
            if word in tree and word not in autocomplete_list:
                word_tuple = (word, tree[word])
                option_list.append(word_tuple)
        option_list = sorted(option_list, reverse=True, key=lambda x: x[1])
        # print('option list is', option_list)
        autocorrect_word_list = []
        for i in range(len(option_list)):
            autocorrect_word_list.append(option_list[i][0])
        autocorrect_list = autocorrect_word_list
        return autocomplete_list + autocorrect_list

def word_filter(tree, pattern):
    """
    Return list of (word, freq) for all words in the given prefix tree that
    match pattern.  pattern is a string, interpreted as explained below:
         * matches any sequence of zero or more characters,
         ? matches any single character,
         otherwise char in pattern char must equal char in word.
    """
    #base case
    if pattern == '':
        # print('base')
        if tree.value is None:
            return []
        else:
            return [('', tree.value)]

    #recursive step
    first_char = pattern[0]
    if first_char != '*' and first_char != '?':
        # print(1)
        if first_char in tree.children:
            recur_result = word_filter(tree.children[first_char], pattern[1:])
            added_result = set()
            for result in recur_result: #result is a tuple
                added_result.add((first_char + result[0], result[1]))
            
            return list(added_result)
        else: #first char is not in the next node
            return [] 
    if first_char == '?':
        # print(2)
        added_result = set()
        for each_children in tree.children: #tree.children is a dictionary, each children is the key, value is another tree
            recur_result = word_filter(tree.children[each_children], pattern[1:])
            for result in recur_result: #result is a tuple
                added_result.add((each_children + result[0], result[1]))
        return list(added_result)
    if first_char == '*':
        # print(3)
        final_list = set()
        #first case: if * takes in zero character
        zero_result = word_filter(tree, pattern[1:])
        for element in zero_result:
            final_list.add(element)
        #second case: if * takes in one or more character
        for each_children in tree.children: #tree.children is a dictionary, each children is the key, value is another tree
            recur_result = word_filter(tree.children[each_children], pattern)
            for result in recur_result: #result is a tuple
                # print('recur result is', recur_result)
                # print('result is', result)
                # print('type of each children is',type(each_children))
                # print('type of result[0] is', type(result[0]))
                final_list.add((each_children + result[0], result[1]))
        return list(final_list)
# you can include test cases of your own in the block below.
if __name__ == "__main__":
    doctest.testmod()
    with open("dracula.txt", encoding="utf-8") as f:
        text = f.read()
    token = tokenize_sentences(text)
    dracula = set()
    for sentence in token:
        words = sentence.split()
        for word in words:
            dracula.add(word)
    print(len(dracula))
    meta_tree = word_frequencies(text)
    answer = autocomplete(meta_tree, 'gre', 6)
    answer = word_filter(meta_tree, 'c*h')
    answer = word_filter(meta_tree, 'r?c*t')
    answer = autocorrect(meta_tree, 'hear', 12)
    answer = answer = autocorrect(meta_tree, 'hear')
    # print(answer)

    # nums = {'thin': [0, 8, 10, None],
    #         'tom': [0, 2, 4, None],
    #         'mon': [0, 2, 15, 17, 20, None]}
    # with open(os.path.join(TEST_DIRECTORY, 'testing_data', 'frankenstein.txt'), encoding='utf-8') as f:
    #     text = f.read()
    # w = lab.word_frequencies(text)
    # for i in sorted(nums):
    #     for n in nums[i]:
    #         result = lab.autocorrect(w, i, n)
    #         expected = read_expected('frank_autocorrect_%s_%s.pickle' % (i, n))
    # t = word_frequencies("cats cattle hat car act at chat crate act car act")
    # result = autocorrect(t, 'cat',4)
    # print(result)
    # assert set(result) == {"act", "car", "cats", "cattle"}


    # t = PrefixTree()
    # t['cat'] = 'kitten'
    # t['car'] = 'tricycle'
    # t['carpet'] = 'rug'
    # print(t)
    # d = {'name': 'John', 'favorite_numbers': [2, 4, 3], 'age': 39, 'children': 0}
    # print('name' in d)
    # print('favorite_numbers' in d)
    # print('age' in d)
    # print('children' in d)
    # print('names' in d)
    # def from_dict(d):
    #     t = PrefixTree()
    #     for k, v in d.items():
    #         t[k] = v
    #     return t
    # print(from_dict(d))
    # t = from_dict(d)
    # print("name" in t)
