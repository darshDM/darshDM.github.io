var cols = 50;
var rows = 50;
var grid = new Array(cols);

var openSet = [];
var closedSet = [];
var start;
var end;
var path = [];
var w,h;
var randomGen = true;

function mouseDragged(){
	obstacle(mouseX, mouseY);
}

function obstacle(i,j){
	var currX = parseInt(i / w + 1);
	var currY = parseInt(j / h + 1);
	//console.log(currX,currY);
	grid[currX][currY].wall = true;
	
	grid[currX][currY].show(0);
	
}

function removeFromArray(arr, elt){
	for(var i=arr.length-1;i>=0;i--){
		if(arr[i] == elt){
			arr.splice(i,1);
		}
	}
}

function heuristic(a,b){
	var d = dist(a.i,a.j,b.i,b.j)
	//var d = abs(a.i - b.i) + abs(a.j- b.j);
	return d;
}

function continoues(i,j){
	if(i < cols - 1){
		if(grid[i+1][j].wall == true){
			strokeWeight(w/2);
			stroke(0);
			line(i*w + w/2, j*h + h/2, (i+1) * w + w/2, (j)*h+h/2)
		}
	}
	if(j < rows - 1){
		if(grid[i][j+1].wall == true){
			strokeWeight(w/2);
			stroke(0);
			line(i*w + w/2, j*h + h/2, i * w + w/2, (j+1)*h+h/2)
		}
	}
	
}
function Spot(i,j){
	this.i = i;
	this.j = j;

	this.f=0;
	this.g=0;
	this.h=0;	
	this.previous = undefined;
	this.neighbours = [];
	this.wall = false;
	if(randomGen && random(1) < 0.1){
		this.wall = true;
	}

	this.addNeighbours = function(grid){
		var i = this.i;
		var j = this.j;
		if(i < cols-1){
			this.neighbours.push(grid[i+1][j]);
		}
		if(i > 0){
			this.neighbours.push(grid[i-1][j]);
		}
		if(j < rows-1){
			this.neighbours.push(grid[i][j+1]);
		}
		if(j > 0){
			this.neighbours.push(grid[i][j-1]);
		}

		
		// for diagonals


		// if(i > 0 && j > 0){
		// 	this.neighbours.push(grid[i-1][j-1]);	
		// }
		// if(i < cols -1 && j < rows - 1){
		// 	this.neighbours.push(grid[i+1][j+1]);	
		// }
		// if(i < cols-1 && j > 0){
		// 	this.neighbours.push(grid[i+1][j-1]);	
		// }
		// if(i > 0 && j < rows - 1){
		// 	this.neighbours.push(grid[i-1][j+1]);	
		// }

	}
	this.show = function(col){
		//console.log(col);
		noStroke();
		fill(col);
		if(this.wall){
			fill(color(100,100,100));
			noStroke();

			//for different UI style

			//ellipse(this.i * w + w/2, this.j * h + h/2, w/2,h/2);
			//continoues(this.i,this.j);
		}
		rect(this.i*w, this.j*h,w-1,h-1,2);
		
	}
}



function setup(){
	
	createCanvas(600,600);


	w = width / cols;
	h = height / rows;

	for(var i =0;i<cols;i++){
		grid[i] = new Array(rows);
	}

	for(var i =0;i<cols;i++){
		for(var j=0;j<rows;j++){
			grid[i][j] = new Spot(i,j);
		}
	}

	for(var i =0;i<cols;i++){
		for(var j=0;j<rows;j++){
			grid[i][j].addNeighbours(grid);
		}
	}	
	start = grid[0][0];
	end = grid[cols-1][rows-1];
	start.wall = false;
	end.wall = false;
	//openSet.push(start);


	pauseButton = createButton('Pause');
	pauseButton.position(620, 19);
	pauseButton.mousePressed(pause);

	playButton = createButton('play');
	playButton.position(680, 19);
	playButton.mousePressed(play);

	sel = createSelect();
  	sel.position(620, 45);
  	sel.option('random obstacle');
	sel.option('manual (drag mouse around)');
	sel.changed(obstacleGeneration);

	noLoop();

}

function obstacleGeneration(){
	console.log("called");
	var op = sel.value();
	if(op == "random obstacle"){
		randomGen = true;
		for(var i =0;i<cols;i++){
			for(var j=0;j<rows;j++){
				
				if(randomGen && random(1) < 0.1){
					grid[i][j].wall = true;
				}
				grid[i][j].show(color(230,230,230));
			}
		}
		grid[0][0].wall = false;
		grid[0][0].show(color(230,230,230));

		grid[cols-1][rows-1].wall = false;
		grid[cols-1][rows-1].show(color(230,230,230));
	}
	else{
		for(var i =0;i<cols;i++){
			for(var j=0;j<rows;j++){
				grid[i][j].wall = false;
				grid[i][j].show(color(230,230,230));
			}
		}
	}
}

function pause(){
	noLoop();
}
function play(){
	loop();
}


function draw(){
	if(openSet.length == 0){
		openSet.push(start)
	}
	if(openSet.length > 0){
		var winner = 0;
		for (var i =0;i<openSet.length;i++){
			if(openSet[i].f < openSet[winner].f){
				winner= i;
			}
		}
		var current = openSet[winner];
		if(openSet[winner] === end){
			noLoop();
			console.log("done");
		}
		removeFromArray(openSet,current);
		closedSet.push(current);

		var neighbours = current.neighbours;
		for(var i=0;i<neighbours.length;i++){
			var neighbour = neighbours[i];

			if(!closedSet.includes(neighbour) && !neighbour.wall){
				var tempG = current.g + 1;
				var newPath = false;
				if(openSet.includes(neighbour)){

					if(tempG < neighbour.g){
						neighbour.g = tempG;
						newPath = true;
					}
				}

				else{
					neighbour.g = tempG;
					newPath = true;
					openSet.push(neighbour);
				}	
				if(newPath){
					neighbour.h = heuristic(neighbour,end);
					neighbour.f = neighbour.g + neighbour.h;
					neighbour.previous = current;	
				}
				
			}
		}

	}	
	else{
		// ended , no solution
		console.log("no solution");
		
		noLoop();
		return ;	
	}
	background(255);
	for(var i =0;i<cols;i++){

		for(var j=0;j<rows;j++){

			grid[i][j].show(color(230,230,230));
		}
	}
	
	
	for(var i=0;i<closedSet.length;i++){
		closedSet[i].show(color(230, 126, 34));
	}
	for(var i=0;i<openSet.length;i++){
		openSet[i].show(color(241, 196, 15));
	}	

	path = [];	
	var temp = current;
	path.push(temp);
	while(temp.previous){
		path.push(temp.previous);
		temp = temp.previous;
	}
	
	noFill();
	stroke(192, 57, 43);
	strokeWeight(w/3);
	beginShape();
	for(var i=0;i<path.length;i++){
		vertex(path[i].i*w + w/2, path[i].j*h + h/2);
	}
	endShape();

}