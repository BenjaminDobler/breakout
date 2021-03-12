import { animationFrameScheduler, fromEvent, interval, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, scan, share, startWith, throttleTime, withLatestFrom } from 'rxjs/operators';
import { createGridFromData, gridData, gridData2 } from './grid.factory';
import { Particles } from './particles';
import { render } from './render';
import { GemType, brickColors } from './types';

console.log('init');

function collision(brick, ball) {
    return ball.x + ball.directionX > brick.x && ball.x + ball.directionX < brick.x + brick.width && ball.y + ball.directionY > brick.y && ball.y + ball.directionY < brick.y + brick.height;
}

function intersects(rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width && rect2.x < rect1.x + rect1.width && rect1.y < rect2.y + rect2.height) return rect2.y < rect1.y + rect1.height;
    else return false;
}

const height = 600;
const width = 800;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');

const particles = new Particles(context);

const data = {
    shooting: {
        munition: 0,
    },
    score: 0,
    lastShoot: Date.now(),
    shoots: [],
    ball: { x: width / 2, y: height / 2, directionX: 0, directionY: 1, speed: 2, radius: 6 },
    paddle: { x: width / 2, y: height - 10, width: 200, height: 15, speed: 5, targetWidth: 200 },
    bricks: [
        {
            x: 100,
            y: 100,
            width: 200,
            height: 50,
            color: '#ff0000',
            hit: false,
            gemType: GemType.NONE,
        },
    ],
    gems: [],
    state: {},
};

// data.bricks = createGrid(4, 10);

data.bricks = createGridFromData(width, height, gridData2);

const keyboardInput$ = merge(
    fromEvent(window, 'keydown').pipe(
        filter((e: any) => e.keyCode === 39 || e.keyCode === 37),
        map((e: any) => (e.keyCode === 37 ? -1 : 1))
    ),
    fromEvent(window, 'keyup').pipe(map((e) => 0))
);

const mousePos$ = fromEvent(window, 'mousemove').pipe(map((e: any) => e.pageX));

const $tick = interval(17, animationFrameScheduler);

const keyboardPos$ = $tick.pipe(
    withLatestFrom(keyboardInput$),
    map(([tick, input]) => input),
    scan((acc, pos) => {
        return acc + pos * data.paddle.speed;
    }, width / 2),
    distinctUntilChanged()
);

const keyboardShoot$ = merge(
    fromEvent(window, 'keydown').pipe(
        filter((e: any) => e.keyCode === 38),
        map((e: any) => true)
    ),
    fromEvent(window, 'keyup').pipe(map((e) => false))
);

const state$ = $tick.pipe(
    withLatestFrom(keyboardPos$),
    withLatestFrom(keyboardShoot$),
    scan((acc, [[tick, pos], shoot]) => {
        var zeit0 = performance.now();

        // Handle shooting
        if (acc.shooting.munition > 0 && shoot && Date.now() - acc.lastShoot > 200) {
            acc.shoots.push({
                x: acc.paddle.x,
                y: acc.paddle.y,
            });
            acc.lastShoot = Date.now();
            acc.shooting.munition -= 1;
        }

        if (acc.ball.y > height) {
            acc.ball.directionY *= -1;
        }

        if (acc.ball.y < 0) {
            acc.ball.directionY *= -1;
        }

        acc.ball.x += acc.ball.speed * acc.ball.directionX;
        acc.ball.y += acc.ball.speed * acc.ball.directionY;

        if (acc.ball.x > acc.paddle.x - acc.paddle.width / 2 && acc.ball.x < acc.paddle.x + acc.paddle.width / 2 && acc.ball.y > canvas.height - acc.paddle.height - acc.ball.radius / 2) {
            let collidePoint = acc.ball.x - acc.paddle.x;
            collidePoint = collidePoint / (acc.paddle.width / 2);
            const angle = (collidePoint * Math.PI) / 3;
            acc.ball.directionX = acc.ball.speed * Math.sin(angle);
            acc.ball.directionY = -acc.ball.speed * Math.cos(angle);
        }

        if (acc.ball.x > canvas.width || acc.ball.x < 0) {
            acc.ball.directionX *= -1;
        }

        for (let brick of acc.bricks.filter((b) => !b.hit)) {
            const collide = collision(brick, acc.ball);
            if (collide) {
                brick.hit = true;
                acc.ball.directionY *= -1;
                particles.addExplosion(acc.ball.x, acc.ball.y);
                acc.score += 100;
                if (brick.gemType !== GemType.NONE) {
                    acc.gems.push({
                        x: brick.x,
                        y: brick.y,
                        width: brick.width,
                        height: brick.height,
                        color: brick.color,
                        out: false,
                        type: brick.gemType,
                    });
                }
            }
        }

        for (let gem of acc.gems) {
            gem.y += 2;
            if (gem.y > height) {
                gem.out = true;
            }
            const collideWithBall = collision(gem, acc.ball);
            if (collideWithBall) {
                console.log('gem collide with ball');
            }

            const collideWithPaddle = intersects(gem, { x: acc.paddle.x - acc.paddle.width / 2, y: acc.paddle.y, width: acc.paddle.width, height: acc.paddle.height });
            if (collideWithPaddle) {
                if (gem.type === GemType.PADDLE_GROW) {
                    acc.paddle.targetWidth = acc.paddle.targetWidth + 20;
                    gem.out = true;
                } else if (gem.type === GemType.PADDLE_SHRINK) {
                    acc.paddle.targetWidth = acc.paddle.targetWidth - 20;
                    gem.out = true;
                } else if (gem.type === GemType.BALL_SPEED_INCREASE) {
                    acc.ball.speed *= 1.2;
                    gem.out = true;
                } else if (gem.type === GemType.BALL_SPEED_DECREASE) {
                    acc.ball.speed *= .8;
                    gem.out = true;
                }  else if (gem.type === GemType.MUNITION) {
                    acc.shooting.munition += 10;
                    gem.out = true;
                }
            }
        }

        acc.gems = acc.gems.filter((g) => !g.out);

        for (let shoot of acc.shoots) {
            for (let brick of acc.bricks.filter((b) => !b.hit)) {
                if (shoot.x > brick.x && shoot.x < brick.x + brick.width && shoot.y > brick.y && shoot.y < brick.y + brick.height) {
                    brick.hit = true;
                    shoot.used = true;
                }
            }
            shoot.y -= 3;
            if (shoot.y < 0) {
                shoot.used = true;
            }
        }

        acc.shoots = acc.shoots.filter((s) => !s.used);

        acc.paddle.width = acc.paddle.width + (acc.paddle.targetWidth - acc.paddle.width) / 10;

        acc.paddle.x = pos; // * acc.paddle.speed;
        var zeit1 = performance.now();
        console.log('script ', zeit1 - zeit1);

        return acc;
    }, data),
    share()
);



const scoreEl = document.getElementById('score');
const munitionEl = document.getElementById('munition');

state$.pipe(
    map(data => data.score),
    distinctUntilChanged(),
).subscribe((m)=>{
    console.log('Munitioon changed ', m);
    scoreEl.textContent = m  + '';
})

state$.pipe(
    map(data => data.shooting.munition),
    distinctUntilChanged(),
).subscribe((m)=>{
    console.log('Munitioon changed ', m);
    munitionEl.textContent = m  + '';
})


state$.subscribe((d) => {
    render(context, canvas, particles, brickColors, bgPattern, data);
});

const img = new Image();
img.src = require('./assets/pattern3.jpeg');
var bgPattern;
img.onload = (e: any) => {
    bgPattern = context.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
    render(context, canvas, particles, brickColors, bgPattern, data);
};
