import { GemType, brickColors } from './types';

console.log('editor');


const grids = [];
let selectedGrid;

const height = 600;
const width = 800;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');



const apply = document.querySelector('#apply');
const selectMode = document.querySelector('#selectMode') as HTMLInputElement;

const gemSelect = document.querySelector('#gemSelect') as HTMLSelectElement;

const exportButton = document.querySelector('#expot_btn') as HTMLButtonElement;

exportButton.addEventListener('click', () => {
    const d = [];
    for(let grid of grids) {
        const bs = grid.bricks
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
            rows: grid.rows,
            cols: grid.cols,
            bricks: bs,
        };
        d.push(data)
    }

    console.log(JSON.stringify({grids: d}, null, 2));
});

gemSelect.addEventListener('change', () => {
    if (selectedBrick) {
        selectedBrick.gemType = gemSelect.selectedIndex;
        render();
    }
});

let selectedBrick;

canvas.addEventListener('click', (e) => {
    const bricks = selectedGrid.bricks;
    const rect = canvas.getBoundingClientRect();
    const x = e.pageX - rect.left;
    const y = e.pageY - rect.top;

    const xPos = Math.floor(x / (width / selectedGrid.cols));
    const yPos = Math.floor(y / (height / selectedGrid.rows));

    const index = yPos * selectedGrid.cols + xPos;
    bricks[index].selected = selectMode.checked;
    selectedBrick = bricks[index];

    gemSelect.selectedIndex = selectedBrick.gemType;

    render();
});

apply.addEventListener('click', () => {
    const newGrid: any = {};
    newGrid.rows = parseInt((document.querySelector('#rows-tx') as HTMLInputElement).value);
    newGrid.cols = parseInt((document.querySelector('#cols-tx') as HTMLInputElement).value);
    const bricks = [];
    for (var r = 0; r < newGrid.rows; r++) {
        for (var c = 0; c < newGrid.cols; c++) {
            bricks.push({
                r: r,
                c: c,
                y: r * (height / newGrid.rows),
                x: c * (width / newGrid.cols),
                width: width / newGrid.cols,
                height: height / newGrid.rows,
                selected: false,
                gemType: GemType.NONE,
                strength: 1,
            });
        }
    }
    newGrid.bricks = bricks;
    grids.push(newGrid);
    selectedGrid = newGrid;


    render();
});

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();

    context.lineWidth = 1;
    context.strokeStyle = '#000000';

    context.fillStyle = '#000000';
    context.fillStyle = '#999999';


    for(let grid of grids) {
        const bricks = grid.bricks;
        for (let brick of bricks) {
            if (brick.selected) {
                context.fillStyle = brickColors[brick.gemType];
            } else {
                context.fillStyle = '';
            }

            context.beginPath();
            context.lineWidth = 1;
            context.rect(brick.x, brick.y, brick.width, brick.height);
            if (brick.selected) {
                context.fill();
                context.stroke();
            }
            if (grid === selectedGrid) {
                context.stroke();
            }
            context.closePath();
        }
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
