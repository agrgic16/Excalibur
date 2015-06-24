/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Engine.ts" />

describe("A game actor", () => {
	
	var actor: ex.Actor;
	var engine;
   var scene;
   
	beforeEach(()=>{
      actor = new ex.Actor();
      

      actor.collisionType = ex.CollisionType.Active;
      scene = new ex.Scene(engine);

      spyOn(scene, 'draw').andCallThrough();
      spyOn(actor, 'draw');

		// mock engine		
	   engine = {
	      collisionStrategy: 0,
	      currentScene: scene,
	      keys: [],
	      clicks: [],
	      mouseDown: [],
	      mouseMove: [],
	      mouseUp: [],
	      touchStart: [],
	      touchMove: [],
	      touchEnd: [],
	      touchCancel: [],
	      width: 100,
	      height: 100,
	      canvas: {
	         width: 100,
	         clientWidth: 100,
	         height: 100,
	         clientHeight: 100
	      },
	      ctx: {
	         canvas: {
	            width: 100,
	            height: 100
	         },
	         save: function() {},
	         restore: function() {},
	         translate: function() {},
	         rotate: function() {},
	         scale: function() {}
	      },
	      getWidth: function() { return 100; },
	      getHeight: function() { return 100; },
	      camera: {
	         getZoom: function() { return 1; }
	      },
	      worldToScreenCoordinates: ex.Engine.prototype.worldToScreenCoordinates,
         screenToWorldCoordinates: ex.Engine.prototype.screenToWorldCoordinates
	   };
	});


	it("should be loaded", () => {
		expect(ex.Actor).toBeTruthy();
	});


	it("can have animation", () => {
		expect(actor.frames).toEqual({});

		actor.addDrawing("first", null);
		expect(actor.frames['first']).toBe(null);

	});

	it("can change positions when it has velocity", ()=>{
		expect(actor.y).toBe(0);
		expect(actor.x).toBe(0);

		actor.dy = 10;
		actor.dx = -10;

		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);

		expect(actor.x).toBe(-10);
		expect(actor.y).toBe(10);

		actor.update(engine, 1000);

		expect(actor.x).toBe(-20);
		expect(actor.y).toBe(20);

	});

	it('can have its height and width scaled', ()=>{
		expect(actor.width()).toBe(0);
          expect(actor.height()).toBe(0);

		actor.width(20);
          actor.height(20);

		expect(actor.width()).toBe(20);
          expect(actor.height()).toBe(20);

		actor.scale.x = 2;
          actor.scale.y = 3;

		expect(actor.width()).toBe(40);
          expect(actor.height()).toBe(60);

		actor.scale.x = .5;
          actor.scale.y = .1;

		expect(actor.width()).toBe(10);
          expect(actor.height()).toBe(2);


	});

	it('can have a center point', () => {
          actor.height(100);
      actor.width(50);

		var center = actor.getCenter();
		expect(center.x).toBe(0);
		expect(center.y).toBe(0);

		actor.x = 100;
		actor.y = 100;

		center = actor.getCenter();
		expect(center.x).toBe(100);
      expect(center.y).toBe(100);

      // changing the anchor
      actor.anchor = new ex.Point(0, 0);
      actor.x = 0;
      actor.y = 0;

      var center = actor.getCenter();
      expect(center.x).toBe(25);
      expect(center.y).toBe(50);

      actor.x = 100;
      actor.y = 100;

      center = actor.getCenter();
      expect(center.x).toBe(125);
      expect(center.y).toBe(150);

	});

	it('has a left, right, top, and bottom', ()=>{
      actor.width(100);
          actor.height(100);

		expect(actor.getLeft()).toBe(0);
		expect(actor.getRight()).toBe(100);
		expect(actor.getTop()).toBe(0);
		expect(actor.getBottom()).toBe(100);

	});

	it('can contain points', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);
      actor.width(20);
        actor.height(20);

      expect(actor.anchor.x).toBe(.5);
      expect(actor.anchor.y).toBe(.5);

	   actor.anchor = new ex.Point(0, 0);

		expect(actor.contains(10,10)).toBe(true);

		expect(actor.contains(21, 20)).toBe(false);
		expect(actor.contains(20, 21)).toBe(false);
		
		expect(actor.contains(0, -1)).toBe(false);
		expect(actor.contains(-1, 0)).toBe(false);

	});

	it('can collide with other actors', ()=>{
      var actor = new ex.Actor(0, 0, 10, 10);
		var other = new ex.Actor(10, 10, 10, 10);

      // Actors are adjacent and not overlapping should not collide
		expect(actor.collidesWithSide(other)).toBeFalsy();
		expect(other.collidesWithSide(actor)).toBeFalsy();

      // move other actor into collision range from the right side
		other.x = 9;
		other.y = 0;
		expect(actor.collidesWithSide(other)).toBe(ex.Side.Right);
		expect(other.collidesWithSide(actor)).toBe(ex.Side.Left);

      // move other actor into collision range from the left side
      other.x = -9;
      other.y = 0;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Left);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Right);


      // move other actor into collision range from the top
      other.x = 0
      other.y = -9;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Top);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Bottom);

      // move other actor into collision range from the bottom
      other.x = 0;
      other.y = 9;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Bottom);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Top);

	});

   it('participates with another in a collision', ()=>{
      var actor = new ex.Actor(0, 0, 10, 10);
      actor.collisionType = ex.CollisionType.Active;
      var other = new ex.Actor(8, 0, 10, 10);
      other.collisionType = ex.CollisionType.Active;
      var actorCalled = 'false';
      var otherCalled = 'false';

      actor.on('collision', function(){
         actorCalled = 'actor';
      });

      other.on('collision', function(){
         otherCalled = 'other';
      });

      scene.addChild(actor);
      scene.addChild(other);
      scene.update(engine, 20);
      scene.update(engine, 20);

      expect(actorCalled).toBe('actor');
      expect(otherCalled).toBe('other');

   });

	it('can be moved to a location at a speed', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(100, 0, 100);
		actor.update(engine, 500);

		expect(actor.x).toBe(50);
		expect(actor.y).toBe(0);

		actor.update(engine, 500);
		expect(actor.x).toBe(100);
		expect(actor.y).toBe(0);
	});

	it('can be moved to a location by a certain time', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveBy(100, 0,  2000);
		actor.update(engine, 1000);

		expect(actor.x).toBe(50);
		expect(actor.y).toBe(0);

	});

	it('can be rotated to an angle at a speed', ()=>{
		expect(actor.rotation).toBe(0);

		actor.rotateTo(Math.PI/2, Math.PI/2);
		actor.update(engine, 500);

		expect(actor.rotation).toBe(Math.PI/4);

		actor.update(engine, 500);
		expect(actor.rotation).toBe(Math.PI/2);
	});

	it('can be rotated to an angle by a certain time', ()=>{
		expect(actor.rotation).toBe(0);

		actor.rotateBy(Math.PI/2, 2000);
		actor.update(engine, 1000);

		expect(actor.rotation).toBe(Math.PI/4);
		actor.update(engine, 1000);

		expect(actor.rotation).toBe(Math.PI/2);

	});

	it('can be scaled at a speed', ()=>{
		expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

		actor.scaleTo(2, 4, .5, .5);
		actor.update(engine, 1000);

		expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
		actor.update(engine, 1000);

		expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2);
      actor.update(engine, 1000);

      expect(actor.scale.x).toBe(2);
      expect(actor.scale.y).toBe(2.5);
	});

	it('can be scaled by a certain time', ()=>{
		expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

		actor.scaleBy(4, 5, 1000);

		actor.update(engine, 500);
		expect(actor.scale.x).toBe(2.5);
      expect(actor.scale.y).toBe(3);

		actor.update(engine, 500);
		expect(actor.scale.x).toBe(4);
      expect(actor.scale.y).toBe(5);
	});

	it('can blink on and off', ()=>{
		expect(actor.visible).toBe(true);
		actor.blink(200, 200);

      actor.update(engine, 200);
		expect(actor.visible).toBe(false);

		actor.update(engine, 250);
		expect(actor.visible).toBe(true);

	});

	it('can blink at a frequency forever', ()=>{
		expect(actor.visible).toBe(true);
		actor.blink(200, 200).repeatForever();

		
		for(var i = 0; i < 2; i++){
			actor.update(engine, 200);
			expect(actor.visible).toBe(false);
			actor.update(engine, 200);
			expect(actor.visible).toBe(true);
			actor.update(engine, 200);
		}
		
	});

	it('can be delayed by an amount off time', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.delay(1000).moveTo(20, 0, 20);
		actor.update(engine, 1000);

		expect(actor.x).toBe(0);

		actor.update(engine, 1000);

		expect(actor.x).toBe(20);

	});

   it('can die', ()=>{
      scene.addChild(actor);
      expect(scene.children.length).toBe(1);
      actor.die();
      scene.update(engine, 100);
      expect(scene.children.length).toBe(0);
   });

   it('can perform actions and then die', ()=>{
      scene.addChild(actor);
      expect(actor.x).toBe(0);
      expect(actor.y).toBe(0);
      expect(scene.children.length).toBe(1);

      actor.moveTo(100, 0, 100).delay(1000).die();
      actor.update(engine, 1000);

      expect(actor.x).toBe(100);
      expect(actor.y).toBe(0);

      actor.update(engine, 500);
      expect(actor.x).toBe(100);
      expect(actor.y).toBe(0);

      actor.update(engine, 1000);
      scene.update(engine, 100);
      expect(scene.children.length).toBe(0);

   });

	it('can repeat previous actions', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeat();

		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1);
		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.update(engine, 1);
		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);
	});

	it('can repeat previous actions forever', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeatForever();

		for(var i = 0; i < 20; i++){
			actor.update(engine, 1000);
			expect(actor.x).toBe(10);
			expect(actor.y).toBe(0);

			actor.update(engine, 1000);
			expect(actor.x).toBe(20);
			expect(actor.y).toBe(0);

			actor.update(engine, 1);
			actor.update(engine, 1000);
			expect(actor.x).toBe(10);
			expect(actor.y).toBe(0);

			actor.update(engine, 1000);
			expect(actor.x).toBe(0);
			expect(actor.y).toBe(0);

			actor.update(engine,1);
		}

	});

	it('can have its moveTo action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10);
		actor.update(engine,500);

		actor.clearActions();
		expect(actor.x).toBe(5);
		expect(actor.y).toBe(0);

		// Actor should not move after stop
		actor.update(engine,500);
		expect(actor.x).toBe(5);
		expect(actor.y).toBe(0);
	});

	it('can have its moveBy action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveBy(20, 0, 1000);
		actor.update(engine,500);

		actor.clearActions();
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		// Actor should not move after stop
		actor.update(engine,500);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);
	});

	it('can have its rotateTo action stopped', ()=>{
		expect(actor.rotation).toBe(0);

		actor.rotateTo(Math.PI/2, Math.PI/2);
		actor.update(engine, 500);

		expect(actor.rotation).toBe(Math.PI/4);
		actor.clearActions();

		actor.update(engine, 500);
		expect(actor.rotation).toBe(Math.PI/4);
	});

	it('can have its rotateBy action stopped', ()=>{
		expect(actor.rotation).toBe(0);

		actor.rotateBy(Math.PI/2, 2000);
		
		actor.update(engine, 1000);

		actor.clearActions();
		expect(actor.rotation).toBe(Math.PI/4);

		actor.update(engine, 1000);

		expect(actor.rotation).toBe(Math.PI/4);
	});

	it('can have its scaleTo action stopped', ()=>{
		expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

		actor.scaleTo(2, 2, .5, .5);
		actor.update(engine, 1000);

		actor.clearActions();
		expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
		actor.update(engine, 1000);

		expect(actor.scale.x).toBe(1.5);
      expect(actor.scale.y).toBe(1.5);
	});

	it('can have its scaleBy action stopped', ()=>{
		expect(actor.scale.x).toBe(1);
      expect(actor.scale.y).toBe(1);

		actor.scaleBy(4, 4, 1000);

		actor.update(engine, 500);

		actor.clearActions();
		expect(actor.scale.x).toBe(2.5);
      expect(actor.scale.y).toBe(2.5);

		actor.update(engine, 500);
		expect(actor.scale.x).toBe(2.5);
      expect(actor.scale.y).toBe(2.5);
	});

	it('can have its blink action stopped', ()=>{
		expect(actor.visible).toBe(true);
		actor.blink(1, 3000);

		actor.update(engine, 500);
		expect(actor.visible).toBe(false);

		actor.clearActions();
		
		actor.update(engine, 500);
		actor.update(engine, 500);
		expect(actor.visible).toBe(true);
	});

	it('can have its delay action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.delay(1000).moveTo(20, 0, 20);
		actor.update(engine, 1000);

		expect(actor.x).toBe(0);

		actor.clearActions();
		actor.update(engine, 1000);

		expect(actor.x).toBe(0);
	});

	it('can have its repeat action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeat();

		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.clearActions();
		actor.update(engine, 1);
		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1);
		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);
	});

	it('can have its repeatForever action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeatForever();

		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.clearActions();

		for(var i = 0; i < 20; i++){
			actor.update(engine, 1000);
			expect(actor.x).toBe(10);
			expect(actor.y).toBe(0);
		}
	});

	it('can follow another actor', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		var actorToFollow = new ex.Actor(10, 0);
		actorToFollow.moveTo(100, 0, 10);
		actor.follow(actorToFollow);
		// actor.update(engine, 1000);
		// expect(actor.x).toBe(actorToFollow.x);

		for(var i = 1; i < 10; i++){
			// actor.follow(actorToFollow);
			actorToFollow.update(engine, 1000);
			actor.update(engine, 1000);
			expect(actor.x).toBe(actorToFollow.x-10)
		}


		// test different follow distances?
	});

	it('can meet another actor' , ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		// testing basic meet
		var actorToMeet = new ex.Actor(10, 0);
		actorToMeet.moveTo(100, 0, 10);
		actor.meet(actorToMeet);

		for(var i = 0; i < 9; i++){
			actorToMeet.update(engine, 1000);
			actor.update(engine, 1000);
			expect(actor.x).toBe(actorToMeet.x-10)
		}

		// actor should have caught up to actorToFollow since it stopped moving
		actorToMeet.update(engine, 1000);
		actor.update(engine, 1000);
		expect(actor.x).toBe (actorToMeet.x);

		//TODO have actor to be followed traveling at a diagonal 'toward' the following actor
		// testing when actorToMeet is moving in a direction towards the following actor
	});

   it('can find its global coordinates if it has a parent', ()=>{
         expect(actor.x).toBe(0);
         expect(actor.y).toBe(0);

         var childActor = new ex.Actor(50, 50);
         expect(childActor.x).toBe(50);
         expect(childActor.y).toBe(50);

         actor.addChild(childActor);

         actor.moveBy(10, 15, 1000);
         actor.update(engine, 1000);

         expect(childActor.getWorldX()).toBe(60);
         expect(childActor.getWorldY()).toBe(65);
   });

   it('can find its global coordinates if it doesn\'t have a parent', ()=>{
         expect(actor.x).toBe(0);
         expect(actor.y).toBe(0);

         actor.moveBy(10,15, 1000);
         actor.update(engine, 1000);

         expect(actor.getWorldX()).toBe(10);
         expect(actor.getWorldY()).toBe(15);
   });

   it('can be removed from the scene', ()=>{
      scene.addChild(actor);
      expect(scene.children.length).toBe(1);
      actor.kill();
      scene.update(engine, 100);
      expect(scene.children.length).toBe(0);
   });

   it('once killed is not drawn', () => {
      scene.add(actor);
      actor.kill();
      scene.update(engine, 100);
      scene.draw(engine.ctx, 100);
      expect(actor.draw).not.toHaveBeenCalled();
   });

   it('does not incure pointer overhead until an event is registered',() => {
      expect(actor.enableCapturePointer).toBeFalsy();
      expect(actor.capturePointer.captureMoveEvents).toBeFalsy();
      actor.on('pointerdown',() => { });
      expect(actor.capturePointer.captureMoveEvents).toBeFalsy();
      expect(actor.enableCapturePointer).toBeTruthy();
      actor.on('pointermove',() => { });
      expect(actor.capturePointer.captureMoveEvents).toBeTruthy();
      expect(actor.enableCapturePointer).toBeTruthy();
   });

   it('is drawn when onscreen',() => {
      actor.traits.length = 0;
      actor.traits.push(new ex.Traits.OffscreenCulling());
      actor.x = 0;
      actor.y = 0;
      actor.width(10);
      actor.height(10);

      scene.add(actor);
      scene.update(engine, 100);
      scene.draw(engine.ctx, 100);

      expect(actor.isOffScreen).toBeFalsy();
      expect(actor.draw).toHaveBeenCalled();

      
   });

   it('is not drawn when offscreen',() => {
      actor.x = 1000;
      actor.y = 1000;
      scene.update(engine, 100);
      expect(actor.isOffScreen).toBeFalsy();

      
      actor.x = 1010;
      actor.y = 1010;
      actor.width(5);
      actor.height(5);

      scene.add(actor);
      scene.update(engine, 100);
      scene.draw(engine.ctx, 100);
      
      expect(scene.camera.getFocus().x).toBe(50);
      expect(scene.camera.getFocus().y).toBe(50);
      expect(engine.worldToScreenCoordinates(new ex.Point(50, 50)).x).toBe(50);
      expect(engine.worldToScreenCoordinates(new ex.Point(50, 50)).y).toBe(50);
      expect(engine.getWidth()).toBe(100);
      expect(engine.getHeight()).toBe(100);


      expect(actor.isOffScreen).toBeTruthy();
      expect(actor.draw).not.toHaveBeenCalled();

   });
   
   it('can detect containment off of child actors', () => {
	  var parent = new ex.Actor(600, 100, 100, 100);
	  var child = new ex.Actor(0, 0, 100, 100);
	  var child2 = new ex.Actor(-600, -100, 100, 100);
	  
	  parent.addChild(child);
	  child.addChild(child2);
	  
	  // check reality
	  expect(parent.contains(550, 50)).toBeTruthy();
	  expect(parent.contains(650, 150)).toBeTruthy();
	  
	  
	  
	  // in world coordinates this should be false 
	  expect(child.contains(50, 50)).toBeFalsy();
	  
	  // in world coordinates this should be true
	  expect(child.contains(550, 50)).toBeTruthy();
	  expect(child.contains(650, 150)).toBeTruthy();
	  
	  // second order child shifted to the origin
	  expect(child2.contains(-50, -50)).toBeTruthy();
	  expect(child2.contains(50, 50)).toBeTruthy();	   
   });
   
   it('can recursively check containment', () => {
	  var parent = new ex.Actor(0, 0, 100, 100); 
	  var child = new ex.Actor(100, 100, 100, 100);
	  var child2 = new ex.Actor(100, 100, 100, 100);
	  parent.addChild(child);
	  
	  expect(parent.contains(150, 150)).toBeFalsy();
	  expect(child.contains(150, 150)).toBeTruthy();
	  expect(parent.contains(150, 150, true)).toBeTruthy();
	  expect(parent.contains(200, 200, true)).toBeFalsy();
	  
	  child.addChild(child2);
	  expect(parent.contains(250, 250, true)).toBeTruthy();	  
	  
   });

   it('with an active collision type can be placed on a fixed type', () => {
	  var scene = new ex.Scene(engine); 
	  
	  var active = new ex.Actor(0, -50, 100, 100);
	  active.collisionType = ex.CollisionType.Active;
	  active.dy = 10;
	  active.ay = 1000;
	  
	  var fixed = new ex.Actor(0, 50, 100, 100);
	  fixed.collisionType = ex.CollisionType.Fixed;
	  
	  scene.add(active);
	  scene.add(fixed);
	  
	  
	  expect(active.x).toBe(0);
	  expect(active.y).toBe(-50);
	  
	  expect(fixed.x).toBe(0);
	  expect(fixed.y).toBe(50);
	  
	  // update many times for safety
	  for(var i = 0; i < 40; i++){
		  scene.update(engine, 100);
	  }
	 	  
	  expect(active.x).toBe(0);
	  expect(active.y).toBe(-50);
	  
	  expect(fixed.x).toBe(0);
	  expect(fixed.y).toBe(50);
	  
   });

});