var score = 0;
var level = 1;
var difficulty = 500;
var lines = 0;
var gameState = 0;
var currBlockId = 0;
var currBlock = 0;
var rotAngle = 0;
var posX = 0;
var posY = 0;
var arrX = 0;
var arrY = 9;
var ex = [];
var inter;
var time = 100;
var iterat;

function elem(head, sock, id, left, up, right, down) {
    this.id = id;
    this.sockets = sock;
    this.left = left;
    this.right = right;
    this.up = up;
    this.down = down;
    this.head = head;
    this.rot = function () {
        var tmp = this.up;
        this.up = this.left;
        this.left = this.down;
        this.down = this.right;
        this.right = tmp;
    };
}

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
    currBlock = 0;
    currBlockId = 0;
    rotAngle = 0;
    posX = 0;
    posY = 0;
    arrX = 0;
    arrY = 9;
    /* refresh array */
    for(var i=0; i<80; i++) ex[i]=null;
    clearInterval(inter);
    gameState = 1; /* we can create new block */

  /*  handle keys event */
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
                currBlock.rot();
                break;
            case 83: /* S */
                while(canMove("down")){
                    posY +=30;
                    arrY --;
                }
                /* this cell if full */
                setStatus(arrX, arrY, currBlock);
               /* our block has bottomed
                * check MAX line to define end of gamege
                * and change gameStatus */
                lines = getMaxLine();
                gameState = 3;
                break;
        }
    });

    /* create game loop with id=inter */
    inter = setInterval(update,time);
}


/* update function AND, if it possible, create new block */
function update(){
    iterat++;
    $("#score").html("left: "+currBlock.left);
    $("#level").html("up: "+currBlock.up);
    $("#line").html("right: "+currBlock.right);
    $("#cube").html("down: "+currBlock.down);
    if(lines>7) {
        /* stop game loop*/
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
                    setStatus(arrX, arrY, currBlock);
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
            /* find connection and definded bomb */
            doChain();
            gameState = 1;
        }

    }
}


/* create and append new random block */
function createBlock(){
    /* create new img block */
    var block = document.createElement("img");
    $(block).attr("class","block");
    $(block).uniqueId();
    currBlockId = $(block).prop('id');
    /* calc random index of next element in [1..6] */
    var i = Math.floor(Math.random()*6) + 1;
    var imgSrc="images/" + i + ".png";
    $(block).attr("src",imgSrc);
    $(block).appendTo("#cont");
    $(block).css("left", posX);
    $(block).css("top", posY);
    /* block1 = {sockets: 2, left: 0, up: 1, right: 0, down: 1 };
     block2 = {sockets: 1, left: 0, up: 1, right: 0, down: 0 };
     block3 = {sockets: 4, left: 1, up: 1, right: 1, down: 1 };
     block4 = {sockets: 2, left: 1, up: 1, right: 0, down: 0 };
     block5 = {sockets: 3, left: 1, up: 1, right: 0, down: 1 };
     block6 = {sockets: 0, left: 0, up: 0, right: 0, down: 0 }; */
    switch (i){
        case 1:
            currBlock = new elem(this, 2, currBlockId, 0, 1, 0, 1);
            break;
        case 2:
            currBlock = new elem(this, 1, currBlockId, 0, 1, 0, 0);
            break;
        case 3:
            currBlock = new elem(this, 4, currBlockId, 1, 1, 1, 1);
            break;
        case 4:
            currBlock = new elem(this, 2, currBlockId, 1, 1, 0, 0);
            break;
        case 5:
            currBlock = new elem(this, 3, currBlockId, 1, 1, 0, 1);
            break;
        case 6:
            currBlock = new elem(this, 0, currBlockId, 0, 0, 0, 0);
            break;
    }
    gameState = 2; /* the block movement */
}

function doChain(){
    if(isBomb(currBlock)) {
        delBomb();
        /* if not lie on bottom */
        if( (arrY-1) > 0)
        delChain(ex[8*(arrY-1)+arrX].head);
    } else {
        /* TODO create chain */
    }
}
/* return TRUE if there is connection between current element of ex array and around elements */
function isConnect(){
    // this is a BOMB
    if(currBlock.sockets == 0) {
        if(arrY-1 > 9 || (arrY-1) < 0) delBomb();
        if(typeof ex[8*y+x] == 'undefined' || ex[8*y+x] == 0) return true;
        return false;
        delChain(currBlock);
    }
}
function isBomb(el){
    return el.sockets == 0;
}

/* remove html element and "ex" array element*/
function delBomb(){
    /* TODO animation*/
    $("#"+currBlockId).hide("explode",{pieces:32},200);
    $("#myaudio")[0].play();
    $("#"+currBlockId).remove();
    ex[8*arrY+arrX] = null;
}

/* remove html elements and 'ex' array elements from thead*/
function delChain(thead){

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
    if((typeof ex[8*y+x] == 'undefined') || (ex[8*y+x] == null)) return true;
    return false;
}

function setStatus(x, y, box){
    ex[8*y+x] = box;
}

/* return TRUE when line is ocupated*/
function getLineStatus(l){
    for(var i=0; i<7; i++)
        if((ex[8*l+i] != null) && (typeof ex[8*l+i] != 'undefined')) return true;
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

/* if block CAN move to 'direction' it will return TRUE*/
function canMove(direction){
    switch(direction) {
        case "right": return getStatus(arrX+1, arrY);
        case "left": return getStatus(arrX-1, arrY);
        case "down": return getStatus(arrX, arrY-1);
    }

}