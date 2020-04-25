function Game(gameID){
	this.id = gameID;
	this.fullHouse = null;
	this.topRow = null;
	this.middleRow = null;
	this.bottomRow = null;
	this.firstFive = null;
};

Game.prototype.setFullHouse = function(id){
	this.fullHouse = id;
};

Game.prototype.getFullHouse = function(){
	return this.fullHouse;
};

Game.prototype.setTopRow = function(id){
	this.topRow = id;
};

Game.prototype.getTopRow= function(){
	return this.topRow;
};

Game.prototype.setMiddleRow = function(id){
	this.middleRow = id;
};

Game.prototype.getMiddleRow= function(){
	return this.middleRow;
};

Game.prototype.setBottomRow = function(id){
	this.bottomRow = id;
};

Game.prototype.getBottomRow= function(){
	return this.bottomRow;
};

Game.prototype.setFirstFive = function(id){
	this.firstFive = id;
};

Game.prototype.getFirstFive = function(){
	return this.firstFive;
};


module.exports = Game;
