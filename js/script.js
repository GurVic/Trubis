var score = 0;
var level = 1;
var difficulty = 1000;
var lines = 0;
var gameState = 0;
var currBlockId = 0;
var rotAngle = 0;
var posX = 0;
var posY = 0;
var arrX = 0;
var arrY = 9;
var ex = new Array(80);
var inter;
var time = 100;
var iterat;

$(document).ready(function(){
    $("#score").fadeOut();
    $("#level").fadeOut();

    $("#play").click(function() {
        $("#score").fadeIn().html(score);
        $("#level").fadeIn().html(level);
        $("#cont").html("");
        newGame();
    });

    $("#help").click(function(){
        $("#cont").html("<h1>Simple game Trubis</h1><p>Move left - A</p><p>Move right - D</p><p>Rotate - W</p><p>Drop - S</p>");
    });
    $("#config").click(function(){
    });
});

/* start GAME from the beginning */
function newGame(){
    iterat = 0;
    score = 0;
    level = 1;
    lines = 1;
    currBlockId = 0;
    rotAngle = 0;
    posX = 0;
    posY = 0;
    arrX = 0;
    arrY = 9;
    for(var i=0; i<80; i++) ex[i]=0;
    clearInterval(inter);
    gameState = 1; /* we can create new block */

  /*  update(); */
    $(document).keydown(function(e) {
        e = e || window.event;
        score = e.keyCode;
        switch(e.keyCode){
            case 65: /* A */
                if (canMove("left")){
                    posX -= 30;
                    arrX --;
                }
                break;
            case 68: /* D */
                if(canMove("right")){
                    posX += 30;
                    arrX ++;
                }
                break;
            case 87: /* W */
                rotAngle += 90;
                $("#" + currBlockId).rotate(rotAngle);
                break;
            case 83: /* S */
                while(canMove("down")){
                    posY +=30;
                    arrY --;
                }
                /* this cell if full */
                setStatus(arrX, arrY, 1);
               /* our block has bottomed
                * check MAX line to define end of gamege
                * and change gameStatus */
                lines = getMaxLine();
                gameState = 3;
                break;
        }
      /*  update(); */
    });

    inter = setInterval(update,time);
}


/* update function AND, if it possible, create new block */
function update(){
    iterat++;
    $("#score").html(posX);
    $("#level").html(posY);
    $("#line").html(currBlockId);
    if(lines>7) {
        clearInterval(inter);
        $("#" + currBlockId).css("left", posX);
        $("#" + currBlockId).css("top", posY);
        gameoverScreen();
    }
    else {
        if (gameState == 1) {
            posX = 0;
            posY = 0;
            arrX = 0;
            arrY = 9;
            createBlock();
        } else
        if (gameState == 2){
            if(iterat >= difficulty/time){
                if(canMove("down")){
                    posY +=30;
                    arrY --;
                } else {
                    setStatus(arrX, arrY, 1);
                    lines = getMaxLine();
                    gameState = 3;
                }
                iterat = 0;
            }
            $("#" + currBlockId).css("left", posX);
            $("#" + currBlockId).css("top", posY);
        } else
        if (gameState == 3){
            $("#" + currBlockId).css("left", posX);
            $("#" + currBlockId).css("top", posY);
            posX = 0;
            posY = 0;
            arrX = 0;
            arrY = 9;
            gameState = 1;
           /* createBlock();*/
        }

    }
}


/* create and append new random block */
function createBlock(){
    /* create new img block */
    var block = document.createElement("img");
    $(block).attr("class","block");
    $(block).uniqueId();
  /*  var tId = "block" + Math.floor(Math.random()*30000);
    $(block).attr("id", tId); */
    currBlockId = $(block).prop('id');
    var i = Math.floor(Math.random()*6) + 1; /* calc random index of next element in [1..6] */
    var imgSrc="images/" + i + ".png";
    $(block).attr("src",imgSrc);
    $(block).appendTo("#cont");
    $(block).css("left", posX);
    $(block).css("top", posY);

    gameState = 2; /* the block movement */
}

/* append GAMEOVER screen*/
function gameoverScreen(){
    var gameover = document.createElement("div");
    $(gameover).attr("class", "gameoverscreen");
    $(gameover).attr("id", "gameoverscreen");
    $(gameover).html("<h2>Game Over</h2><p class='counter'>"+score+"</p><h2>Retry?</h2>");
    $(gameover).css("cursor", "pointer");

    $(gameover).click(function() {
        location.reload(true);
    });
    $(gameover).prependTo("#cont");
}

/* return TRUE when array cell is empty and we can move block in it*/
function getStatus(x, y){
    if(x > 7 || x < 0 || y > 9 || y < 0) return false;
    if(typeof ex[8*y+x] == 'undefined' || ex[8*y+x] == 0) return true;
    return false;
}

function setStatus(x, y, bo){
    ex[8*y+x] = bo;
}

/* return TRUE when line is ocupated*/
function getLineStatus(l){
    for(var i=0; i<7; i++)
        if(ex[8*l+i] == 1) return true;
    return false;
}

/* return MAX num of top line*/
function getMaxLine(){
    for(var i=8; i>=0; i--){
        var b = getLineStatus(i);
        if(b == true) return i;
    }
    return 0;
}
function canMove(direction){
    switch(direction) {
        case "right": return getStatus(arrX+1, arrY);
        case "left": return getStatus(arrX-1, arrY);
        case "down": return getStatus(arrX, arrY-1);
    }

}