export enum GemType {
    BALL_SPEED_INCREASE = 0,
    BALL_SPEED_DECREASE = 1,
    PADDLE_GROW = 2,
    PADDLE_SHRINK = 3,
    NONE = 4,
    MUNITION = 5
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Brick extends Rect {
    color: string;
    hit: boolean;
    gemType: GemType;
    strengths: number; // how many hit to destroy
}

export const brickColors = [];
brickColors[GemType.BALL_SPEED_DECREASE] = 'red';
brickColors[GemType.NONE] = 'grey';
brickColors[GemType.BALL_SPEED_INCREASE] = 'green';
brickColors[GemType.PADDLE_GROW] = 'black';
brickColors[GemType.PADDLE_SHRINK] = 'yellow';
brickColors[GemType.MUNITION] = 'pink';
