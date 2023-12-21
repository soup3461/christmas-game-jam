#############################
#  Christmas Is Cancelled   #
#  December 2023            #
#############################
@namespace
# setup
class SpriteKind:
    det = SpriteKind.create()
scene.set_background_image(assets.image("snowfact"))
# I need to explore the long text... potential story extension experiements in future??
game.show_long_text("Welcome to the factory!\nThe toy robots have gone crazy and are trying to cancel Christmas!!\nGrab as many presents as you can!\nYou can pick up detonators throughout the factory to destroy all bots on screen using the A button (spacebar), time your uses wisely!!!", DialogLayout.BOTTOM)
info.set_life(3)
tiles.set_current_tilemap((assets.tilemap("floor")))
timer.after(randint(1000,5000), enemy_spawn)
timer.after(randint(1000,5000), present_spawn)

# sprites + character anims
hero = sprites.create(assets.image("Hero"), SpriteKind.player)
hero.set_stay_in_screen(True)
controller.move_sprite(hero)
characterAnimations.set_character_animations_enabled(hero, True)
characterAnimations.loop_frames(hero, assets.animation("DOWN"), 50, characterAnimations.rule(Predicate.MOVING_DOWN))
characterAnimations.loop_frames(hero, assets.animation("UP"), 50, characterAnimations.rule(Predicate.MOVING_UP))
characterAnimations.loop_frames(hero, assets.animation("RIGHT"), 50, characterAnimations.rule(Predicate.MOVING_RIGHT))
characterAnimations.loop_frames(hero, assets.animation("LEFT"), 50, characterAnimations.rule(Predicate.MOVING_LEFT))
# init variables 
enem_count = 0
new_life = 1000
detonator_acquired = False


# game

# possibly attack, possibly just spawning a powerup that calls for the destruction of all enemies... need to think
# updated 18/12/2023 powerup that destroys all enemies when button pressed!  
def attack():
    global detonator_acquired
    global enem_count
    if detonator_acquired:
        music.play(music.melody_playable(music.zapped), music.PlaybackMode.IN_BACKGROUND)
        for i in sprites.all_of_kind(SpriteKind.enemy):
            info.change_score_by(50)
        sprites.destroy_all_sprites_of_kind(SpriteKind.enemy, effects.fire, 500)
        enem_count = 0
        detonator_acquired = False
    else:
        music.play(music.melody_playable(music.buzzer), music.PlaybackMode.IN_BACKGROUND)

controller.A.on_event(ControllerButtonEvent.PRESSED, attack)
        

# spawn enemies here, also sets behaviour, maybe make it something that changes every so often in another function 
def enemy_spawn():
    global enem_count # there must be a better way of doing this lol
    if enem_count < 5: # max of 5 enemies seems fair on a screen this size 
        bad = sprites.create(assets.image("baddy"), SpriteKind.enemy)
        bad.set_position(randint(0, 120), randint(0, 120))
        bad.set_stay_in_screen(True)
        bad.set_bounce_on_wall(True)
        bad.set_velocity(randint(-50, 50), randint(-50, 50))
        enem_count += 1
    timer.after(randint(1000,5000), enemy_spawn) # yay! recursion! I feel this will be happening a lot

# pot powerup/proj??? gotta decide how we defeat
# update 18/12/2023: Just did all the defeat in the attack, rebranding func for spawning detonator
def spawn_det():
    global detonator_acquired
    if not detonator_acquired:
        detonator = sprites.create(assets.image("detonator"), SpriteKind.det)
        detonator.set_position(randint(0, 120), randint(0, 120))
# detonator overlap code
def get_det(detonator):
    global detonator_acquired
    detonator_acquired = True
    sprites.destroy(detonator)
    music.play(music.melody_playable(music.power_up), music.PlaybackMode.IN_BACKGROUND)

sprites.on_overlap(SpriteKind.det, SpriteKind.player, get_det)

# the main point getter, have to save christmas somehow!!
def present_spawn():
    present = sprites.create(assets.image("present"), SpriteKind.food)
    present.set_position(randint(0, 120), randint(0, 120))
    timer.after(randint(1000,5000), present_spawn)

# overlap script for picking up present
def present_pick(gift):
    global new_life
    info.change_score_by(100)
    curscore = info.score
    sprites.destroy(gift)
    music.play(music.melody_playable(music.ba_ding), music.PlaybackMode.IN_BACKGROUND)

sprites.on_overlap(SpriteKind.food, SpriteKind.player, present_pick)

# overlap script for an enemy hitting us
def player_hit(enemy):
    global enem_count # again, there must be a better way, I however, cannot find it 
    info.change_life_by(-1)
    sprites.destroy(enemy)
    music.play(music.melody_playable(music.thump), music.PlaybackMode.IN_BACKGROUND) # need some form of feedback, the effects were too much
    # Thump is the quietest sound effect in the world what 
    enem_count -= 1
sprites.on_overlap(SpriteKind.enemy, SpriteKind.player, player_hit)

# if powerup not needed, but if projectile, needed.
# UPDATE unneeded lmao, just gonna leave here for posterity/if I have sudden inspiration for stronger enemies 
def enemy_hit():
    pass

# more lives script

def life_gain():
    global new_life
    info.change_life_by(1)
    new_life += 1000


#on update func, is needed? UPDATE 18/12/2023, ye
def tick():
    global new_life
    if (info.score() >= new_life):
        life_gain()
        
# call it anyway lmao
game.on_update(tick)

# need something to spawn the detonator every 30 seconds!!!!
def on_update_interval():
    spawn_det()
game.on_update_interval(30000, on_update_interval)