
export const gridData2 = {
  grids: [
    {
      rows: 20,
      cols: 20,
      bricks: [
        {
          r: 2,
          c: 14,
          gemType: 4,
          strength: 1,
        },
        {
          r: 3,
          c: 4,
          gemType: 4,
          strength: 1,
        },
        {
          r: 5,
          c: 7,
          gemType: 4,
          strength: 1,
        },
        {
          r: 9,
          c: 15,
          gemType: 4,
          strength: 1,
        },
        {
          r: 11,
          c: 9,
          gemType: 4,
          strength: 1,
        },
      ],
    },
    {
      rows: 10,
      cols: 10,
      bricks: [
        {
          r: 0,
          c: 3,
          gemType: 4,
          strength: 1,
        },
        {
          r: 1,
          c: 9,
          gemType: 4,
          strength: 1,
        },
        {
          r: 3,
          c: 6,
          gemType: 4,
          strength: 1,
        },
        {
          r: 4,
          c: 0,
          gemType: 4,
          strength: 1,
        },
      ],
    },
  ],
};

export const gridData = gridData2;


export function createGridFromData(width, height, data) {
  const bricks = [];

  for (let g of data.grids) {
    const w = width / g.cols;
    const h = height / g.rows;

    for (const brick of g.bricks) {
      let b = { ...brick };
      b.width = w;
      b.height = h;
      b.x = w * b.c;
      b.y = h * b.r;
      delete b.r;
      delete b.c;
      bricks.push(b);
    }
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
        b.color = "#ff0000";
        b.hasGem = true;
        b.gemType = "PADDLE_GROW";
      } else {
        b.color = "#000";
        b.gemType = "BALL_SPEED";
      }

      bricks.push(b);
    }
  }

  return bricks;
}

export const levelData = [gridData, gridData2];
