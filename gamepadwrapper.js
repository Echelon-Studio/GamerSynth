// controller support script
// requires JQuery
// author: Lucas Burdell


/** QUICK DOCUMENTATION:
	GamepadWrapper is an object. Create with:
		
		var wrapper = new GamepadWrapper();
	
	Once created, you can check if gamepads are supported with:

		if (wrapper.supported) {
			console.log("Gamepads are supported!");
		}
	
	check if gamepad is connected using:

		if (wrapper.gamepadConnected) {
			console.log("A gamepad is connected!");
		}

	The wrapper maintains an internal list of functions to call whenever a gamepad is setup. 
	
	It calls every function in this list on a 100 millisecond interval.

	To add a function, call like this:

		wrapper.addGamepadListener("name_of_function", function);

	The wrapper will refer to that function using the object provided as a hash.
	The wrapper will pass in the gamepad object connected as an argument to the function when calling it.
	The wrapper will only call this function if a gamepad is connected. Eventually I'll add listeners for connecting and disconnecting.

	To remove a function from the listener list, call like so:

		wrapper.removeGamepadListener("name_of_function");

	This will remove the function in the list, and it will no longer be called.



**/

function GamepadWrapper() {
	this.supported = "getGamepads" in navigator;
	this.gamepadConnected = false;
	this.gamepad = false;
	this.mapScheme = 0; // 0 for playstation/standard, 1 for XBox
	this.debug = 1;
	this.mapping = null;

	var _this = this;

	if (this.supported) {

		this.controlListeners = { };

		function create_controls(mapScheme){
			if (!MAPPINGS[mapScheme]) {
				return;
			}
			var map = MAPPINGS[mapScheme];
			for (var i in map.buttons) {
				var control = new ControlMapping(map.buttons[i]);
				_this.controlListeners[control.name] = control;
			}
			for (var i in map.axes) {
				var control = new ControlMapping(map.axes[i]);
				_this.controlListeners[control.name] = control;
			}
		}

		this.getMapping = function(){
			return this.mapping;
		}

		this.setMapping = function(mapping) {
			console.log("Setting mapping to " + _this.mapScheme + " " + mapping);
			_this.mapping = mapping;
			console.log(_this.getMapping());
		}


		var gamepadListeners = { };
		var listener_report_interval;

		var loopListeners = { };

		this.addGamepadListener = function(name, func) {
			gamepadListeners[name] = func;
		}

		this.removeGamepadListener = function(name) {
			this.addGamepadListener(name, null);
		}


		this.addLoopListener = function(name, func) {
			loopListeners[name] = func;
		}

		this.removeLoopListener = function(name) {
			this.addLoopListener(name, null);
		}

		function report_gamepad(){
			Object.keys(gamepadListeners).forEach(function (key) { 
			    var func = gamepadListeners[key];
		    	func(this.gamepad);
			});
		}

		this.MAPPING_NAMES = [
			{ 
				buttons: ["A","B","X","Y","LB","RB","LT","RT","SELECT","START","LEFT_STICK","RIGHT_STICK", "UP","DOWN","LEFT","RIGHT","HOME"],
				axes: ["LEFT_STICK_HORIZONTAL", "LEFT_STICK_VERTICAL", "RIGHT_STICK_HORIZONTAL", "RIGHT_STICK_VERTICAL"]
			},
			{
				buttons: ["A","B","X","Y","LB","RB","SELECT","START","HOME","LEFT_STICK","RIGHT_STICK"],
				axes: ["LEFT_STICK_HORIZONTAL", "LEFT_STICK_VERTICAL",
						"LEFT_TRIGGER", "RIGHT_STICK_HORIZONTAL", "RIGHT_STICK_VERTICAL", "RIGHT_TRIGGER", "D-PAD_HORIZONTAL", "D-PAD_VERTICAL"]
			}
		];

		this.MAPPINGS = { };

		var MAPPING_NAMES = this.MAPPING_NAMES;
		var MAPPINGS = this.MAPPINGS;
		//console.log("MAPPINGS DEFINED");
		//console.log("Mapping #1: " + this.MAPPING_NAMES[1]);
		/*
		this.MAPPING_NAMES[0] = { //playstation/standard
				buttons: [],
				axes: []
			};

		this.MAPPING_NAMES[1] = {
			//XBox
				buttons: ['A','B','X','Y','LB','RB','SELECT','START','HOME','LEFT_STICK','RIGHT_STICK'],
				axes: ['LEFT_STICK_HORIZONTAL', 'LEFT_STICK_VERTICAL',
				'LEFT_TRIGGER', 'RIGHT_STICK_HORIZONTAL', 'RIGHT_STICK_VERTICAL', 'D-PAD_HORIZONTAL', 'D-PAD_VERTICAL']
			
		};
		*/
			

		

		function report_listeners() {
			/*
			if (this.debug==1 && this.gamepad!=null) {
				for(var i=0;i<this.gamepad.buttons.length;i++) {
					if (this.gamepad.buttons[i].pressed) {
						//console.log("Button " + (i + 1) + " pressed");	
					}
				}

				
				for(var i=0;i<gp.axes.length; i+=2) {

					html+= "Stick "+(Math.ceil(i/2)+1)+": "+gp.axes[i]+","+gp.axes[i+1]+"<br/>";
				}
				

			}
			*/

			if (_this.gamepad) {



				Object.keys(loopListeners).forEach(function (key) { 
				    var func = loopListeners[key];
			    	func(_this.gamepad);
				});




				var mapNames = MAPPING_NAMES[_this.mapScheme];
				if (mapNames) {
					var map = MAPPINGS[_this.mapScheme];

					for (var j in mapNames.buttons) {
						var controlName = mapNames.buttons[j];
						var control = map.buttons[controlName];

						// chrome hotfix test
						var gamepad = navigator.getGamepads()[0];
						control.updateListeners(gamepad.buttons[j].value);

						//control.updateListeners(_this.gamepad.buttons[j].value);

						//console.log("Updated button " + controlName + "to " + control.value);
					};
					for (var j in mapNames.axes) {
						var controlName = mapNames.axes[j];
						var control = map.axes[controlName];

						//chrome hotfix test
						var gamepad = navigator.getGamepads()[0];
						control.updateListeners(gamepad.axes[j]);

						//control.updateListeners(_this.gamepad.axes[j]);
						//console.log("Updated axis " + controlName + "to " + control.value);
					};
				}
			}
		}

		function checkGamepadMapping(gamepad) {
			var numButtons = gamepad.buttons.length;
			var numAxes = gamepad.axes.length;
			var hasStandard = gamepad.mapping == "standard";
			if (hasStandard || ((numButtons == 16 || numButtons == 17) && numAxes == 4)) {
				console.log("Gamepad has standard mapping");
				return 0;
			}


			var hasNumButtons = numButtons == 11;
			var hasNumAxes = numAxes == 8;
			var hasXBox = gamepad.id.toLowerCase().includes("xbox one");

			// duck-typing an xbox controller
			if (hasNumButtons && hasNumAxes) {
				if (!hasXBox) {
					console.log("WARNING: controller has correct number " +
							"of buttons and axes to be an XBox One controller, but "+
							"is not labeled as such. It will still be treated as one but expect bugs.");						
				} else {
					console.log("Gamepad has XBox One mapping");
				}
				return 1;
			}
			return 0;
		}


		function ButtonListener(name, func, repeatValues){
			this.name = name;
			this.func = func;
			this.repeatValues = !(!repeatValues);
		}


		function ControlMapping(name) {	
			this.name = name;
			this.value = 0;

			var control_listeners = [ ];
			this.addListener = function(name, func, repeatValues) {
				var listener = new ButtonListener(name, func, repeatValues);
				//control_listeners[name] = func;
				control_listeners.push(listener);
			};
			this.removeListener = function(name) {
				for (var i in control_listeners) {
					if (control_listeners[i].name == name) {
						control_listeners.splice(i, 1);
						break;
					}
				}
			};
			this.updateListeners = function(value) {
					for (var key in control_listeners) {
						if (control_listeners[key]) {
							if (this.value != value || control_listeners[key].repeatValues) {
								control_listeners[key].func(value, this.name);
							}
						}
					}
				this.value = value;
			};
		};

		function buildMappings(){
			//console.log("Building mappings!");
			Object.keys(MAPPING_NAMES).forEach(function (i) { 
				//console.log("Building map for " + i);
				var map = {buttons: { }, axes: { }};

				for (var j in MAPPING_NAMES[i].buttons) {
					var name = MAPPING_NAMES[i].buttons[j];
					//console.log("Building button " + name + " for " + i);
					map.buttons[name] = new ControlMapping(name);
				}
				for (var j in MAPPING_NAMES[i].axes) {
					var name = MAPPING_NAMES[i].axes[j];
					//console.log("Building axis " + name + " for " + i);
					map.axes[name] = new ControlMapping(name);
				}

				MAPPINGS[i] = map;
			});
			//console.log("Mappings built!");
		}

		buildMappings();

		function connectGamepad(gamepad) {
			console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
					gamepad.index, gamepad.id,
					gamepad.buttons.length, gamepad.axes.length);
			_this.mapScheme = checkGamepadMapping(gamepad);
			_this.setMapping(MAPPINGS[_this.mapScheme]);
			_this.gamepadConnected = true;
			_this.gamepad = gamepad;
			report_gamepad();
			listener_report_interval = window.setInterval(report_listeners, 70);
			window.clearInterval(chrome_gamepad_listener_interval);
		}

		window.addEventListener("gamepadconnected", function(e) {
			connectGamepad(e.gamepad);
		});


		var chrome_gamepad_listener_interval;

		function setupChromeListener(){
            chrome_gamepad_listener_interval = window.setInterval(function() {
                if(navigator.getGamepads()[0]) {
                    if(!_this.gamepadConnected) {
                    	console.log("Chrome connecting!");
                    	connectGamepad(navigator.getGamepads()[0]);
                    } 
                }
            }, 500);				
		}
		

		function disconnectGamepad(){
			_this.gamepadConnected = false;
			_this.gamepad = null;
            window.clearInterval(listener_report_interval);

            //setup an interval for Chrome
            window.clearInterval(chrome_gamepad_listener_interval);
			setupChromeListener();

			report_gamepad();
		}


		window.addEventListener("gamepaddisconnected", function(e) {
			console.log("Gamepad disconnected from index %d: %s",
					e.gamepad.index, e.gamepad.id);
			disconnectGamepad();
		});


        //setup an interval for Chrome

        setupChromeListener();
		
	}
}