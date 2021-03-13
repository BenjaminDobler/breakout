export function render(context, canvas, brickColors, bgPattern, d) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // context.beginPath();
  // context.strokeStyle = '#000000';
  // context.lineWidth = 1;
  // // context.fillStyle = '#ffffff';
  // if (bgPattern) {
  //     context.fillStyle = bgPattern;
  // }

  // context.rect(0, 0, canvas.width, canvas.height);
  // context.fill();
  // context.stroke();
  // context.closePath();

  context.fillStyle = "#dedede";

  // draw the paddle
  context.beginPath();
  context.rect(
    d.paddle.x - d.paddle.width / 2,
    context.canvas.height - d.paddle.height,
    d.paddle.width,
    d.paddle.height
  );
  context.fill();
  context.closePath();

  // if shooting enabled
  if (d.shooting.munition > 0) {
    context.beginPath();
    context.rect(
      d.paddle.x - 20,
      context.canvas.height - d.paddle.height - 10,
      40,
      10
    );
    context.fill();
    context.closePath();
  }

  // draw ball
  context.beginPath();
  context.shadowColor = "red";
  //context.shadowBlur = 15;
  context.fillStyle = "#ff0000";
  context.arc(d.ball.x, d.ball.y, d.ball.radius, 0, Math.PI * 2);
  context.fill();
  context.closePath();
  context.shadowBlur = 0;

  context.fillStyle = "#dedede";

  // draw bricks
  for (let brick of d.bricks.filter((b) => !b.hit)) {
    context.fillStyle = brickColors[brick.gemType];

    context.beginPath();
    context.shadowColor = "red";
    //context.shadowBlur = 15;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.rect(brick.x, brick.y, brick.width, brick.height);
    context.fill();
    context.stroke();
    //Blur = 0;

    context.closePath();
  }

  for (let gem of d.gems) {
    context.fillStyle = brickColors[gem.type];

    context.beginPath();
    context.shadowColor = "red";
    // context.shadowBlur = 15;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.rect(gem.x, gem.y, gem.width, gem.height);
    context.fill();
    context.stroke();
    context.shadowBlur = 0;

    context.closePath();
  }

  for (let shoot of d.shoots) {
    context.fillStyle = "red";
    context.beginPath();
    context.arc(shoot.x, shoot.y, 4, 0, Math.PI * 2);
    context.fill();
    context.closePath();
  }

  d.particles.draw();
}
