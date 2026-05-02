// 지브리 픽셀 월드 스킬 표준 헬퍼

export const PX = 4;
export const W = 384;
export const H = 216;

export const px = (ctx: CanvasRenderingContext2D, x: number, y: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(x * PX, y * PX, PX, PX);
};

export const rect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: string
) => {
  ctx.fillStyle = c;
  ctx.fillRect(x * PX, y * PX, w * PX, h * PX);
};

export const dither = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cA: string,
  cB: string
) => {
  [
    [cA, cB],
    [cB, cA],
  ].forEach((row, dy) =>
    row.forEach((c, dx) => {
      ctx.fillStyle = c;
      ctx.fillRect((x + dx) * PX, (y + dy) * PX, PX, PX);
    })
  );
};

export const noise = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  i = 0.04
) => {
  for (let ny = 0; ny < h; ny++) {
    for (let nx = 0; nx < w; nx++) {
      if (Math.random() < i) {
        const b = Math.random() < 0.5 ? 16 : -12;
        ctx.fillStyle =
          b > 0
            ? `rgba(255,240,200,${b / 255})`
            : `rgba(10,6,20,${Math.abs(b) / 255})`;
        ctx.fillRect((x + nx) * PX, (y + ny) * PX, PX, PX);
      }
    }
  }
};

export const glow = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  col: string,
  alpha: number
) => {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r) continue;
      ctx.fillStyle = `${col}${alpha * (1 - d / r)})`;
      ctx.fillRect((cx + dx) * PX, (cy + dy) * PX, PX, PX);
    }
  }
};

export const shadow = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  r = 5,
  a = 0.3
) => {
  ctx.fillStyle = '#1a1428';
  ctx.globalAlpha = a;
  for (let i = -r; i <= r; i++) {
    const t = Math.abs(i) < r * 0.5 ? 3 : Math.abs(i) < r * 0.8 ? 2 : 1;
    ctx.fillRect((cx + i) * PX, y * PX, PX, t * PX);
  }
  ctx.globalAlpha = 1;
};

export const sprite = (
  ctx: CanvasRenderingContext2D,
  map: number[][],
  colors: Record<number, string>,
  ox: number,
  oy: number
) => {
  map.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell && colors[cell]) {
        ctx.fillStyle = colors[cell];
        ctx.fillRect((x + ox) * PX, (y + oy) * PX, PX, PX);
      }
    })
  );
};
