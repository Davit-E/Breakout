// jshint esversion: 9
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
canvas.style.background = 'black';
window.addEventListener("resize", () => {
  player.score = currentScore;
  player.lives = currentLives;
  savePlayerStats();
  document.location.reload();
});

var windowWidth = getWindowSize()[0];
var windowHeight = getWindowSize()[1];
var maxLives = 3;

function getWindowSize() {
  return [window.innerWidth, window.innerHeight];
}

function setCanvasSize() {
  ctx.canvas.width = windowWidth;
  ctx.canvas.height = windowHeight;
}

var paddle = {
  x: 0,
  y: 0,
  width: windowWidth / 7,
  minWidth: 100,
  height: windowWidth / 110,
  minHeight: 15,
  hoverHeight: 20,
  dx: 5,
  fillColor: 'rgb(198, 72, 73)'
};
var ball = {
  x: 0,
  y: 0,
  radius: 0,
  startAngle: 0,
  endAngle: Math.PI * 2,
  speed: 3,
  dx: 3 * (Math.random() * 2 - 1),
  dy: -3,
  fillColor: 'rgb(198, 72, 73)'
};
var brick = {
  x: 0,
  y: 0,
  width: 0,
  height: 30,
  isDestroyed: false,
  score: 10,
  fillColor: 'rgb(210, 70, 87)'
};
var player = {
  lives: maxLives,
  level: 1,
  score: 0,
  highscore: 0
};
getPlayerStats();
var currentScore = player.score;
var currentLives = player.lives;

var colorsArr = ['rgb(200, 72, 71)', 'rgb(198, 107, 59)', 'rgb(180, 122, 48)',
'rgb(162, 161, 43)', 'rgb(72, 161, 69)', 'rgb(68, 71, 201)'];


// DRAW GAME
var interval = 0;

function drawGame() {
  interval = setInterval(draw, 1);
}

drawGame();
setPaddlePosition();
setBallPosition();


function savePlayerStats() {
  let playerStr = JSON.stringify(player);
  sessionStorage.setItem('player', playerStr);
}

function getPlayerStats() {
  if(window.sessionStorage.length) {
    let playerStats = sessionStorage.getItem('player');
    player = JSON.parse(playerStats);
  }
}

function setBallPosition() {
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius;
  ball.dx = ball.speed * (Math.random() * 2 - 1);
  ball.radius = paddle.height;
}

function setPaddlePosition() {
  if(windowWidth <= 900) {
    paddle.width = paddle.minWidth;
    paddle.height = paddle.minHeight;
    paddle.dx = 3;
  }
  paddle.x = (windowWidth / 2) - paddle.width / 2;
  paddle.y = windowHeight - paddle.height - paddle.hoverHeight;
  paddle.height = brick.height / 2;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, ball.startAngle, ball.endAngle);
  ctx.fillStyle = ball.fillColor;
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = paddle.fillColor;
  ctx.fill();
  ctx.closePath();
}

function drawBricks(arr) {
  for(let i = 0; i < arr.length; i++) {
    let brickToDraw = arr[i];
    if(!brickToDraw.isDestroyed) {
      ctx.beginPath();
      ctx.rect(brickToDraw.x, brickToDraw.y, brickToDraw.width, brickToDraw.height);
      ctx.fillStyle = brickToDraw.fillColor;
      ctx.fill();
      ctx.closePath();
      if(ballBrickCollision(brickToDraw)) {
        brickToDraw.isDestroyed = true;
      }
    }
  }
}

// GENERATE BRICKS
function generateBrickWall(brickCount, brickRowCount) {
  var y = 60;
  var yIncrement = 31;
  var arr = [];
  for(var i = 0; i < brickRowCount; i++) {
    arr.push(...generateBrickLine(y, colors[i], brickCount));
    y += yIncrement;
  }
  return arr;
}

function generateBrickLine(y, color, brickCount) {
  let x = 10;
  let gapWidth = 1;
  let startEndGap = x;
  let arr = [];
  for(let i = 0; i < brickCount; i++) {
    let currentBrick = Object.assign({}, brick);
    currentBrick.width = ((windowWidth - startEndGap * 2) / brickCount) - gapWidth + gapWidth / brickCount;
    currentBrick.x = x;
    currentBrick.y = y;
    currentBrick.fillColor = color;
    arr.push(currentBrick);
    x += currentBrick.width + gapWidth;
  }
  return arr;
}

// LEVELS
setLevel(player.level);
var colors;
var brickArr;

function setLevel(level) {
  colors = setColors(level);
  brickArr = setBricks(level, colors);
  if(level > 7) {
    ball.speed += 0.5 * (level - 7);
    paddle.dx += 0.2 * (level - 7);
  }
}
console.log(ball.speed);

function setColors(level) {
  arr = [];
  if(level === 1) {
    arr = colorsArr;
  } else if(level > 1) {
    colorsArr.forEach((color, i) => {
      if(i <= level - 2) {
        arr.push(color);
      }
      arr.push(color);
    });
  }
  return arr;
}

function setBricks(level, colors) {
  arr = [];
  if(level === 1) {
    arr = generateBrickWall(10, colors.length);
  } else if(level > 1) {
    arr = generateBrickWall(20, colors.length);
  }
  return arr;
}


// DRAWING FUNCTION
function draw() {
  setCanvasSize();
  drawPaddle();
  if(rightPressed && paddle.x + paddle.width < windowWidth - ball.radius) {
    paddle.x += paddle.dx;
  } else if(leftPressed && paddle.x > ball.radius) {
    paddle.x -= paddle.dx;
  }
  drawBall();
  if(upPressed) {
    ball.x += ball.dx;
    ball.y += ball.dy;
    detectCollision();
  } else {
    if(player.score === 0) {
      drawArrows();
    }
    setBallPosition();
  }
  drawBricks(brickArr);
  showGameStats();
  if(bricksDestroyed === brickArr.length) {
    nextLevel();
  }
}
// DRAW ARROWS
var arrowImageUp = new Image();
arrowImageUp.src = 'img/arrow.svg';
var arrowImageLeft = new Image();
arrowImageLeft.src = 'img/arrow_left.svg';
var arrowImageRight = new Image();
arrowImageRight.src = 'img/arrow_right.svg';

function drawArrows() {
  ctx.drawImage(arrowImageUp, ball.x - 52, ball.y - 100, 100, 100);
  ctx.drawImage(arrowImageLeft, paddle.x - 100, paddle.y - paddle.hoverHeight - paddle.height / 1.3, 100, 100);
  ctx.drawImage(arrowImageRight, paddle.x + paddle.width - 12, paddle.y - paddle.hoverHeight - paddle.height / 1.3, 100, 100);
}

// COLLISION DETECTION
function detectCollision() {
  // Ball falls down
  var ballFalls = ball.y + ball.radius > windowHeight;
  if(ballFalls) {
    playerLooses();
  }
  // Ball-Wall Collision
  let ballHitPaddle = ball.y + ball.radius > paddle.y && ball.x < paddle.x + paddle.width && ball.x > paddle.x;
  if(ball.y + ball.radius > windowHeight || ball.y - ball.radius <= 0) ball.dy = -ball.dy;
  if(ball.x + ball.radius > windowWidth || ball.x - ball.radius <= 0) {
    ball.dx = -ball.dx;
  } else if(ballHitPaddle) {
    // Ball-Paddle Collision
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    collidePoint = collidePoint / (paddle.width / 2);
    let angle = collidePoint * (Math.PI / 3);
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }
}

// BALL HITS BRICK
function ballBrickCollision(currentBrick) {
  let ballHitBrick = ball.y - ball.radius < currentBrick.y + currentBrick.height && ball.y + ball.radius > currentBrick.y &&
    ball.x - ball.radius < currentBrick.x + currentBrick.width && ball.x + ball.radius > currentBrick.x;
  let ballHitTopOrBottom = ball.y + ball.radius - ball.dy <= currentBrick.y || ball.y - ball.radius - ball.dy >= currentBrick.y + currentBrick.height;
  let ballHitSide = ball.x + ball.radius - ball.dx <= currentBrick.x || ball.x - ball.radius - ball.dx >= currentBrick.x + currentBrick.width;
  if(ballHitBrick) {
    player.score += brick.score;
    brickCounter();
    if(ballHitTopOrBottom) {
      ball.dy = -ball.dy;
    } else if(ballHitSide) {
      ball.dx = -ball.dx;
    }
    return true;
  }
  return false;
}

// BALL FALLS
function playerLooses() {
  player.lives--;
  if(player.lives <= 0) {
    clearInterval(interval);
    gameOver();
  } else {
    clearInterval(interval);
    upPressed = false;
    setTimeout(() => {
      setPaddlePosition();
      setBallPosition();
      drawGame();
    }, 500);
  }
}

// GAME OVER
var backdrop = document.querySelector('.backdrop');
var playerLosesDiv = document.querySelector('.player_loses');
var scoreText = document.querySelector('#current_score');
var highScoreText = document.querySelector('#high_score');

function gameOver() {
  setCanvasSize();
  if(player.score > player.highscore) {
    player.highscore = player.score;
  }
  scoreText.textContent = `SCORE: ${player.score}`;
  highScoreText.textContent = `HIGH SCORE: ${player.highscore}`;
  backdrop.style.display = 'block';
  playerLosesDiv.style.display = 'flex';
  setTimeout(() => {
    player.score = 0;
    player.lives = maxLives;
    player.level = 1;
    savePlayerStats();
    document.location.reload();
  }, 3000);
}

// NEXT LEVEL
var bricksDestroyed = 0;

function brickCounter() {
  bricksDestroyed++;
}
var nextLevelDiv = document.querySelector('.next_level');
var nextLevelDivText = document.querySelector('#next_level_text');

function nextLevel() {
  clearInterval(interval);
  backdrop.style.display = 'block';
  nextLevelDiv.style.display = 'flex';
  nextLevelDivText.textContent = `LEVEL: ${player.level + 1}`;
  setTimeout(() => {
    player.level++;
    if(player.lives < maxLives) {
      player.lives++;
    }
    savePlayerStats();
    document.location.reload(); //
  }, 2000);
}

// GAME STATS
var heartImage = new Image();
heartImage.src = 'img/heart.svg';
var noHeartImage = new Image();
noHeartImage.src = 'img/no_heart.svg';

function showGameStats() {
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.font = '25px Atari';
  ctx.fillText(`SCORE: ${player.score}`, 10, 40);
  ctx.fillText(`LEVEL: ${player.level}`, (windowWidth - 100) / 2, 40);
  let heartsGap = 55;
  for(let i = 0; i < player.lives; i++) {
    ctx.drawImage(heartImage, windowWidth - heartsGap, 2, 60, 60);
    heartsGap += 40;
  }
  for(let i = maxLives; i > player.lives; i--) {
    ctx.drawImage(noHeartImage, windowWidth - heartsGap, 2, 60, 60);
    heartsGap += 40;
  }
}

// CONTROLLS
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if(player.lives <= 0) {
    setTimeout(() => document.location.reload(), 300);
  } else if(e.keyCode === 39) {
    rightPressed = true;
  } else if(e.keyCode === 37) {
    leftPressed = true;
  } else if(e.keyCode === 38 || e.keyCode === 32) {
    upPressed = true;
  }
}

function keyUpHandler(e) {
  if(e.keyCode === 39) {
    rightPressed = false;
  } else if(e.keyCode === 37) {
    leftPressed = false;
  }
}
