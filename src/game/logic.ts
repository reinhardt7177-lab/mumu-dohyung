import type { Stage } from './stages';

export type ShapeKind = 'square' | 'triangle' | 'circle' | 'pentagon';
export type Dir = 'up' | 'down' | 'left' | 'right';

export interface Crate {
  id: number;
  kind: ShapeKind;
  x: number;
  y: number;
  // 학습용 추적: 시작 위치 (밀기 전후 비교)
  startX: number;
  startY: number;
}

export interface Goal {
  kind: ShapeKind;
  x: number;
  y: number;
}

export interface GameState {
  stageId: number;
  cols: number;
  rows: number;
  walls: boolean[][]; // [y][x] true=장애물
  player: { x: number; y: number; facing: Dir };
  crates: Crate[];
  goals: Goal[];
  moves: number;
  pushes: number;
  cleared: boolean;
  // 애니메이션용 (이전 위치)
  anim: {
    playerPrev: { x: number; y: number };
    cratesPrev: Record<number, { x: number; y: number }>;
    progress: number; // 0..1
  };
}

const charToShape: Record<string, ShapeKind> = {
  S: 'square',
  T: 'triangle',
  O: 'circle',
  N: 'pentagon',
};
const goalCharToShape: Record<string, ShapeKind> = {
  s: 'square',
  t: 'triangle',
  o: 'circle',
  n: 'pentagon',
};

export function loadStage(stage: Stage): GameState {
  const rows = stage.grid.length;
  const cols = Math.max(...stage.grid.map((r) => r.length));
  const walls: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );
  let player = { x: 0, y: 0, facing: 'down' as Dir };
  const crates: Crate[] = [];
  const goals: Goal[] = [];
  let id = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = stage.grid[y][x] ?? '.';
      if (ch === '#') walls[y][x] = true;
      else if (ch === 'P') player = { x, y, facing: 'down' };
      else if (ch in charToShape) {
        crates.push({
          id: id++,
          kind: charToShape[ch],
          x,
          y,
          startX: x,
          startY: y,
        });
      } else if (ch in goalCharToShape) {
        goals.push({ kind: goalCharToShape[ch], x, y });
      }
    }
  }

  return {
    stageId: stage.id,
    cols,
    rows,
    walls,
    player,
    crates,
    goals,
    moves: 0,
    pushes: 0,
    cleared: false,
    anim: {
      playerPrev: { x: player.x, y: player.y },
      cratesPrev: Object.fromEntries(
        crates.map((c) => [c.id, { x: c.x, y: c.y }])
      ),
      progress: 1,
    },
  };
}

const DIR_VEC: Record<Dir, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

function inBounds(s: GameState, x: number, y: number): boolean {
  return x >= 0 && x < s.cols && y >= 0 && y < s.rows;
}

function isWall(s: GameState, x: number, y: number): boolean {
  return inBounds(s, x, y) ? s.walls[y][x] : true;
}

function crateAt(s: GameState, x: number, y: number): Crate | undefined {
  return s.crates.find((c) => c.x === x && c.y === y);
}

export function checkCleared(s: GameState): boolean {
  // 모든 골에 같은 종류 화물이 있어야 클리어
  return s.goals.every((g) =>
    s.crates.some((c) => c.x === g.x && c.y === g.y && c.kind === g.kind)
  );
}

export function tryMove(state: GameState, dir: Dir): GameState {
  if (state.cleared) return state;
  const { dx, dy } = DIR_VEC[dir];
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;

  if (!inBounds(state, nx, ny) || isWall(state, nx, ny)) {
    return { ...state, player: { ...state.player, facing: dir } };
  }

  const blocking = crateAt(state, nx, ny);
  let newCrates = state.crates;
  let pushed = false;
  if (blocking) {
    const bx = nx + dx;
    const by = ny + dy;
    if (!inBounds(state, bx, by) || isWall(state, bx, by) || crateAt(state, bx, by)) {
      // 밀 수 없음
      return { ...state, player: { ...state.player, facing: dir } };
    }
    newCrates = state.crates.map((c) =>
      c.id === blocking.id ? { ...c, x: bx, y: by } : c
    );
    pushed = true;
  }

  const next: GameState = {
    ...state,
    player: { x: nx, y: ny, facing: dir },
    crates: newCrates,
    moves: state.moves + 1,
    pushes: state.pushes + (pushed ? 1 : 0),
    anim: {
      playerPrev: { x: state.player.x, y: state.player.y },
      cratesPrev: Object.fromEntries(
        state.crates.map((c) => [c.id, { x: c.x, y: c.y }])
      ),
      progress: 0,
    },
  };
  next.cleared = checkCleared(next);
  return next;
}

export function tickAnim(state: GameState, dt: number): GameState {
  if (state.anim.progress >= 1) return state;
  const next = Math.min(1, state.anim.progress + dt / 0.14); // 0.14s 이동
  return { ...state, anim: { ...state.anim, progress: next } };
}

export function isOnGoal(state: GameState, crate: Crate): boolean {
  return state.goals.some(
    (g) => g.x === crate.x && g.y === crate.y && g.kind === crate.kind
  );
}
