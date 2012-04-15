/** 
* @author Sebastian Romero bipsa
* @version 1.0
* @class Arkanoid, clase especifica para el juego 
* @created April 14th 2012
* @how var game = new Arkanoid();
**/
var Arkanoid = function(board, params){


	/**
	* @internal 
	**/
	var canvas = document.querySelector("#game"),
		context = canvas.getContext("2d"),
		padding = 2,
		paddle,
		ball,
		blocks = [],
		paddleWidth,
		ballRadius,
		gameState = "playing",
		direction = "bottom",
		forceX = 0,
		forceY = params.force;


	/**
	* @constants
	**/
	var	GRID_COLUMNS = 13,
		GRID_ROWS = 23,
		NUMBER_OF_ROWS = 2;



	/**
	* @public
	* se setea la fuerza de la bola
	**/
	var setForce = function(value){
		params.force = value;
	};


	/**
	* @public
	* reinicia la bola en su punto original
	**/
	var start = function(){
		forceX = 0,
		forceY = params.force;
		gameState = "playing";
		ball.setX((canvas.width/2)-ballRadius);
		ball.setY(((canvas.height/2)-ballRadius) + 20);
	};


	/**
	* @public
	* carga un nuevo nivel
	**/
	var loadLevel = function(level){
		padding = 2;
		paddle;
		ball;
		blocks = [];
		paddleWidth;
		ballRadius;
		gameState = "playing";
		direction = "bottom";
		forceX = 0;
		forceY = params.force;
		board = level;
		createBlocks();
		createPaddle();
		createBall();
	};


	/**
	* @private
	* Este evento se ejecuta en el momento en que la bola cae completamente
	**/
	var onBallDropped = function(){
		gameState = "stopped";
		if(params.onFail)
			params.onFail();
	}


	/**
	* @private
	* Este metodo se llama cuando no quedan mas bloques
	**/
	var callVictory = function(){
		gameState = "victory";
		if(params.onVictory)
			params.onVictory();
	};


	/**
	* @private 
	* Pinta todos los elementos en el canvas con sus estados
	**/
	var render = function(){
		var i = 0, 
			blocksCount = 0;
		if(gameState === "victory" || blocks.length == 0)
			return;
		forceY = (direction === "bottom")?params.force:params.force*-1;
		for (; i<blocks.length; i++){
			if(blocks[i].getForce()>0){
				blocks[i].draw();
				blocksCount = blocksCount + 1;
			}
		}
		paddle.draw();
		if(gameState !== "stopped"){
			if(ball.hitTest(paddle)){
				direction = "top";
				forceX =  ((ball.getX() - (paddle.getX() + (paddle.getWidth() / 2))))/4;
			}
			for (i=0; i<blocks.length; i++){
				if(blocks[i].getForce()>0)
					if(ball.hitTest(blocks[i])){
						direction = "bottom";
						blocks[i].hitted();
						if(blocks[i].getForce()<=0)
							if(params.onBlockDestroyed)
								params.onBlockDestroyed();
					}
			}
			if(ball.getY() < 0)
				direction = "bottom";

			if((ball.getX()<0) || (ball.getX()>(canvas.width - ballRadius)))
				forceX = forceX*-1;
			ball.move(forceX, forceY);
		}
		if(blocksCount == 0){
			blocks = [];
			callVictory();
		}
	};


	/**
	* @private
	* Limpia todo el canvas
	**/
	var clear = function(){
		context.clearRect( 0, 0, canvas.width, canvas.height);
	};


	/**
	* @private
	* Crea la bola del juego
	**/
	var createBall = function(){
		ball = new Ball(context, (canvas.width/2)-ballRadius, 
						((canvas.height/2)-ballRadius) + 20, ballRadius,
						canvas, onBallDropped);
	}


	/**
	* @private
	* Crea el paddle del juego
	**/
	var createPaddle = function(){
		paddleWidth = (Math.round(canvas.width/GRID_COLUMNS) - padding) * 2;
		ballRadius = (Math.round(canvas.width/GRID_COLUMNS) - padding) / 4;
		paddle = new Paddle(context, (canvas.width - paddleWidth)/2, canvas.height - Math.round((canvas.height/GRID_ROWS) + padding), 
							paddleWidth, 
							Math.round(canvas.height/GRID_ROWS) - padding);
	}


	/**
	* @private
	* Crea los bloques del juego
	**/
	var createBlocks = function(){
		var i = 0,
			u = 0,
			block;
		var createBlock = function(type){
			block = new Block(context, Math.round(u*(canvas.width/GRID_COLUMNS)) + padding, 
							Math.round(i*(canvas.height/GRID_ROWS)) + padding,
							Math.round(canvas.width/GRID_COLUMNS) - padding, 
							Math.round(canvas.height/GRID_ROWS) - padding,
							type, params.onBlockDestroyed);
			block.setName = "block_" + i + "_" + u;
			blocks.push(block);
		};
		if(board)
			for(; i<board.length; i++)
				for(u=0; u<board[i].length; u++){
					if(board[i][u] === "A"){
						createBlock(BlocksTypes.WEAK_BLOCK);
					} else if (board[i][u] === "B") {
						createBlock(BlocksTypes.SIMPLE_BLOCK);
					} else if (board[i][u] === "C"){
						createBlock(BlocksTypes.STRONG_BLOCK);
					}
				}
		else 
			for(; i<NUMBER_OF_ROWS; i++)
				for(u=0; u<GRID_COLUMNS; u++){
					block = new Block(context, Math.round(u*(canvas.width/GRID_COLUMNS)) + padding, 
								Math.round(i*(canvas.height/GRID_ROWS)) + padding,
								Math.round(canvas.width/GRID_COLUMNS) - padding, 
								Math.round(canvas.height/GRID_ROWS) - padding,
								BlocksTypes.WEAK_BLOCK, params.onBlockDestroyed);
					block.setName = "block_" + i + "_" + u;
					blocks.push(block);
				}
	};

	/**
	* @private canvas loop
	**/
	var loop = function(){
		clear();
		render();
		requestAnimationFrame(loop);
	};


	/**
	* @private
	* Adiciona los eventos al juego
	**/
	var addEventsToGame = function(){
		canvas.addEventListener("mousemove", function(event){
			var offsetX = canvas.offsetLeft,
				mouseX = event.pageX - offsetX;
			if(paddle.setX){
				if(mouseX + paddleWidth > canvas.width)
					mouseX = mouseX - Math.round(paddleWidth);
				else
					mouseX = mouseX - Math.round(paddleWidth/2);
					if(mouseX<0)
						mouseX = 0;
				paddle.setX(mouseX);
			}
		}, false);
	};

	/**
	* @constructor
	**/
	var initialize = function(){
		addEventsToGame();
		createBlocks();
		createPaddle();
		createBall();
		loop();
	}();

	return{
		"start" : start,
		"clear" : clear,
		"loadLevel" : loadLevel,
		"setForce" : setForce
	};
};


/**
* @author Sebastian Romero bipsa
* @class entity Paddle 
**/
var Paddle = function(ctx, x, y, width, height){


	var draw = function(){
		ctx.fillStyle = "rgba(255, 100, 0, 1)";
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.closePath();
		ctx.fill();
	};


	/**
	* @public
	* cambia el valor de x
	**/
	var setX = function(value){
		x = value;
	};


	var getX = function(){
		return x;
	};


	var getY = function(){
		return y;
	};


	var getWidth = function(){
		return width;
	};


	var getHeight = function(){
		return height;
	};

	/**
	*
	**/
	var initialize = function(){
		draw();
	}();

	return{
		"draw" : draw,
		"setX" : setX,
		"getX" : getX,
		"getY" : getY,
		"getWidth" : getWidth,
		"getHeight" : getHeight
	};
};

/**
* @static
* Tipos de bloques que van a existir en el juego
**/
var BlocksTypes = {
	"WEAK_BLOCK" : "weak_block",
	"SIMPLE_BLOCK" : "simple_block",
	"STRONG_BLOCK" : "strong_block",
	"INDESTRUCTIBLE_BLOCK" : "indestructible_block"
};


/**
* @author Sebastian Romero bipsa
* @class entity Block 
**/
var Block = function(ctx, x, y, width, height, type, onBlockDestroyed){

	var name,
		force;

	var draw = function(){
		if(force > 0){
			switch(type){
				case BlocksTypes.WEAK_BLOCK:
					ctx.fillStyle = "rgba(255, 255, 0, 1)";
				break;
				case BlocksTypes.SIMPLE_BLOCK:
					ctx.fillStyle = "rgba(0, 255, 255, 1)";
				break;
				case BlocksTypes.STRONG_BLOCK:
					ctx.fillStyle = "rgba(33, 255, 33, 1)";
				break;
			}
			ctx.beginPath();
			ctx.rect(x, y, width, height);
			ctx.closePath();
			ctx.fill();
		} else if(force <= 0){
			x = y = width = height = -1;
			if(onBlockDestroyed)
				onBlockDestroyed();
		}
	};


	var setName = function(value){
		name = value;
	};


	var getRectangle = function(){
		return {
			"x" : x,
			"y" : y,
			"width" : width,
			"height" : height
		};
	};

	var getX = function(){
		return x;
	};


	var getY = function(){
		return y;
	};


	var getWidth = function(){
		return width;
	};


	var getForce = function(){
		return force;
	};


	var getHeight = function(){
		return height;
	};

	/**
	*
	**/
	var hitted = function(){
		force = force-1;
	};

	/**
	*
	**/
	var initialize = function(){
		draw();
		switch(type){
			case BlocksTypes.WEAK_BLOCK:
				force = 1;
			break;
			case BlocksTypes.SIMPLE_BLOCK:
				force = 5;
			break;
			case BlocksTypes.STRONG_BLOCK:
				force = 8;
			break;
		}
	}();

	return{
		"setName" : setName,
		"getRectangle" : getRectangle,
		"draw" : draw,
		"getX" : getX,
		"getY" : getY,
		"getWidth" : getWidth,
		"getHeight" : getHeight,
		"hitted" : hitted,
		"getForce" : getForce
	};
};



/**
* @author Sebastian Romero bipsa
* @class entity Ball 
**/
var Ball = function(ctx, x, y, radius, bounds, onBallDropped){

	var draw = function(){
		ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
	};


	var move = function(valX, valY){
		x = x+valX;
		y = y+valY;
		if(y > bounds.height + radius){
			y = bounds.height + radius;
			if(onBallDropped)
				onBallDropped();
		}
		draw();
	};

	/**
	* @public 
	* evalua si hay una colision con el objecto referenciado
	* TODO: Esta parte se puede mejorar mucho mas
	* @param element {Game Entity}
	**/
	var hitTest = function(element){
		var distance = 0;	
		if (x < element.getX()) {
			distance += Math.pow(x - element.getX(), 2);
		} else if (x > element.getX() + element.getWidth()) {
			distance += Math.pow(x - element.getX() - element.getWidth(), 2);
		}	
		if (y < element.getY()) {
			distance += Math.pow(y - element.getY(), 2);
		} else if (y > element.getY() + element.getHeight()) {
			distance += Math.pow(y - element.getY() - element.getHeight(), 2);
		}
		return distance <= Math.pow(radius, 2);
	};


	var getX = function(){
		return x;
	};


	var getY = function(){
		return y;
	};


	var setX = function(value){
		x = value;
	};


	var setY = function(value){
		y = value;
	};


	/**
	*
	**/
	var initialize = function(){
		draw();
	}();

	return{
		"draw" : draw,
		"move" : move,
		"hitTest" : hitTest,
		"getX" : getX,
		"getY" : getY,
		"setX" : setX,
		"setY" : setY
	};
};


window.requestAnimationFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();



var GetJSON = function(uri, onComplete){
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(){
		if(request.readyState==4 && request.status==200){
			if(onComplete)
				onComplete(eval("(" + request.responseText + ")"));
		}
	};
	request.open("GET",uri, false);
	request.send();
};



/**
*
*/
window.addEventListener("load", function(){
	var game;
	GetJSON("levels/level0.json", function(json){
		game = new Arkanoid(json.level.board, {
			"force" : 2,
			"onVictory":function(){
				game.clear();
				GetJSON("levels/level1.json", function(json){
					game.loadLevel(json.level.board);
				});
			}, 
			"onFail":function(){
				var change = parseInt(document.querySelector("#changes").innerHTML) - 1;
				if(change > -1){
					document.querySelector("#changes").innerHTML = change;
					game.start();
				}

			}, 
			"onBlockDestroyed":function(type){
				var score = parseInt(document.querySelector("#score").innerHTML) + 20;
				document.querySelector("#score").innerHTML = score;
			}
		});
	});
});