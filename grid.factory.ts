export const gridData = {
    rows: 20,
    cols: 20,
    bricks: [
        {
            r: 1,
            c: 17,
            gemType: 2,
            strength: 1,
        },
        {
            r: 2,
            c: 6,
            gemType: 4,
            strength: 1,
        },
        {
            r: 4,
            c: 9,
            gemType: 4,
            strength: 1,
        },
        {
            r: 5,
            c: 4,
            gemType: 4,
            strength: 1,
        },
        {
            r: 6,
            c: 14,
            gemType: 5,
            strength: 1,
        },
        {
            r: 8,
            c: 9,
            gemType: 5,
            strength: 1,
        },
        {
            r: 10,
            c: 2,
            gemType: 4,
            strength: 1,
        },
    ],
};

export const gridData2 = {
    rows: 20,
    cols: 10,
    bricks: [
        {
            r: 4,
            c: 2,
            gemType: 3,
            strength: 1,
        },
        {
            r: 4,
            c: 3,
            gemType: 2,
            strength: 1,
        },
        {
            r: 4,
            c: 4,
            gemType: 1,
            strength: 1,
        },
        {
            r: 4,
            c: 5,
            gemType: 4,
            strength: 1,
        },
        {
            r: 4,
            c: 6,
            gemType: 1,
            strength: 1,
        },
        {
            r: 4,
            c: 7,
            gemType: 4,
            strength: 1,
        },
        {
            r: 5,
            c: 2,
            gemType: 2,
            strength: 1,
        },
        {
            r: 5,
            c: 3,
            gemType: 4,
            strength: 1,
        },
        {
            r: 5,
            c: 4,
            gemType: 2,
            strength: 1,
        },
        {
            r: 5,
            c: 5,
            gemType: 0,
            strength: 1,
        },
        {
            r: 5,
            c: 6,
            gemType: 2,
            strength: 1,
        },
        {
            r: 5,
            c: 7,
            gemType: 3,
            strength: 1,
        },
        {
            r: 6,
            c: 2,
            gemType: 3,
            strength: 1,
        },
        {
            r: 6,
            c: 3,
            gemType: 0,
            strength: 1,
        },
        {
            r: 6,
            c: 4,
            gemType: 4,
            strength: 1,
        },
        {
            r: 6,
            c: 5,
            gemType: 0,
            strength: 1,
        },
        {
            r: 6,
            c: 6,
            gemType: 4,
            strength: 1,
        },
        {
            r: 6,
            c: 7,
            gemType: 2,
            strength: 1,
        },
    ],
};

export function createGridFromData(width, height, data) {
    const w = width / data.cols;
    const h = height / data.rows;
    const bricks = [];

    for (const brick of data.bricks) {
        let b = { ...brick };
        b.width = w;
        b.height = h;
        b.x = w * b.c;
        b.y = h * b.r;
        delete b.r;
        delete b.c;
        bricks.push(b);
    }
    return bricks;
}

export function createGrid(width, height, rows, colums) {
    let w = (width - 200) / colums;
    let h = 20;
    const bricks = [];
    for (let c = 0; c < colums; c++) {
        for (let r = 0; r < rows; r++) {
            const b: any = {
                x: c * w + 100,
                y: r * h + 100,
                width: w,
                height: h,
                hit: false,
            };

            if (c % 2 === 0) {
                b.color = '#ff0000';
                b.hasGem = true;
                b.gemType = 'PADDLE_GROW';
            } else {
                b.color = '#000';
                b.gemType = 'BALL_SPEED';
            }

            bricks.push(b);
        }
    }

    return bricks;
}
