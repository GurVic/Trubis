var score = 0;
var level = 1;
var difficulty = 800;
var lines = 0;
var gameState = 0;
var currBlockId = 0;
var currBlock = null;
var rotAngle = 0;
var posX = 0;
var posY = 0;
var arrX = 0;
var arrY = 9;
var ex = [];
var inter;
var time = 100;
var iterat;
var canUpdate = true;

var graph = {open: 0, data: null, next: null}; // open - open sockets in all chain; data - pointer to graphElem
var graphElem = {data: null, next: null}; // data - currBlock;
var graphPointer = 0; // number of unique chain
var newConnection = true; // flag for new currBlock

function elem(head, sock, id, left, up, right, down) {
    this.next = null;
    this.x = -1;
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

function keyHand(e){
    e = e || window.event;
    score = e.keyCode;
    switch(e.keyCode) {
        case 65: /* A */
            if (canMove("left")) {
                posX -= 30;
                arrX--;
            }
            break;
        case 68: /* D */
            if (canMove("right")) {
                posX += 30;
                arrX++;
            }
            break;
        case 87: /* W */
            rotAngle += 90;
            $("#" + currBlockId).rotate(rotAngle);
            currBlock.rot();
            break;
        case 83: /* S */
            while (canMove("down")) {
                posY += 30;
                arrY--;
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
}

/* start GAME from the beginning */
function newGame(){
    newConnection = true;
    graph.data = null;
    graph.next = null;
    graph.open = 0;
    graphElem.data = null;
    graphElem.next = null;
    graphPointer = 0;
    iterat = 0;
    score = 0;
    level = 1;
    lines = 1;
    currBlock = null;
    currBlockId = 0;
    rotAngle = 0;
    posX = 0;
    posY = 0;
    arrX = 0;
    arrY = 9;
    canUpdate = true;
    /* refresh array */
    for(var i=0; i<80; i++) ex[i]=null;
    clearInterval(inter);
    gameState = 1; /* we can create new block */

    /* this for non duplicate event handler, when press again 'Play' */
    $(document).off('keydown', keyHand);
    /*  handle keys event */
    $(document).on('keydown', keyHand);

    /* create game loop with id=inter */
    inter = setInterval(update,time);
}


/* update function AND, if it possible, create new block */
function update(){
    if(canUpdate) {
        iterat++;
        $("#score").html("left: " + currBlock.left);
        $("#level").html("up: " + currBlock.up);
        $("#line").html("right: " + currBlock.right);
        $("#cube").html("down: " + currBlock.down);
        if (lines > 7) {
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
            } else if (gameState == 2) {
                if (iterat >= difficulty / time) {
                    if (canMove("down")) {
                        posY += 30;
                        arrY--;
                    } else {
                        setStatus(arrX, arrY, currBlock);
                        lines = getMaxLine();
                        gameState = 3;
                    }
                    iterat = 0;
                }
                $("#" + currBlockId).css("left", posX);
                $("#" + currBlockId).css("top", posY);
            } else if (gameState == 3) {
                $("#" + currBlockId).css("left", posX);
                $("#" + currBlockId).css("top", posY);
                /* find connection and determination bomb */
                doChain();
                gameState = 1;
            }

        }
    }
}


/* create and append new random block */
function createBlock(){
    rotAngle=0;
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
    canUpdate = false;
    setTimeout(function(){ canUpdate=true;}, 1000);
}


/* -------------------------------------- Part of game logic, connected with tube chain and bomb ------------------*/
function doChain(){
    if(isBomb(currBlock)) {
        delBomb();
        /* if not lie on bottom */
        if( (arrY-1) > 0)
        delChain(ex[8*(arrY-1)+arrX].head);
    } else {
        addChain();
    }
}

function isBomb(el){
    return el.sockets == 0;
}

/* remove html element and "ex" array element*/
function delBomb(){
    $("#"+currBlockId).hide("explode",{pieces:32},200);
    $("#myaudio")[0].play();
    $("#"+currBlockId).remove();
    ex[8*arrY+arrX] = null;
}

function delBlock(x){
    $("#"+ex[x].id).hide("explode",{pieces:16},100);
    $("#myaudio")[1].play();
    $("#"+ex[x].id).remove();
    ex[x] = null;
}

function addChain(){
    /* first element */
    if(graphPointer == 0){
        graph.data = currBlock;
        graph.next = null;
        graph.open = currBlock.sockets;

        currBlock.head = graph;
        graphPointer++;
    } else {
        newConnection=true;

        // TODO add find connection AND unite 2 chain !!!
        if(currBlock.right == 1) {
            // if it is the connection
            if((arrX+1 <= 7) && (ex[8*arrY+arrX+1] != null) && (ex[8*arrY+arrX+1].left == 1)) {
                currBlock.head = ex[8*arrY+arrX+1].head;
                addElem();
                newConnection = false;
            }
        }
        if(currBlock.down == 1) {
            // if it is the connection
            if( (arrY-1 >= 0) && (ex[8*(arrY-1)+arrX] != null) && (ex[8*(arrY-1)+arrX].top == 1) ){
                // first connection
                if(newConnection) {
                    currBlock.head = ex[8*(arrY-1)+arrX].head;
                    addElem();
                    newConnection = false;
                } else {
                    // second connection. unite 2 chain
                    var te = ex[8*(arrY-1)+arrX].head;
                    currBlock.head.open += (te.open-2);
                    var de = te.data;
                    delGraphElem(te);
                    te = de;
                    while(de.next != null){
                        de.head = currBlock.head;
                        de = de.next;
                    }
                    de.head = currBlock.head;
                    de.next = currBlock.head.data;
                    currBlock.head.data = te;
                }
            }
        }
        if(currBlock.left == 1) {
        // TODO
        }
        if(currBlock.top == 1) {
        // TODO
        }
        // the currBlock didn't connected to anyone

        if(newConnection){
            // go to the end of existed chain
            var temp = graph;
            for(var t=0; t<graphPointer-1; t++){
                temp = temp.next;
            }
            var newGraph = new graph();
            newGraph.data = currBlock;
            newGraph.next = null;
            newGraph.open = currBlock.sockets;

            currBlock.head = newGraph;
            temp.next = newGraph;
            graphPointer++;
        }

        if(currBlock.head.open == 0) {
            delChain(currBlock.head);
            graphPointer--;
        }
    }
}

function addElem(){
    currBlock.next = currBlock.head.data;
    currBlock.head.data = currBlock;
    currBlock.head.open += (currBlock.sockets - 2);
}

/* remove html elements and 'ex' array elements from thead*/
function delChain(thead){
    /* this timeout for animation (for prevent creation a new block before full  explosion */
    canUpdate = false;
    setTimeout(function(){ canUpdate = true},1000);

    delGraphElem(thead);

    var temp = thead.data;
    var a = temp.next;
    while(a){
        delBlock(temp.x);
        temp = a;
        a = temp.next;
    }
    delBlock(temp.x);
    thead.data = null;
}

function delGraphElem(h){
    if(h.data.id == graph.data.id) {
        graph = h.next;
        return;
    }
    var temp = graph;
    while(temp.next.data.id != h.data.id){
        temp = temp.next;
    }
    temp.next = temp.next.next;
}
/* -----------------------------------------------  GAME OVER -------------------------------------------------------*/
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


/* ------------------------------------------------ Part connected with Ex matrix (player view logic) ---------------*/
/* return TRUE when array cell is empty and we can move block in it*/
function getStatus(x, y){
    if(x > 7 || x < 0 || y > 9 || y < 0) return false;
    if((typeof ex[8*y+x] == 'undefined') || (ex[8*y+x] == null)) return true;
    return false;
}

// set ex[8y+x] pointer to currBox; currBox.x -> ex[8*y+x]
function setStatus(x, y, box){
    ex[8*y+x] = box;
    box.x = 8*y+x;
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