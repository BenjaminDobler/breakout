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

    // if shooting enabled
    if (d.shooting.munition > 0) {
        context.beginPath();
        context.rect(
            d.paddle.x + d.paddle.width/2 - 20,
            d.paddle.y - d.paddle.height - 10,
            40,
            10
        );
        context.fill();
        context.closePath();
    }


    for(const ball of d.balls) {
        if (!ball.out) {
            drawBall(context, ball);
        }
    }

    context.fillStyle = '#dedede';

    // draw bricks
    for (let brick of d.bricks.filter((b) => !b.hit)) {
        context.fillStyle = brickColors[brick.gemType];

        context.beginPath();
        context.shadowColor = 'red';
        //context.shadowBlur = 15;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.rect(brick.x, brick.y, brick.width, brick.height);
        context.fill();
        context.stroke();
        //Blur = 0;

        context.closePath();
    }

    for (let gem of d.gems) {
        if (!gem.out) {
            context.fillStyle = brickColors[gem.type];

            context.beginPath();
            context.shadowColor = 'red';
            // context.shadowBlur = 15;
            context.strokeStyle = '#ffffff';
            context.lineWidth = 2;
            context.rect(gem.x, gem.y, gem.width, gem.height);
            context.fill();
            context.stroke();
            context.shadowBlur = 0;

            context.closePath();
        }
    }

    for (let shoot of d.shoots) {
        if (!shoot.used) {
            context.fillStyle = 'red';
            context.beginPath();
            context.arc(shoot.x, shoot.y, 4, 0, Math.PI * 2);
            context.fill();
            context.closePath();
        }
    }

    d.particles.draw();
}
