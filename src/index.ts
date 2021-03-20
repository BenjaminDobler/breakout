import { animationFrameScheduler, fromEvent, interval, merge } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    scan,
    share,
    startWith,
    withLatestFrom
} from 'rxjs/operators';
import {
    createGridFromData,
    gridData,
    gridData2,
    gridData3
} from './grid.factory';
import { Particles } from './particles';
import { render as canvasRenderer } from './render';
import { calculateState } from './state';
import { reinit, render as webglrenderer } from './three.renderer';
import { GemType, brickColors } from './types';
import { getId } from './util';

console.log('init');
const height = 700;
const width = 1360;

const container = document.getElementById('container');

let canvas;

function newCanvas() {
    if (canvas) {
        container.removeChild(canvas);
    }
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.setAttribute('width', width + '');
    canvas.setAttribute('height', height + '');
    container.appendChild(canvas);
}

newCanvas();

const rendererCB = document.getElementById('renderer') as HTMLInputElement;
rendererCB.addEventListener('change', () => {
    if (rendererCB.checked) {
        reinit();
        newCanvas();
        style = 'webgl';
    } else {
        newCanvas();

        style = 'canvas';
    }
    render(canvas, brickColors, data);
});

let style = 'canvas';

function render(canvas, brickColors, d) {
    if (style === 'canvas') {
        canvasRenderer(canvas, brickColors, d);
    } else {
        webglrenderer(canvas, brickColors, d);
    }
}

// const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const data = {
    lives: 4,
    level: 0,
    shooting: {
        munition: 0
    },
    score: 0,
    lastShoot: Date.now(),
    shoots: [],
    balls: [
        {
            x: width / 2,
            y: height - 45,
            directionX: 0,
            directionY: 1,
            speed: 2.5,
            radius: 6,
            id: getId()
        }
    ],
    paddle: {
        x: width / 2 - 100,
        y: height - 30,
        width: 200,
        height: 15,
        speed: 5,
        targetWidth: 200
    },
    bricks: [
        {
            x: 100,
            y: 100,
            width: 200,
            height: 50,
            color: '#ff0000',
            hit: false,
            gemType: GemType.NONE
        }
    ],
    gems: [],
    state: 'START',
    width: canvas.width,
    height: canvas.height,
    levelData: [],
    particles: null
};

data.levelData[0] = createGridFromData(width, height, gridData3);
data.levelData[1] = createGridFromData(width, height, gridData2);

data.bricks = data.levelData[0];

const keyboardInput$ = merge(
    fromEvent(window, 'keydown').pipe(
        filter((e: any) => e.keyCode === 39 || e.keyCode === 37),
        map((e: any) => (e.keyCode === 37 ? -1 : 1))
    ),
    fromEvent(window, 'keyup').pipe(map(() => 0))
);

const $tick = interval(17, animationFrameScheduler);

const keyboardPos$ = $tick.pipe(
    withLatestFrom(keyboardInput$),
    map(([, input]) => input),
    scan((acc, pos) => {
        return acc + pos * data.paddle.speed;
    }, width / 2),
    distinctUntilChanged()
);

const keyboardShoot$ = merge(
    fromEvent(window, 'keydown').pipe(
        filter((e: any) => e.keyCode === 38),
        map(() => true)
    ),
    fromEvent(window, 'keyup').pipe(map(() => false))
);

const state$ = $tick.pipe(
    withLatestFrom(keyboardPos$),
    withLatestFrom(keyboardShoot$),
    scan(calculateState, data),
    share()
);

const scoreEl = document.getElementById('score');
const munitionEl = document.getElementById('munition');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');

state$
    .pipe(
        map((data) => data.score),
        distinctUntilChanged(),
        startWith(0)
    )
    .subscribe((m) => {
        console.log('Munitioon changed ', m);
        scoreEl.textContent = m + '';
    });

state$
    .pipe(
        map((data) => data.lives),
        distinctUntilChanged(),
        startWith(data.lives)
    )
    .subscribe((l) => {
        console.log('Lives changed ', l);
        livesEl.textContent = l + '';
    });

state$
    .pipe(
        map((data) => data.level),
        distinctUntilChanged(),
        startWith(0)
    )
    .subscribe((l) => {
        console.log('Level changed ', l);
        livesEl.textContent = l + '';
    });

state$
    .pipe(
        map((data) => data.shooting.munition),
        distinctUntilChanged(),
        startWith(0)
    )
    .subscribe((m) => {
        console.log('Munitioon changed ', m);
        munitionEl.textContent = m + '';
    });

state$.subscribe(() => {
    render(canvas, brickColors, data);
});

// const img = new Image();
// img.src = require('./assets/pattern3.jpeg');
// //ar bgPattern
// img.onload = () => {
//     // bgPattern = context.createPattern(img, 'repeat') // Create a pattern with this image, and set it to "repeat".
// };
render(canvas, brickColors, data);
render(canvas, brickColors, data);
