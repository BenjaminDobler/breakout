import { GemType } from './types';
import { getId } from './util';

function collision(brick, ball) {
    return (
        ball.x + ball.directionX >= brick.x &&
        ball.x + ball.directionX <= brick.x + brick.width &&
        ball.y + ball.directionY >= brick.y &&
        ball.y + ball.directionY <= brick.y + brick.height
    );
}

function intersects(rect1, rect2) {
    if (
        rect1.x < rect2.x + rect2.width &&
        rect2.x < rect1.x + rect1.width &&
        rect1.y < rect2.y + rect2.height
    )
        return rect2.y < rect1.y + rect1.height;
    else return false;
}

function handleBall(state, ball) {
    if (ball.y > state.height) {
        // state.balls = state.balls.filter((b) => b !== ball);
        ball.out = true;
    } else {
        if (ball.y < 0) {
            ball.directionY *= -1;
        }

        ball.x += ball.speed * ball.directionX;
        ball.y += ball.speed * ball.directionY;

        if (
            ball.x >= state.paddle.x &&
            ball.x <= state.paddle.x + state.paddle.width &&
            ball.y >= state.paddle.y - state.paddle.height - ball.radius / 2
        ) {
            let collidePoint = ball.x - state.paddle.x;
            collidePoint = collidePoint - state.paddle.width / 2;
            collidePoint = collidePoint / (state.paddle.width / 2);
            const angle = (collidePoint * Math.PI) / 3;
            ball.directionX = ball.speed * Math.sin(angle);
            ball.directionY = -ball.speed * Math.cos(angle);
        }

        if (ball.x > state.width || ball.x < 0) {
            ball.directionX *= -1;
        }
    }
}

function newInitialBall(state) {
    state.balls.push({
        x: state.paddle.x + state.paddle.width / 2,
        y: state.height - 45,
        directionX: 0,
        directionY: 1,
        speed: 2.5,
        radius: 6,
        id: getId()
    });
}

export function calculateState(acc, [[tick, pos], shoot]) {
    if (acc.state === 'LEVEL_DONE') {
        console.log('level done ');
        if (shoot) {
            acc.level++;
            acc.bricks = acc.levelData[acc.level];
            acc.state = 'START';
            acc.gems = [];
            acc.lives = 4;
        }
    } else if (
        acc.state === 'AFTER_LIVE_LOST' ||
        acc.state === 'START' ||
        acc.state === 'GAME_OVER'
    ) {
        acc.shoots.forEach((shoot) => {
            shoot.used = true;
        });

        acc.gems.forEach((gem) => {
            gem.out = true;
            gem.used = true;
        });
        acc.paddle.x = pos;

        for (const ball of acc.balls) {
            ball.x = acc.paddle.x + acc.paddle.width / 2;
            ball.y = acc.paddle.y - 15;
        }
        if (shoot) {
            acc.state = 'RUNNING';
        }
    } else {
        // Handle shooting
        if (
            acc.shooting.munition > 0 &&
            shoot &&
            Date.now() - acc.lastShoot > 200
        ) {
            acc.shoots.push({
                x: acc.paddle.x + acc.paddle.width / 2,
                y: acc.paddle.y,
                id: getId()
            });
            acc.lastShoot = Date.now();
            acc.shooting.munition -= 1;
        }

        if (acc.balls.length === 0) {
            acc.lives--;
            if (acc.lives > 0) {
                newInitialBall(acc);
                acc.state = 'AFTER_LIVE_LOST';
            } else {
                newInitialBall(acc);
                acc.state = 'GAME_OVER';
            }
        }

        for (const ball of acc.balls) {
            handleBall(acc, ball);
        }

        for (let brick of acc.bricks.filter((b) => !b.hit)) {
            for (let ball of acc.balls) {
                console.log('ball ', ball);
                const collide = collision(brick, ball);
                if (collide) {
                    brick.hit = true;
                    ball.directionY *= -1;
                    if (acc.particles) {
                        acc.particles.addExplosion(ball.x, ball.y);
                    }
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
                            id: getId()
                        });
                    }
                }
            }
        }

        const gems = acc.gems.filter((g) => !g.out);

        for (let gem of gems) {
            gem.y += 2;
            if (gem.y > acc.height) {
                gem.out = true;
            }
            // const collideWithBall = collision(gem, acc.ball);
            // if (collideWithBall) {
            //     console.log('gem collide with ball');
            // }

            const collideWithPaddle = intersects(gem, {
                x: acc.paddle.x,
                y: acc.paddle.y,
                width: acc.paddle.width,
                height: acc.paddle.height
            });

            if (collideWithPaddle) {
                console.log('collide with paddel!');
                gem.out = true;

                if (gem.type === GemType.PADDLE_GROW) {
                    acc.paddle.targetWidth = acc.paddle.targetWidth + 20;
                } else if (gem.type === GemType.PADDLE_SHRINK) {
                    acc.paddle.targetWidth = acc.paddle.targetWidth - 20;
                } else if (gem.type === GemType.BALL_SPEED_INCREASE) {
                    acc.balls.forEach((ball) => (ball.speed *= 1.2));
                } else if (gem.type === GemType.BALL_SPEED_DECREASE) {
                    acc.balls.forEach((ball) => (ball.speed *= 0.8));
                } else if (gem.type === GemType.MUNITION) {
                    acc.shooting.munition += 10;
                } else if (gem.type === GemType.EXTRA_BALL) {
                    acc.balls.push({
                        x: acc.paddle.x + acc.paddle.width / 2,
                        y: acc.paddle.y - 15,
                        directionX: 0,
                        directionY: 1,
                        speed: 2.5,
                        radius: 6
                    });
                }
            }
        }

        const activeBricks = acc.bricks.filter((b) => !b.hit);
        for (let shoot of acc.shoots) {
            if (!shoot.used) {
                for (let brick of activeBricks) {
                    if (
                        shoot.x > brick.x &&
                        shoot.x < brick.x + brick.width &&
                        shoot.y > brick.y &&
                        shoot.y < brick.y + brick.height
                    ) {
                        brick.hit = true;
                        shoot.used = true;
                    }
                }
                shoot.y -= 5;
                if (shoot.y < 0) {
                    shoot.used = true;
                }
            }
        }

        if (activeBricks.length === 0) {
            acc.state = 'LEVEL_DONE';
        }

        acc.paddle.width =
            acc.paddle.width + (acc.paddle.targetWidth - acc.paddle.width) / 10;
        acc.paddle.x = pos; // * acc.paddle.speed;
    }

    return acc;
}
