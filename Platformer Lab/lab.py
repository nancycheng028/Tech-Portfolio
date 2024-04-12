#!/usr/bin/env python3

##################
# Game Constants #
##################

# other than TILE_SIZE, feel free to move, modify, or delete these constants as
# you see fit.

TILE_SIZE = 128

# vertical movement
GRAVITY = -9
MAX_DOWNWARD_SPEED = 48
PLAYER_JUMP_SPEED = 62
PLAYER_JUMP_DURATION = 3
PLAYER_BORED_THRESHOLD = 60

# horizontal movement
PLAYER_DRAG = 6
PLAYER_MAX_HORIZONTAL_SPEED = 48
PLAYER_HORIZONTAL_ACCELERATION = 16

#new features
STORM_LIGHTNING_ROUNDS = 5
STORM_RAIN_ROUNDS = 10

BEE_SPEED = 40
CATERPILLAR_SPEED = 16
PEANUT_SPEED = 60

CHIPMUNK_POWER = 5

# the following maps single-letter strings to the name of the object they
# represent, for use with deserialization in Game.__init__.
SPRITE_MAP = {
    "p": "player",
    "c": "cloud",
    "=": "floor",
    "B": "building",
    "C": "castle",
    "u": "cactus",
    "t": "tree",
}


##########################
# Classes and Game Logic #
##########################


class Rectangle:
    """
    A rectangle object to help with collision detection and resolution.
    """

    def __init__(self, x, y, w, h):
        """
        Initialize a new rectangle.

        `x` and `y` are the coordinates of the bottom-left corner. `w` and `h`
        are the dimensions of the rectangle.
        """
        self.x = x
        self.y = y
        self.w = w
        self.h = h

    def get_coordinates(self):
        x_lowerbound = self.x
        x_upperbound = self.x + self.w
        y_lowerbound = self.y
        y_upperbound = self.y + self.h

        coord_set = set()
        for x in range(x_lowerbound, x_upperbound + 1):
            for y in range(y_lowerbound, y_upperbound + 1):
                coord_set.add((x, y))

        return coord_set


    def intersects(self, other):
        """
        Check whether `self` and `other` (another Rectangle) overlap.

        Rectangles are open on the top and right sides, and closed on the
        bottom and left sides; concretely, this means that the rectangle
        [0, 0, 1, 1] does not intersect either of [0, 1, 1, 1] or [1, 0, 1, 1].
        """
        # self_set = self.get_coordinates()
        # other_set = other.get_coordinates()

        # for coord in self_set:
        #     if coord in other_set:
        #         return True
        #     else:
        #         return False

        x_lower_self = self.x
        x_upper_self = self.x + self.w
        y_lower_self = self.y
        y_upper_self = self.y + self.h

        x_lower_other = other.x
        x_upper_other = other.x + other.w
        y_lower_other = other.y
        y_upper_other = other.y + other.h

       
        if x_upper_other <= x_lower_self or x_upper_self <= x_lower_other:
            x_flag = True
        else:
            x_flag = False
        
        if y_upper_other <= y_lower_self or y_upper_self <= y_lower_other:
            y_flag = True
        else:
            y_flag = False
        
        if x_flag is False and y_flag is False:
            return True
        else:
            return False

    @staticmethod
    def translation_vector(r1, r2):
        """
        Compute how much `r2` needs to move to stop intersecting `r1`.

        If `r2` does not intersect `r1`, return `None`.  Otherwise, return a
        minimal pair `(x, y)` such that translating `r2` by `(x, y)` would
        suppress the overlap. `(x, y)` is minimal in the sense of the "L1"
        distance; in other words, the sum of `abs(x)` and `abs(y)` should be
        as small as possible.

        When two pairs `(x1, y1)` and `(x2, y2)` are tied in terms of this
        metric, return the one whose first element has the smallest
        magnitude.
        """
        if r1.intersects(r2) is False:
            return None
        else:
            left_movement = r1.x - (r2.x + r2.w)
            right_movement = r1.x + r1.w - r2.x
            if abs(left_movement) >= abs(right_movement):
                horizontal_movement = right_movement
            else:
                horizontal_movement = left_movement 

            down_movement = r1.y - (r2.y + r2.h)
            up_movement = r1.y + r1.h - r2.y
            if abs(down_movement) >= abs(up_movement):
                vertical_movement = up_movement
            else:
                vertical_movement = down_movement

            if abs(horizontal_movement) >= abs(vertical_movement):
                return (0, vertical_movement)
            else:
                return (horizontal_movement, 0) 

class Sprite:
    def __init__(self, position, size, texture):
        """initialize a new sprite object

        Args:
            position (tuple): (x, y)
            size (int): 128
            texture (str): "player", "cloud", "floor", "building", "castle", "cactus",  "tree"
        """
        self.position = position
        self.size = TILE_SIZE
        self.texture = texture

class Storm(Sprite):
    def __init__(self, position, size, texture):
        super().__init__(position, size, texture)

class DynamicSprite(Sprite):
    def __init__(self, position, size, texture, horizontal_velocity, vertical_velocity):
        super().__init__(position, size, texture)
        self.horizontal_velocity = horizontal_velocity
        self.vertical_velocity = vertical_velocity
        self.last_jump_timestep = -100000
        self.living_status = 'alive'
        
    def gravity_update(self):
        self.vertical_velocity = self.vertical_velocity + GRAVITY
        if self.vertical_velocity <= -MAX_DOWNWARD_SPEED:
            self.vertical_velocity = - MAX_DOWNWARD_SPEED
        

    def key_update(self, keys, game_step, flag):
        horizontal_acceleration = 0
        for key in keys:
            # if 1 <= self.jump_duration_counter <= PLAYER_JUMP_DURATION:
            #     self.vertical_velocity = PLAYER_JUMP_SPEED
            if key == 'up' and flag:
                
                self.vertical_velocity = PLAYER_JUMP_SPEED
                self.last_jump_timestep = game_step
                
            if key == 'down':
                pass
            if key == 'left':
                horizontal_acceleration = -PLAYER_HORIZONTAL_ACCELERATION
            if key == 'right':
                horizontal_acceleration = PLAYER_HORIZONTAL_ACCELERATION
        self.horizontal_velocity = self.horizontal_velocity + horizontal_acceleration

    def drag_update(self):
        #calculate drag
        if abs(self.horizontal_velocity) >= PLAYER_DRAG:
            if self.horizontal_velocity >= 0:
                drag = -PLAYER_DRAG
            if self.horizontal_velocity <= 0:
                drag = PLAYER_DRAG
        else:
            drag = -(self.horizontal_velocity)
        #update velocity based on drag 
        self.horizontal_velocity = self.horizontal_velocity + drag
        if abs(self.horizontal_velocity) >= PLAYER_MAX_HORIZONTAL_SPEED:
            if self.horizontal_velocity >= 0:
                self.horizontal_velocity = PLAYER_MAX_HORIZONTAL_SPEED
            if self.horizontal_velocity <= 0:
                self.horizontal_velocity = -PLAYER_MAX_HORIZONTAL_SPEED

    def position_update(self):
        self.position = (self.position[0]+self.horizontal_velocity, self.position[1] + self.vertical_velocity)

class Player(DynamicSprite):
    def __init__(self, position, size, texture, horizontal_velocity, vertical_velocity):
        super().__init__(position, size, texture, horizontal_velocity, vertical_velocity)

class Bee(DynamicSprite):
    def __init__(self, position, size, texture, horizontal_velocity, vertical_velocity):
        super().__init__(position, size, texture, horizontal_velocity, vertical_velocity)
    
    def gravity_update(self):
        pass

class Chipmunk(DynamicSprite):
    def __init__(self, position, size, texture, horizontal_velocity, vertical_velocity):
        super().__init__(position, size, texture, horizontal_velocity, vertical_velocity)

class Caterpillar(DynamicSprite):
    def __init__(self, position, size, texture, horizontal_velocity, vertical_velocity):
        super().__init__(position, size, texture, horizontal_velocity, vertical_velocity)
    

class Fire(DynamicSprite):
    def __init__(self, position, size, texture, horizontal_velocity, vertical_velocity):
        super().__init__(position, size, texture, horizontal_velocity, vertical_velocity)

class Helicopter(DynamicSprite):
    def __init__(self, position, size, texture, horizontal_velocity, vertical_velocity):
        super().__init__(position, size, texture, horizontal_velocity, vertical_velocity)

class Peanut(DynamicSprite):
    def __init__(self, position, size, texture, horizontal_velocity, vertical_velocity):
        super().__init__(position, size, texture, horizontal_velocity, vertical_velocity)

   
class Game:
    def __init__(self, level_map):
        """
        Initialize a new game, populated with objects from `level_map`.

        `level_map` is a 2D array of 1-character strings; all possible strings
        (and some others) are listed in the SPRITE_MAP dictionary.  Each
        character in `level_map` corresponds to a sprite of size `TILE_SIZE *
        TILE_SIZE`.

        This function is free to store `level_map`'s data however it wants.
        For example, it may choose to just keep a copy of `level_map`; or it
        could choose to read through `level_map` and extract the position of
        each sprite listed in `level_map`.

        Any choice is acceptable, as long as it works with the implementation
        of `timestep` and `render` below.
        """
        sprites_Dict = {}
        self.sprites = sprites_Dict
        self.counter = 0
        self.victory_status = 'ongoing'
        self.game_step = 0
        self.jump_collide_sprite = True
        self.storm_counter = 0
        
        
        sprites_Dict['dynamic'] = [] #list of dynamic sprite objects 
        
        sprites_Dict['static'] = [] #list of static sprite objects

        y_range = len(level_map)
        x_range = len(level_map[0])
        for i in range(y_range): #level_map[i] is a string ex. "  c   c  " 
            for j in range(x_range): 
                if level_map[i][j] != ' ': #if it's not a space, it's a sprite
                    x_coordinate = j * TILE_SIZE
                    y_coordinate = (y_range - i - 1) * TILE_SIZE
                    if level_map[i][j] == 'B':
                        sprites_Dict['static'].append(Sprite((x_coordinate, y_coordinate), TILE_SIZE, 'classical_building'))
                    if level_map[i][j] == 'u':
                        sprites_Dict['static'].append(Sprite((x_coordinate, y_coordinate), TILE_SIZE, 'cactus'))
                    if level_map[i][j] == 'C':
                        sprites_Dict['static'].append(Sprite((x_coordinate, y_coordinate), TILE_SIZE, 'castle'))
                    if level_map[i][j] == 'c':
                        sprites_Dict['static'].append(Sprite((x_coordinate, y_coordinate), TILE_SIZE, 'cloud'))
                    if level_map[i][j] == '=':
                        sprites_Dict['static'].append(Sprite((x_coordinate, y_coordinate), TILE_SIZE, 'black_large_square'))
                    if level_map[i][j] == 'p':
                        sprites_Dict['dynamic'].append(Player((x_coordinate, y_coordinate), TILE_SIZE, 'slight_smile', 0, 0))
                    if level_map[i][j] == 't':
                        sprites_Dict['static'].append(Sprite((x_coordinate, y_coordinate), TILE_SIZE, 'tree'))
                    if level_map[i][j] == 'e':
                        sprites_Dict['dynamic'].append(Bee((x_coordinate, y_coordinate), TILE_SIZE, 'bee', 0, BEE_SPEED))
                    if level_map[i][j] == 'f':
                        sprites_Dict['dynamic'].append(Fire((x_coordinate, y_coordinate), TILE_SIZE, 'fire', 0, 0))
                    if level_map[i][j] == 'i':
                        sprites_Dict['dynamic'].append(Chipmunk((x_coordinate, y_coordinate), TILE_SIZE, 'chipmunk', 0, 0))
                    if level_map[i][j] == '~':
                        sprites_Dict['dynamic'].append(Caterpillar((x_coordinate, y_coordinate), TILE_SIZE, 'caterpillar', CATERPILLAR_SPEED, 0))
                    if level_map[i][j] == 'h':
                        sprites_Dict['dynamic'].append(Helicopter((x_coordinate, y_coordinate), TILE_SIZE, 'helicopter', 0, 0))
                    if level_map[i][j] == None:
                        sprites_Dict['dynamic'].append(Peanut((x_coordinate, y_coordinate), TILE_SIZE, 'peanuts', 0, 0))
                    if level_map[i][j] == 's':
                        sprites_Dict['static'].append(Storm((x_coordinate, y_coordinate), TILE_SIZE, 'thunderstorm'))
                    if level_map[i][j] == 'w':
                        sprites_Dict['static'].append(Sprite((x_coordinate, y_coordinate), TILE_SIZE, 'water_wave'))




    def timestep(self, keys):
        """
        Simulate the evolution of the game state over one time step.  `keys` is
        a list of currently pressed keys.
        """
        if self.victory_status == 'victory' or self.victory_status == 'defeat':
            return None

        self.storm_counter += 1
        storm_num = self.storm_counter % (STORM_LIGHTNING_ROUNDS + STORM_RAIN_ROUNDS)
        for static_object in self.sprites['static']:
            if isinstance(static_object, Storm):
                storm = static_object
                if storm_num < STORM_LIGHTNING_ROUNDS:
                    storm.texture = 'thunderstorm'
                else:
                    storm.texture = 'rainy'

        for dynamic_sprite in self.sprites['dynamic']:
            if isinstance(dynamic_sprite, Player):
                player = dynamic_sprite
                player.key_update(keys, self.game_step, self.jump_collide_sprite)
                for key in keys:
                    if key == 'up' and player.texture != 'helicopter': #if there is a jump
                        self.jump_collide_sprite = False
                    if key == 'up' and player.texture == 'passenger_ship':
                        player.texture = 'slight_smile'
                if self.game_step - player.last_jump_timestep < PLAYER_JUMP_DURATION:
                    # if self.jump_collide_sprite is True:
                    player.vertical_velocity = PLAYER_JUMP_SPEED
                player.gravity_update() 
                player.drag_update()
                player.position_update()
            if isinstance(dynamic_sprite, Fire):  
                fire = dynamic_sprite
                fire.gravity_update()
                fire.position_update()
            if isinstance(dynamic_sprite, Bee):  
                bee = dynamic_sprite
                bee.position_update()
            if isinstance(dynamic_sprite, Caterpillar):  
                caterpillar = dynamic_sprite
                caterpillar.gravity_update()
                caterpillar.position_update()
                # print(caterpillar.vertical_velocity)


        # for each dynamic sprite s1 and each static sprite s2:
        #     if s1 and s2 intersect:
        #         move s1 along the minimal translation vector to stop intersecting s2

        #VERTICAL collisions between dynamic & static
        for dynamic_sprite in self.sprites['dynamic']:
            #collision between player & static
            if isinstance(dynamic_sprite, Player):
                player = dynamic_sprite
                for static_sprite in self.sprites['static']:
                    player_rectangle = Rectangle(player.position[0], player.position[1], player.size, player.size)
                    static_rectangle = Rectangle(static_sprite.position[0], static_sprite.position[1], static_sprite.size, static_sprite.size)
                    if static_rectangle.intersects(player_rectangle):
                        self.jump_collide_sprite = True
                        movement = static_rectangle.translation_vector(static_rectangle, player_rectangle)
                        if movement[0] == 0:
                            if static_sprite.texture == 'castle':
                                self.victory_status = 'victory'
                            if static_sprite.texture == 'cactus':
                                self.victory_status = 'defeat'
                            if isinstance(static_sprite, Storm):
                                if static_sprite.texture == 'thunderstorm':
                                    self.victory_status = 'defeat'
                            if static_sprite.texture == 'water_wave':
                                print('ship')
                                player.texture = 'passenger_ship'
                                print(player.texture)
                            player.position = (player.position[0] + movement[0], player.position[1] + movement[1])
                            #Hitting a static sprite should slow dynamic sprites down
                            vx = player.horizontal_velocity
                            vy = player.vertical_velocity
                            dx = movement[0]
                            dy = movement[1]
                            if dx != 0:
                                if (vx > 0 and dx < 0) or (vx < 0 and dx > 0): #if they have different signs
                                    player.horizontal_velocity = 0
                            if dy != 0:
                                if (vy > 0 and dy < 0) or (vy < 0 and dy > 0): #if they have different signs
                                    player.vertical_velocity = 0  

            #collision between fire & static           
            if isinstance(dynamic_sprite, Fire):
                fire = dynamic_sprite 
                for static_sprite in self.sprites['static']:
                    fire_rectangle = Rectangle(fire.position[0], fire.position[1], fire.size, fire.size)
                    static_rectangle = Rectangle(static_sprite.position[0], static_sprite.position[1], static_sprite.size, static_sprite.size)
                    if static_rectangle.intersects(fire_rectangle):
                        movement = static_rectangle.translation_vector(static_rectangle, fire_rectangle)
                        if movement[0] == 0:
                            fire.position = (fire.position[0] + movement[0], fire.position[1] + movement[1])
                            #Hitting a static sprite should slow dynamic sprites down
                            vx = fire.horizontal_velocity
                            vy = fire.vertical_velocity
                            dx = movement[0]
                            dy = movement[1]
                            if dx != 0:
                                if (vx > 0 and dx < 0) or (vx < 0 and dx > 0): #if they have different signs
                                    fire.horizontal_velocity = 0
                            if dy != 0:
                                if (vy > 0 and dy < 0) or (vy < 0 and dy > 0): #if they have different signs
                                    fire.vertical_velocity = 0  
            #collision between caterpillar & static           
            if isinstance(dynamic_sprite, Caterpillar):
                caterpillar = dynamic_sprite 
                for static_sprite in self.sprites['static']:
                    caterpillar_rectangle = Rectangle(caterpillar.position[0], caterpillar.position[1], caterpillar.size, caterpillar.size)
                    static_rectangle = Rectangle(static_sprite.position[0], static_sprite.position[1], static_sprite.size, static_sprite.size)
                    if static_rectangle.intersects(caterpillar_rectangle):
                        movement = static_rectangle.translation_vector(static_rectangle, caterpillar_rectangle)
                        if movement[0] == 0:
                            caterpillar.position = (caterpillar.position[0] + movement[0], caterpillar.position[1] + movement[1])
                            #Hitting a static sprite should slow dynamic sprites down
                            vx = caterpillar.horizontal_velocity
                            vy = caterpillar.vertical_velocity
                            dx = movement[0]
                            dy = movement[1]
                            if dx != 0:
                                if (vx > 0 and dx < 0) or (vx < 0 and dx > 0): #if they have different signs
                                    caterpillar.horizontal_velocity = 0
                            if dy != 0:
                                if (vy > 0 and dy < 0) or (vy < 0 and dy > 0): #if they have different signs
                                    caterpillar.vertical_velocity = 0  

            #collision between bee & static           
            if isinstance(dynamic_sprite, Bee):
                bee = dynamic_sprite
                for static_sprite in self.sprites['static']:
                    bee_rectangle = Rectangle(bee.position[0], bee.position[1], bee.size, bee.size)
                    static_rectangle = Rectangle(static_sprite.position[0], static_sprite.position[1], static_sprite.size, static_sprite.size)
                    if static_rectangle.intersects(bee_rectangle):
                        movement = static_rectangle.translation_vector(static_rectangle, bee_rectangle)
                        if movement[0] == 0:
                            bee.position = (bee.position[0] + movement[0], bee.position[1] + movement[1])
                            #Hitting a static sprite should slow dynamic sprites down
                            vx = bee.horizontal_velocity
                            vy = bee.vertical_velocity
                            dx = movement[0]
                            dy = movement[1]
                            if dx != 0:
                                if (vx > 0 and dx < 0) or (vx < 0 and dx > 0): #if they have different signs
                                    bee.horizontal_velocity = 0
                            if dy != 0:
                                if (vy > 0 and dy < 0) or (vy < 0 and dy > 0): #if they have different signs
                                    bee.vertical_velocity = - bee.vertical_velocity

                        
            
        #HORIZONTAL
        for player in self.sprites['dynamic']:
            if isinstance(dynamic_sprite, Player):
                player = dynamic_sprite
                for static_sprite in self.sprites['static']:
                    player_rectangle = Rectangle(player.position[0], player.position[1], player.size, player.size)
                    static_rectangle = Rectangle(static_sprite.position[0], static_sprite.position[1], static_sprite.size, static_sprite.size)
                    if static_rectangle.intersects(player_rectangle):
                        movement = static_rectangle.translation_vector(static_rectangle, player_rectangle)
                        if static_sprite.texture == 'castle':
                            self.victory_status = 'victory'
                        if static_sprite.texture == 'cactus':
                            self.victory_status = 'defeat'
                        if isinstance(static_sprite, Storm):
                            if static_sprite.texture == 'thunderstorm':
                                self.victory_status = 'defeat'
                        if static_sprite.texture == 'water_wave':
                            player.texture = 'passenger_ship'
                        player.position = (player.position[0] + movement[0], player.position[1] + movement[1])
                    
                        #Hitting a static sprite should slow dynamic sprites down
                        vx = player.horizontal_velocity
                        vy = player.vertical_velocity
                        dx = movement[0]
                        dy = movement[1]
                        if dx != 0:
                            if (vx > 0 and dx < 0) or (vx < 0 and dx > 0): #if they have different signs
                                player.horizontal_velocity = 0
                        if dy != 0:
                            if (vy > 0 and dy < 0) or (vy < 0 and dy > 0): #if they have different signs
                                player.vertical_velocity = 0

             #collision between fire & static           
            if isinstance(dynamic_sprite, Fire):
                fire = dynamic_sprite 
                for static_sprite in self.sprites['static']:
                    fire_rectangle = Rectangle(fire.position[0], fire.position[1], fire.size, fire.size)
                    static_rectangle = Rectangle(static_sprite.position[0], static_sprite.position[1], static_sprite.size, static_sprite.size)
                    if static_rectangle.intersects(fire_rectangle):
                        movement = static_rectangle.translation_vector(static_rectangle, fire_rectangle)
                        fire.position = (fire.position[0] + movement[0], fire.position[1] + movement[1])
                        #Hitting a static sprite should slow dynamic sprites down
                        vx = fire.horizontal_velocity
                        vy = fire.vertical_velocity
                        dx = movement[0]
                        dy = movement[1]
                        if dx != 0:
                            if (vx > 0 and dx < 0) or (vx < 0 and dx > 0): #if they have different signs
                                fire.horizontal_velocity = 0
                        if dy != 0:
                            if (vy > 0 and dy < 0) or (vy < 0 and dy > 0): #if they have different signs
                                fire.vertical_velocity = 0

            #collision between caterpillar & static           
            if isinstance(dynamic_sprite, Caterpillar):
                caterpillar = dynamic_sprite
                for static_sprite in self.sprites['static']:
                    caterpillar_rectangle = Rectangle(caterpillar.position[0], caterpillar.position[1], caterpillar.size, caterpillar.size)
                    static_rectangle = Rectangle(static_sprite.position[0], static_sprite.position[1], static_sprite.size, static_sprite.size)
                    if static_rectangle.intersects(caterpillar_rectangle):
                        movement = static_rectangle.translation_vector(static_rectangle, caterpillar_rectangle)
                        caterpillar.position = (caterpillar.position[0] + movement[0], caterpillar.position[1] + movement[1])
                        #Hitting a static sprite should slow dynamic sprites down
                        vx = caterpillar.horizontal_velocity
                        vy = caterpillar.vertical_velocity
                        dx = movement[0]
                        dy = movement[1]
                        if dx != 0:
                            if (vx > 0 and dx < 0) or (vx < 0 and dx > 0): #if they have different signs
                                caterpillar.horizontal_velocity = - caterpillar.horizontal_velocity
                        if dy != 0:
                            if (vy > 0 and dy < 0) or (vy < 0 and dy > 0): #if they have different signs
                                caterpillar.vertical_velocity = 0
            
        #collisions between player - fire 
        for ds1 in self.sprites['dynamic']:
            if isinstance(ds1, Player):
                player = ds1
                for ds2 in self.sprites['dynamic']:
                    if isinstance(ds2, Fire):
                        fire = ds2
                        player_rectangle = Rectangle(player.position[0], player.position[1], player.size, player.size)
                        fire_rectangle = Rectangle(fire.position[0], fire.position[1], fire.size, fire.size)
                        if fire_rectangle.intersects(player_rectangle):
                            self.victory_status = 'defeat'

        #collisions between player - bee 
        for ds1 in self.sprites['dynamic']:
            if isinstance(ds1, Player):
                player = ds1
                for ds2 in self.sprites['dynamic']:
                    if isinstance(ds2, Bee):
                        bee = ds2
                        player_rectangle = Rectangle(player.position[0], player.position[1], player.size, player.size)
                        bee_rectangle = Rectangle(bee.position[0], bee.position[1], bee.size, bee.size)
                        if bee_rectangle.intersects(player_rectangle):
                            self.victory_status = 'defeat'

        #collisions between fire - caterpillars
        for ds1 in self.sprites['dynamic']:
            if isinstance(ds1, Fire):
                fire = ds1
                for ds2 in self.sprites['dynamic']:
                    if isinstance(ds2, Caterpillar):
                        caterpillar = ds2
                        fire_rectangle = Rectangle(fire.position[0], fire.position[1], fire.size, fire.size)
                        caterpillar_rectangle = Rectangle(caterpillar.position[0], caterpillar.position[1], caterpillar.size, caterpillar.size)
                        if caterpillar_rectangle.intersects(fire_rectangle):
                            caterpillar.living_status = 'dead'
                    
        #collisions between player - caterpillars
        for ds1 in self.sprites['dynamic']:
            if isinstance(ds1, Player):
                player = ds1
                for ds2 in self.sprites['dynamic']:
                    if isinstance(ds2, Caterpillar):
                        caterpillar = ds2
                        player_rectangle = Rectangle(player.position[0], player.position[1], player.size, player.size)
                        caterpillar_rectangle = Rectangle(caterpillar.position[0], caterpillar.position[1], caterpillar.size, caterpillar.size)
                        if caterpillar_rectangle.intersects(player_rectangle):
                            # print('intersects')
                            # movement = player_rectangle.translation_vector(player_rectangle, caterpillar_rectangle)
                            movement = caterpillar_rectangle.translation_vector(caterpillar_rectangle, player_rectangle)
                            #caterpillar is squished if the player collides with it vertically, from above
                            # print(movement)
                            if movement[1] > 0:
                                caterpillar.living_status = 'dead'
                            #touching a caterpillar from the side or from below kills the player
                            else:
                                self.victory_status ='defeat'

        #collisions between player - helicopter 
        for ds1 in self.sprites['dynamic']:
            if isinstance(ds1, Player):
                player = ds1
                for ds2 in self.sprites['dynamic']:
                    if isinstance(ds2, Helicopter):
                        helicopter = ds2
                        player_rectangle = Rectangle(player.position[0], player.position[1], player.size, player.size)
                        helicopter_rectangle = Rectangle(helicopter.position[0], helicopter.position[1], helicopter.size, helicopter.size)
                        if helicopter_rectangle.intersects(player_rectangle):
                            # print('hi')
                            helicopter.living_status = 'dead'
                            player.texture = 'helicopter'

        
        
        if len(keys) == 0:
            self.counter += 1

        else:
            self.counter = 0

        for player in self.sprites['dynamic']:
            if player.position[1] < -TILE_SIZE:
                self.victory_status = 'defeat'

        self.game_step += 1
        
        
    def render(self, w, h):
        """
        Report status and list of sprite dictionaries for sprites with a
        horizontal distance of w//2 from player.  See writeup for details.
        """
        list_of_sprites = []
        for dynamic_sprite in self.sprites ['dynamic']:
            if isinstance(dynamic_sprite, Player):
                player = dynamic_sprite
                px = player.position[0]
                py = player.position[1]
                screen_rectangle = Rectangle(px - w//2, 0, w, h)
                player_rectangle = Rectangle(px, py, player.size, player.size)
                intersect = screen_rectangle.intersects(player_rectangle)
                if intersect:
                    if self.counter > PLAYER_BORED_THRESHOLD:
                        if player.texture != 'helicopter' and player.texture != 'passenger_ship':
                            player.texture = 'sleeping'
                    else:
                        if player.texture != 'helicopter' and player.texture != 'passenger_ship':
                            player.texture = 'slight_smile'
                    if self.victory_status == 'victory':
                        player.texture = 'partying_face'
                    if self.victory_status == 'defeat':
                        player.texture = 'injured'
                    player_Dict = {'texture': player.texture,
                                    'pos': player.position, 
                                    'player': True,}
                    list_of_sprites.append(player_Dict)
            if not isinstance(dynamic_sprite, Player):
                #all dynamic sprites except for the player
                dx = dynamic_sprite.position[0]
                dy = dynamic_sprite.position[1]
                screen_rectangle = Rectangle(dx - w//2, 0, w, h)
                dynamic_sprite_rectangle = Rectangle(dx, dy, dynamic_sprite.size, dynamic_sprite.size)
                intersect = screen_rectangle.intersects(dynamic_sprite_rectangle)
                if intersect:
                    dynamic_sprite_Dict = {'texture': dynamic_sprite.texture,
                                    'pos': dynamic_sprite.position, 
                                    'player': False,}
                    if dynamic_sprite.living_status == 'alive':
                        list_of_sprites.append(dynamic_sprite_Dict)
            
        for object in self.sprites['static']:
            bx = object.position[0]
            by = object.position[1]
            screen_rectangle = Rectangle(px - w//2, 0, w, h)
            object_rectangle = Rectangle(bx, by, object.size, object.size)
            intersect = screen_rectangle.intersects(object_rectangle)
            if intersect:
                object_Dict = {'texture': object.texture,
                            'pos': object.position, 
                            'player': False,}
                list_of_sprites.append(object_Dict)
        return (self.victory_status, list_of_sprites)

if __name__ == "__main__":
    pass
