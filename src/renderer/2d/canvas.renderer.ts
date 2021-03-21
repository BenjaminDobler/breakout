import { Particles } from './particles';

function drawBall(context, ball) {
    context.beginPath();
    context.shadowColor = 'red';
    context.fillStyle = '#ff0000';
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();
    context.shadowBlur = 0;
}

export function render(canvas, brickColors, d) {
    const context = canvas.getContext('2d');
    const activeBalls = d.balls.filter((b) => !b.out);
    const activeBricks = d.bricks.filter((b) => !b.out);
    const activeShoots = d.shoots.filter((b) => !b.out);
    const activeGems = d.gems.filter((b) => !b.out);

    if (!d.particles) {
        d.particles = new Particles(context);
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#dedede';

    // draw the paddle
    context.beginPath();
    context.rect(
        d.paddle.x,
        d.paddle.y - d.paddle.height,
        d.paddle.width,
        d.paddle.height
    );
    context.fill();
    context.closePath();

    // draw cannons
    if (d.shooting.munition > 0) {
        context.beginPath();
        context.rect(
            d.paddle.x + d.paddle.width / 2 - 20,
            d.paddle.y - d.paddle.height - 10,
            40,
            10
        );
        context.fill();
        context.closePath();
    }

    // draw Balls
    for (const ball of activeBalls) {
        drawBall(context, ball);
    }

    context.fillStyle = '#dedede';

    // draw Bricks
    for (let brick of activeBricks) {
        context.fillStyle = brickColors[brick.gemType];
        context.beginPath();
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.rect(brick.x, brick.y, brick.width, brick.height);
        context.fill();
        context.stroke();
        context.closePath();
    }

    // draw Gems
    for (let gem of activeGems) {
        context.fillStyle = brickColors[gem.type];
        context.beginPath();
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.rect(gem.x, gem.y, gem.width, gem.height);
        context.fill();
        context.stroke();
        context.closePath();
    }

    // draw Shoots
    for (let shoot of activeShoots) {
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(shoot.x, shoot.y, 4, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    }

    d.particles.draw();
}
