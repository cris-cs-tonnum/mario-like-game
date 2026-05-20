# Fraeda Soap Dodge

A funny browser canvas game where the player controls a horse character named Earthio and dodges flying soap bars across multiple rounds.

## Features

- Smooth left/right movement
- Jumping physics with gravity
- Animated horse walking frames
- Increasing difficulty each round
- Bubble effects around soap obstacles
- Win and fail game states
- Replay system
- Cute princess victory screen
- Fullscreen responsive canvas

## Controls

- A / Left Arrow → Move Left
- D / Right Arrow → Move Right
- W / Up Arrow / Space → Jump

## Gameplay

Avoid touching the soap bars while surviving each round.

Rounds become harder over time:
- Faster soap spawning
- More soaps required to dodge
- Increased challenge progression

Win all rounds to save the princess and complete the game.

## Tech

Built using:
- HTML5 Canvas
- Vanilla JavaScript
- 2D Canvas Rendering API

## Assets Needed

The game uses these image IDs:

- whitehorse
- walk1
- walk2
- walk3

Example:

```html
<img id="whitehorse" src="horse.png" hidden>
<img id="walk1" src="walk1.png" hidden>
<img id="walk2" src="walk2.png" hidden>
<img id="walk3" src="walk3.png" hidden>