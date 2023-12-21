// ############################
//   Christmas Is Cancelled   #
//   December 2023            #
// ############################
//  setup
namespace SpriteKind {
    export const det = SpriteKind.create()
}

scene.setBackgroundImage(assets.image`snowfact`)
//  I need to explore the long text... potential story extension experiements in future??
game.showLongText(`Welcome to the factory!
The toy robots have gone crazy and are trying to cancel Christmas!!
Grab as many presents as you can!
You can pick up detonators throughout the factory to destroy all bots on screen using the A button (spacebar), time your uses wisely!!!`, DialogLayout.Bottom)
info.setLife(3)
tiles.setCurrentTilemap(assets.tilemap`floor`)
timer.after(randint(1000, 5000), enemy_spawn)
timer.after(randint(1000, 5000), present_spawn)
//  sprites + character anims
let hero = sprites.create(assets.image`Hero`, SpriteKind.Player)
hero.setStayInScreen(true)
controller.moveSprite(hero)
characterAnimations.setCharacterAnimationsEnabled(hero, true)
characterAnimations.loopFrames(hero, assets.animation`DOWN`, 50, characterAnimations.rule(Predicate.MovingDown))
characterAnimations.loopFrames(hero, assets.animation`UP`, 50, characterAnimations.rule(Predicate.MovingUp))
characterAnimations.loopFrames(hero, assets.animation`RIGHT`, 50, characterAnimations.rule(Predicate.MovingRight))
characterAnimations.loopFrames(hero, assets.animation`LEFT`, 50, characterAnimations.rule(Predicate.MovingLeft))
//  init variables 
let enem_count = 0
let new_life = 1000
let detonator_acquired = false
//  game
//  possibly attack, possibly just spawning a powerup that calls for the destruction of all enemies... need to think
//  updated 18/12/2023 powerup that destroys all enemies when button pressed!  
controller.A.onEvent(ControllerButtonEvent.Pressed, function attack() {
    
    
    if (detonator_acquired) {
        music.play(music.melodyPlayable(music.zapped), music.PlaybackMode.InBackground)
        for (let i of sprites.allOfKind(SpriteKind.Enemy)) {
            info.changeScoreBy(50)
        }
        sprites.destroyAllSpritesOfKind(SpriteKind.Enemy, effects.fire, 500)
        enem_count = 0
        detonator_acquired = false
    } else {
        music.play(music.melodyPlayable(music.buzzer), music.PlaybackMode.InBackground)
    }
    
})
//  spawn enemies here, also sets behaviour, maybe make it something that changes every so often in another function 
function enemy_spawn() {
    let bad: Sprite;
    
    //  there must be a better way of doing this lol
    if (enem_count < 5) {
        //  max of 5 enemies seems fair on a screen this size 
        bad = sprites.create(assets.image`baddy`, SpriteKind.Enemy)
        bad.setPosition(randint(0, 120), randint(0, 120))
        bad.setStayInScreen(true)
        bad.setBounceOnWall(true)
        bad.setVelocity(randint(-50, 50), randint(-50, 50))
        enem_count += 1
    }
    
    timer.after(randint(1000, 5000), enemy_spawn)
}

//  yay! recursion! I feel this will be happening a lot
//  pot powerup/proj??? gotta decide how we defeat
//  update 18/12/2023: Just did all the defeat in the attack, rebranding func for spawning detonator
function spawn_det() {
    let detonator: Sprite;
    
    if (!detonator_acquired) {
        detonator = sprites.create(assets.image`detonator`, SpriteKind.det)
        detonator.setPosition(randint(0, 120), randint(0, 120))
    }
    
}

//  detonator overlap code
sprites.onOverlap(SpriteKind.det, SpriteKind.Player, function get_det(detonator: any) {
    
    detonator_acquired = true
    sprites.destroy(detonator)
    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.InBackground)
})
//  the main point getter, have to save christmas somehow!!
function present_spawn() {
    let present = sprites.create(assets.image`present`, SpriteKind.Food)
    present.setPosition(randint(0, 120), randint(0, 120))
    timer.after(randint(1000, 5000), present_spawn)
}

//  overlap script for picking up present
sprites.onOverlap(SpriteKind.Food, SpriteKind.Player, function present_pick(gift: any) {
    
    info.changeScoreBy(100)
    let curscore = info.score
    sprites.destroy(gift)
    music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.InBackground)
})
//  overlap script for an enemy hitting us
sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Player, function player_hit(enemy: any) {
    
    //  again, there must be a better way, I however, cannot find it 
    info.changeLifeBy(-1)
    sprites.destroy(enemy)
    music.play(music.melodyPlayable(music.thump), music.PlaybackMode.InBackground)
    //  need some form of feedback, the effects were too much
    //  Thump is the quietest sound effect in the world what 
    enem_count -= 1
})
//  if powerup not needed, but if projectile, needed.
//  UPDATE unneeded lmao, just gonna leave here for posterity/if I have sudden inspiration for stronger enemies 
function enemy_hit() {
    
}

//  more lives script
function life_gain() {
    
    info.changeLifeBy(1)
    new_life += 1000
}

// on update func, is needed? UPDATE 18/12/2023, ye
//  call it anyway lmao
game.onUpdate(function tick() {
    
    if (info.score() >= new_life) {
        life_gain()
    }
    
})
//  need something to spawn the detonator every 30 seconds!!!!
game.onUpdateInterval(30000, function on_update_interval() {
    spawn_det()
})
