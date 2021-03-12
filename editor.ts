import { GemType, brickColors } from './types';

console.log('editor');

const height = 600;
const width = 800;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');

let rows = 0;
let cols = 0;

const apply = document.querySelector('#apply');
const selectMode = document.querySelector('#selectMode') as HTMLInputElement;

const gemSelect = document.querySelector('#gemSelect') as HTMLSelectElement;

const exportButton = document.querySelector('#expot_btn') as HTMLButtonElement;

exportButton.addEventListener('click', () => {
    const bs = bricks
        .filter((b) => b.selected)
        .map((b) => {
            const c = { ...b };
            delete c.width;
            delete c.height;
            delete c.x;
            delete c.y;
            delete c.selected;
            return c;
        });

    const data = {
        rows: rows,
        cols: cols,
        bricks: bs,
    };

    console.log(JSON.stringify(data, null, 2));
});

gemSelect.addEventListener('change', () => {
    if (selectedBrick) {
        selectedBrick.gemType = gemSelect.selectedIndex;
        render();
    }
});

let selectedBrick;

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.pageX - rect.left;
    const y = e.pageY - rect.top;

    const xPos = Math.floor(x / (width / cols));
    const yPos = Math.floor(y / (height / rows));

    const index = yPos * cols + xPos;
    bricks[index].selected = selectMode.checked;
    selectedBrick = bricks[index];

    gemSelect.selectedIndex = selectedBrick.gemType;

    render();
});
let bricks = [];
apply.addEventListener('click', () => {
    console.log('on apply ');
    rows = parseInt((document.querySelector('#rows-tx') as HTMLInputElement).value);
    cols = parseInt((document.querySelector('#cols-tx') as HTMLInputElement).value);
    bricks = [];
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            bricks.push({
                r: r,
                c: c,
                y: r * (height / rows),
                x: c * (width / cols),
                width: width / cols,
                height: height / rows,
                selected: false,
                gemType: GemType.NONE,
                strength: 1,
            });
        }
    }

    render();
});

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();

    context.lineWidth = 1;
    context.strokeStyle = '#000000';

    context.fillStyle = '#000000';
    context.fillStyle = '#999999';

    for (let brick of bricks) {
        if (brick.selected) {
            context.fillStyle = brickColors[brick.gemType];
        } else {
            context.fillStyle = '#999999';
        }

        context.beginPath();
        context.lineWidth = 1;
        context.rect(brick.x, brick.y, brick.width, brick.height);
        context.fill();
        context.stroke();
        context.closePath();
    }

    if (selectedBrick) {
        //context.fillStyle = '999999';
        context.beginPath();
        context.strokeStyle = '#00ff00';

        context.lineWidth = 3;
        context.rect(selectedBrick.x, selectedBrick.y, selectedBrick.width, selectedBrick.height);
        // context.fill();
        context.stroke();
        context.closePath();
    }
}
