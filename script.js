window.onload = function(){
	var canvasWidth = 860;
	var canvasHeight = 340;
	var blockSize = 10;
	var ctx;
	var speed = 200;
	var delay = speed;
	var Solid;
	var Golden;
	var widthInBlock = canvasWidth/blockSize;
	var heightInBlock = canvasHeight/blockSize;
	var score;
	var Xcenter = canvasWidth/2;
	var Ycenter = canvasHeight/2;
	var timeOut;

	init();

	function init(){
		var canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "2.5px dashed #2C3E50";
		canvas.style.margin = "auto";
		canvas.style.display = "block";
		canvas.style.backgroundColor = "#F9BF3B";
		document.body.appendChild(canvas);
		ctx = canvas.getContext('2d');
		Solid = new Snake([[7,3], [6,3], [5,3], [4,3], [3,3], [2,3], [1,3], [0,3]], "right");
		Golden = new Apple([10,10]);
		score = 0;
		refreshCanvas();
	}

	function refreshCanvas(){
		Solid.forward();
		if (Solid.checkCollision()){
			gameOver();
		}else{
			if(Solid.isEatingApple(Golden)){
				score++;
				if(delay>10){
				delay -= 2.5;
				}
				Solid.ateApple = true;
				do{
					Golden.setNewPosition();
				}
				while(Golden.isOnSnake(Solid))
			}
			ctx.clearRect(0,0, canvasWidth, canvasHeight);
			drawScore();
			Golden.draw();
			Solid.draw();
			timeOut = setTimeout(refreshCanvas,delay);
		}
	}

	function gameOver(){
		ctx.save();
		ctx.font = "bold 50px sans-serif";
		ctx.fillStyle = "#96281B";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "#E4F1FE";
		ctx.lineWidth = 4;
		ctx.strokeText("Game Over", Xcenter, Ycenter-100);
		ctx.fillText("Game Over", Xcenter, Ycenter-100);
		ctx.strokeText("Espace = Rejouer", Xcenter, Ycenter+100);
		ctx.fillText("Espace = Rejouer", Xcenter, Ycenter+100);
		ctx.restore();
	}

	function restart(){
		Solid = new Snake([[7,3], [6,3], [5,3], [4,3], [3,3], [2,3], [1,3], [0,3]], "right");
		Golden = new Apple([10,10]);
		score = 0;
		delay = speed;
		clearTimeout(timeOut);
		refreshCanvas();
	}

	function drawScore(){
		ctx.save();
		ctx.font = "bold 50px sans-serif";
		ctx.fillStyle = "#D35400";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "#E4F1FE";
		ctx.lineWidth = 2;
		ctx.strokeText(score.toString(), Xcenter, Ycenter);
		ctx.fillText(score.toString(), Xcenter, Ycenter);
		ctx.restore();
	}

	function drawBlock(ctx, position){
		var x = position[0] * blockSize;
		var y = position[1] * blockSize;
		ctx.fillRect(x, y, blockSize, blockSize);
	}

	function Snake(body, direction){
		this.body = body;
		this.direction = direction;
		this.ateApple = false;
		this.draw = function(){
			ctx.save();
			ctx.fillStyle = "#26A65B";
			for(var i = 0; i < this.body.length; i++){
					drawBlock(ctx, this.body[i]);
				}
			ctx.restore();
		};
		this.forward = function(){
			var nextPosition = this.body[0].slice();
			switch(this.direction){
				case "left" : nextPosition[0]--;
				break;
				case "right" : nextPosition[0]++;
				break;
				case "down" : nextPosition[1] ++;
				break;
				case "up" : nextPosition[1] --;
				break;
				default : throw("Invalid Direction");
			}
			this.body.unshift(nextPosition);
			if(!this.ateApple)
			this.body.pop();
			else
			this.ateApple = false;
		};
		this.setDirection = function(newDirection){
			var allowedDirection;
			switch(this.direction){
				case "left" :
				case "right" : allowedDirection =["up", "down"]
				break;
				case "down" :
				case "up" : allowedDirection =["left", "right"]
				break;
				default : throw("Invalid Direction");
			}
			if(allowedDirection.indexOf(newDirection) > -1){
				this.direction = newDirection;
			}
		};
		this.checkCollision = function(){
			var wallCollision = false;
			var selfCollision = false;
			var head = this.body[0];
			var rest = this.body.slice(1);
			var snakeX = head[0];
			var snakeY = head[1];
			var Xmin = 0;
			var Ymin = 0;
			var Xmax = widthInBlock - 1;
			var Ymax = heightInBlock -1;
			var isNotBetweenHorizontalWalls = snakeX < Xmin || snakeX > Xmax;
			var isNotBetweenVerticalWalls = snakeY < Ymin || snakeY > Ymax;
			if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls){
				wallCollision = true;
			}
			for(var i = 0; i < rest.length; i++){
				if(snakeX === rest[i][0] && snakeY === rest[i][1]){
					selfCollision = true;
				}
			}
			return wallCollision || selfCollision;
		};
		this.isEatingApple = function(appleToEat){
			var head = this.body[0];
			if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
			return true;
			else
			return false;
		};
	}

	function Apple(position){
		this.position = position;
		this.draw = function(){
			ctx.save();
			ctx.fillStyle = "#F22613";
			ctx.beginPath();
			var radius = blockSize/2;
			var x = this.position[0]*blockSize+radius;
			var y = this.position[1]*blockSize+radius;
			ctx.arc(x,y,radius,0,Math.PI*2,true);
			ctx.fill();
			ctx.restore();
		};
		this.setNewPosition = function(){
			var newX = Math.round(Math.random() * (widthInBlock - 1));
			var newY = Math.round(Math.random() * (heightInBlock - 1));
			this.position = [newX, newY];
		};
		this.isOnSnake = function(snakeToCheck){
			var isOnSnake = false;
			for(var i = 0; i<snakeToCheck.body.length; i++){
				if(this.position[0]===snakeToCheck.body[i][0] && this.position[1]===snakeToCheck.body[i][1]){
					isOnSnake = true;
				}
			}
			return isOnSnake;
		};
	}

	document.onkeydown = function handleKeyDown(e){
		var key = e.keyCode;
		var newDirection;
		switch(key){
			case 37 : newDirection = "left";
			break;
			case 38 : newDirection = "up";
			break;
			case 39 : newDirection = "right";
			break;
			case 40 : newDirection = "down";
			break;
			case 32: restart();
			return;
			default : return;
		}
		Solid.setDirection(newDirection);
	}
}
