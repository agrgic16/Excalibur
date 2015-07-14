module ex {

   /**
    * Animations
    *
    * Animations allow you to display a series of images one after another,
    * creating the illusion of change. Generally these images will come from a [[SpriteSheet]] source.
    *
    * ## Creating an animation
    *
    * Create a [[Texture]] that contains the frames of your animation. Once the texture
    * is [[Loader|loaded]], you can then generate an [[Animation]] by creating a [[SpriteSheet]]
    * and using [[SpriteSheet.getAnimationForAll]].
    *
    * ```js
    * var game = new ex.Engine();
    * var txAnimPlayerIdle = new ex.Texture("/assets/tx/anim-player-idle.png");
    *
    * // load assets
    * var loader = new ex.Loader(txAnimPlayerIdle);
    *
    * // start game
    * game.start(loader).then(function () {
    *   var player = new ex.Actor();
    *  
    *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
    *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
    *   
    *   // create animation (125ms frame speed)
    *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
    *  
    *   // add drawing to player as "idle"
    *   player.addDrawing("idle", playerIdleAnimation);
    *
    *   // add player to game
    *   game.add(player);
    * });
    * ```
    * 
    * ## Sprite effects
    *
    * You can add [[SpriteEffect|sprite effects]] to an animation through methods
    * like [[Animation.invert]] or [[Animation.lighten]]. Keep in mind, since this
    * manipulates the raw pixel values of a [[Sprite]], it can have a performance impact.
    */
   export class Animation implements IDrawable {

      /**
       * The sprite frames to play, in order. See [[SpriteSheet.getAnimationForAll]] to quickly
       * generate an [[Animation]].
       */
      public sprites: Sprite[];

      /**
       * Duration to show each frame (in milliseconds)
       */
      public speed: number;

      /**
       * Current frame index being shown
       */
      public currentFrame: number = 0;

      private _oldTime: number = Date.now();
      
      public anchor = new Point(0.0, 0.0);
      public rotation: number = 0.0;
      public scale = new Point(1, 1);

      /**
       * Indicates whether the animation should loop after it is completed
       */
      public loop: boolean = false;

      /**
       * Indicates the frame index the animation should freeze on for a non-looping
       * animation. By default it is the last frame.
       */
      public freezeFrame: number = -1;

      private _engine: Engine;

      /**
       * Flip each frame vertically. Sets [[Sprite.flipVertical]].
       */
      public flipVertical: boolean = false;

      /**
       * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
       */
      public flipHorizontal: boolean = false;
      public width: number = 0;
      public height: number = 0;

      /**
       * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
       *
       * @param engine  Reference to the current game engine
       * @param images  An array of sprites to create the frames for the animation
       * @param speed   The number in milliseconds to display each frame in the animation
       * @param loop    Indicates whether the animation should loop after it is completed
       */
      constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean) {
         this.sprites = images;
         this.speed = speed;
         this._engine = engine;
         if (loop != null) {
            this.loop = loop;
         }
         this.height = images[0] ? images[0].height : 0;
         this.width = images[0] ? images[0].width : 0;
      }

      /**
       * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
       */
      public opacity(value: number) {
         this.addEffect(new Effects.Opacity(value));
      }

      /**
       * Applies the grayscale effect to a sprite, removing color information.
       */
      public grayscale() {
         this.addEffect(new Effects.Grayscale());
      }

      /**
       * Applies the invert effect to a sprite, inverting the pixel colors.
       */
      public invert() {
         this.addEffect(new Effects.Invert());
      }

      /**
       * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
       */
      public fill(color: Color) {
         this.addEffect(new Effects.Fill(color));
      }

      /**
       * Applies the colorize effect to a sprite, changing the color channels of all pixesl to be the average of the original color and the
       * provided color.
       */
      public colorize(color: Color) {
         this.addEffect(new Effects.Colorize(color));
      }

      /**
       * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
       */
      public lighten(factor: number = 0.1) {
         this.addEffect(new Effects.Lighten(factor));
      }

      /**
       * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
       */
      public darken(factor: number = 0.1) {
         this.addEffect(new Effects.Darken(factor));
      }

      /**
       * Applies the saturate effect to a sprite, saturates the color acccording to hsl
       */
      public saturate(factor: number = 0.1) {
         this.addEffect(new Effects.Saturate(factor));
      }

      /**
       * Applies the desaturate effect to a sprite, desaturates the color acccording to hsl
       */
      public desaturate(factor: number = 0.1) {
         this.addEffect(new Effects.Desaturate(factor));
      }

      /**
       * Add a [[ISpriteEffect]] manually
       */
      public addEffect(effect: Effects.ISpriteEffect) {
         for(var i in this.sprites) {
            this.sprites[i].addEffect(effect);
         }
      }

      /**
       * Removes an [[ISpriteEffect]] from this animation.
       * @param effect Effect to remove from this animation
       */
      public removeEffect(effect: Effects.ISpriteEffect): void;
      
      /**
       * Removes an effect given the index from this animation.
       * @param index  Index of the effect to remove from this animation
       */
      public removeEffect(index: number): void;
      public removeEffect(param: any) {
         for(var i in this.sprites) {
            this.sprites[i].removeEffect(param);
         }
      }

      /**
       * Clear all sprite effects
       */
      public clearEffects() {
         for(var i in this.sprites) {
            this.sprites[i].clearEffects();
         }  
      }

      private _setAnchor(point: Point) {
         //if (!this.anchor.equals(point)) {
            for (var i in this.sprites) {
               this.sprites[i].anchor.setTo(point.x, point.y);
            }
         //}
      }

      private _setRotation(radians: number) {
         //if (this.rotation !== radians) {
            for (var i in this.sprites) {
               this.sprites[i].rotation = radians;
            }
         //}
      }
      
      private _setScale(scale: Point) {
         //if (!this.scale.equals(scale)) {
            for (var i in this.sprites) {
               this.sprites[i].scale = scale;
            }
         //}
      }
      
      /**
       * Resets the animation to first frame.
       */
      public reset() {
         this.currentFrame = 0;
      }

      /**
       * Indicates whether the animation is complete, animations that loop are never complete.
       */
      public isDone() {
         return (!this.loop && this.currentFrame >= this.sprites.length);
      }

      /**
       * Not meant to be called by game developers. Ticks the animation forward internally and
       * calculates whether to change to the frame.
       * @internal
       */
      public tick() {
         var time = Date.now();
         if ((time - this._oldTime) > this.speed) {
            this.currentFrame = (this.loop ? (this.currentFrame + 1) % this.sprites.length : this.currentFrame + 1);
            this._oldTime = time;
         }
      }

      private _updateValues(): void {
         this._setAnchor(this.anchor);
         this._setRotation(this.rotation);
         this._setScale(this.scale);
      }

      /**
       * Skips ahead a specified number of frames in the animation
       * @param frames  Frames to skip ahead
       */
      public skip(frames: number) {
         this.currentFrame = (this.currentFrame + frames) % this.sprites.length;
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         this.tick();
         this._updateValues();
         var currSprite: Sprite;
         if (this.currentFrame < this.sprites.length) {
            currSprite = this.sprites[this.currentFrame];
            if (this.flipVertical) {
               currSprite.flipVertical = this.flipVertical;
            }
            if (this.flipHorizontal) {
               currSprite.flipHorizontal = this.flipHorizontal;
            }
            currSprite.draw(ctx, x, y);
         }

         if (this.freezeFrame !== -1 && this.currentFrame >= this.sprites.length) {
            currSprite = this.sprites[Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
            currSprite.draw(ctx, x, y);
         }
      }

      /**
       * Plays an animation at an arbitrary location in the game.
       * @param x  The x position in the game to play
       * @param y  The y position in the game to play
       */
      public play(x: number, y: number) {
         this.reset();
         this._engine.playAnimation(this, x, y);
      }
    }
}