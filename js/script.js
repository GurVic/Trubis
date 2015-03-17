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
var isMusic = false;
var isGame=false;

var graph = {open: 0, data: null, next: null}; // open - open sockets in all chain; data - pointer to graphElem
var graphElem = {data: null, next: null}; // data - currBlock;
var graphPointer = 0; // number of unique chain
var newConnection = true; // flag for new currBlock

function Elem(head, sock, id, left, up, right, down) {
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
    $("#cube").fadeOut();

    $("#play").click(function() {
        isGame = true;
        $("#score").fadeIn().html(score);
        $("#level").fadeIn().html(level);
        $("#cube").fadeIn().html(cubeNum);
        $("#cont").html("");
        newGame();
    });

    $("#help").click(function(){
        $("#cont").html("<h1>Simple game Trubis</h1><p>Move left - A</p><p>Move right - D</p><p>Rotate - W</p><p>Drop - S</p>");
    });
    $("#config").click(function(){
        if(isGame){
            location.reload(true);
            isGame = false;
        }
        $("#cont").html("<input type='checkbox' id='check' onclick='chclick()'><label for='check'>Music</label>" +
        "<p><b>Level</b><br><input type='radio' name='level' onclick='radclick(1)' value='1' checked>1<br>" +
        "<input type='radio' name='level' onclick='radclick(2)' value='2'>2<br>" +
        "<input type='radio' name='level' onclick='radclick(3)' value='3'>3<br></p>");
    });
});

function radclick(v){
    level = v;
}

function chclick(){
    isMusic = !isMusic;
}

function keyHand(e){
    e = e || window.event;
    if(gameState == 3) return;
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
var cubeNum = 0;
function newGame(){
    difficulty = 800-level*100;
    newConnection = true;
    graph.data = null;
    graph.next = null;
    graph.open = 0;
    graphElem.data = null;
    graphElem.next = null;
    graphPointer = 0;
    iterat = 0;
    score = 0;
    //level = 1;
    lines = 1;
    currBlock = null;
    currBlockId = 0;
    rotAngle = 0;
    posX = 0;
    posY = 0;
    arrX = 0;
    arrY = 9;
    canUpdate = true;
    if($("#check").prop("checked")) {
        isMusic  = true;
    }
    /* refresh array */
    for(var i=0; i<80; i++) ex[i]=null;
    gameState = 1; /* we can create new block */

    /* this for non duplicate event handler, when press again 'Play' */
    $(document).off('keydown', keyHand);
    /*  handle keys event */
    $(document).on('keydown', keyHand);
    setTimeout(update, time);
}


/* update function AND, if it possible, create new block */
function update(){
    if(canUpdate) {
        iterat++;
        $("#score").html("Score: " + score);
        $("#level").html("Level: " + level);
        $("#cube").html("cube: " + cubeNum);
        if (lines > 7) {
            /* stop game loop*/
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
            if (gameState == 2) {
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
            } else
            if (gameState == 3) {
                $("#" + currBlockId).css("left", posX);
                $("#" + currBlockId).css("top", posY);
                /* find connection and determination bomb */
                doChain();
                gameState = 1;
            }

        }
    }
    setTimeout(update, time);
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
    switch (i){
        case 1:
            currBlock = new Elem(this, 2, currBlockId, 0, 1, 0, 1);
            break;
        case 2:
            currBlock = new Elem(this, 1, currBlockId, 0, 1, 0, 0);
            break;
        case 3:
            currBlock = new Elem(this, 2, currBlockId, 1, 1, 0, 0);
            break;
        case 4:
            currBlock = new Elem(this, 4, currBlockId, 1, 1, 1, 1);
            break;
        case 5:
            currBlock = new Elem(this, 3, currBlockId, 1, 1, 0, 1);
            break;
        case 6:
            currBlock = new Elem(this, 0, currBlockId, 0, 0, 0, 0);
            break;
    }
    gameState = 2; /* the block movement */
    cubeNum++;
}


/* -------------------------------------- Part of game logic, connected with tube chain and bomb ------------------*/
function doChain(){
    if(isBomb(currBlock)) {
        delBomb();
        /* if not lie on bottom */
        if( (arrY-1) >= 0)
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
    $("#"+currBlockId).hide("explode",{pieces:32},300);
    if(isMusic) {
        $("#myaudio")[0].play();
    }
    $("#"+currBlockId).remove();
    ex[8*arrY+arrX] = null;
}

function delBlock(x){
    $("#"+ex[x].id).hide("explode",{pieces:16},300);
    $("#"+ex[x].id).remove();
    ex[x] = null;
    if(score++ % 20 == 0) {
        level++;
        if(difficulty > 200) {
            difficulty -=100;
        }
    }
}

function addChain(){
    /* first element */
    if(graphPointer == 0){
        var newGraph = {};
        newGraph.data = currBlock;
        newGraph.next = null;
        newGraph.open = currBlock.sockets;
        graph = newGraph;
        currBlock.head = graph;
        graphPointer++;
    } else {
        newConnection=true;

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
            if( (arrY-1 >= 0) && (ex[8*(arrY-1)+arrX] != null) && (ex[8*(arrY-1)+arrX].up == 1) ){
                // first connection
                if(newConnection) {
                    currBlock.head = ex[8*(arrY-1)+arrX].head;
                    addElem();
                    newConnection = false;
                } else {
                    // second connection. unite 2 different chains
                    if(currBlock.head !== ex[8*(arrY-1)+arrX].head ) {
                        var te = ex[8 * (arrY - 1) + arrX].head;
                        currBlock.head.open += (te.open - 2);
                        var de = te.data;
                        delGraphElem(te);
                        te = de;
                        while (de.next != null) {
                            de.head = currBlock.head;
                            de = de.next;
                        }
                        de.head = currBlock.head;
                        de.next = currBlock.head.data;
                        currBlock.head.data = te;
                    } else {
                        currBlock.head.open -= 2;
                    }
                }
            }
        }
        if(currBlock.left == 1) {
            // if it's connection
            if((arrX-1 >=0) && (ex[8*arrY+arrX-1] != null) && (ex[8*arrY+arrX-1].right == 1)) {
                if(newConnection){
                    currBlock.head = ex[8*arrY+arrX-1].head;
                    addElem();
                    newConnection = false;
                } else {
                    // unite 2 chains if it's DIFFERENT chains
                    if(currBlock.head !== ex[8 * arrY + arrX - 1].head) {
                        te = ex[8*arrY + arrX - 1].head; // current GRAPH elem (for destroy)
                        currBlock.head.open += (te.open - 2);
                        de = te.data; // first block element in chain which will be remove
                        delGraphElem(te); // delete GRAPH element
                        te = de; // first elem
                        while (de.next != null) {
                            de.head = currBlock.head;
                            de = de.next;
                        }
                        de.head = currBlock.head;
                        de.next = currBlock.head.data;
                        currBlock.head.data = te;
                    } else {
                        currBlock.head.open -= 2;
                    }

                }
            }
        }
        if(currBlock.up == 1) {
            // if there's connection
            if((arrY+1 <= 9) && (ex[8*(arrY+1)+arrX] != null) && (ex[8*(arrY+1)+arrX].down == 1)){
                if(newConnection){
                    currBlock.head = ex[8*(arrY+1)+arrX].head;
                    addElem();
                    newConnection = false;
                } else {
                    if(currBlock.head !== ex[8*(arrY+1)+arrX].head) {
                        te = ex[8 * (arrY + 1) + arrX].head; // current GRAPH elem (for destroy)
                        currBlock.head.open += (te.open - 2);
                        de = te.data; // first block element in chain which will be remove
                        delGraphElem(te); // delete GRAPH element
                        te = de; // first elem
                        while (de.next != null) {
                            de.head = currBlock.head;
                            de = de.next;
                        }
                        de.head = currBlock.head;
                        de.next = currBlock.head.data;
                        currBlock.head.data = te;
                    } else currBlock.head.open -=2;
                }
            }
        }
        // the currBlock didn't connected to anyone

        if(newConnection){
            var newGraph = {};
            newGraph.data = currBlock;
            newGraph.next = graph;
            newGraph.open = currBlock.sockets;
            graph = newGraph;
            currBlock.head = newGraph;
            graphPointer++;
        }

        // closed chain of elements; need to destroy without bomb
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

    delGraphElem(thead);
    var temp = thead.data;
    var a = temp.next;

    while(a != null){
        delBlock(temp.x);
        temp = a;
        a = temp.next;
    }
    delBlock(temp.x);
}

// delete element in list GRAPH
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
        isGame = false;
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

// set ex[8y+x] pointer to currBox; currBox.x -> 8*y+x
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