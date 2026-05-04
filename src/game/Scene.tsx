import { useEffect, useRef, useState } from 'react';
import { PX, W, H, px, rect, dither, noise, sprite, shadow } from './pixel';
import {
  CHARACTER_DOWN,
  CHARACTER_COLORS,
  SHAPE_SQUARE,
  SHAPE_TRIANGLE,
  SHAPE_CIRCLE,
  SHAPE_PENTAGON,
  SHAPE_COLORS,
  OBSTACLE_STONE,
  OBSTACLE_COLORS,
} from './sprites';
import {
  GameState,
  loadStage,
  tryMove,
  tickAnim,
  isOnGoal,
  Dir,
} from './logic';
import { STAGES } from './stages';
import { assets, loadAssets } from './assets';
import TouchControls from './TouchControls';

const TILE = 16; // logical px per cell
const SHAPE_MAPS: Record<string, number[][]> = {
  square: SHAPE_SQUARE,
  triangle: SHAPE_TRIANGLE,
  circle: SHAPE_CIRCLE,
  pentagon: SHAPE_PENTAGON,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  life: number;
}

interface Props {
  stageIndex: number;
  onClear: (info: { moves: number; pushes: number }) => void;
  onExit: () => void;
}

export default function Scene({ stageIndex, onClear, onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tickRef = useRef(0);
  const stateRef = useRef<GameState>(loadStage(STAGES[stageIndex]));
  const particlesRef = useRef<Particle[]>([]);
  const clearedRef = useRef(false);
  const lastTimeRef = useRef(performance.now());

  const [, setForce] = useState(0);
  const force = () => setForce((n) => n + 1);

  // 스테이지 변경 시 리셋
  useEffect(() => {
    stateRef.current = loadStage(STAGES[stageIndex]);
    particlesRef.current = [];
    clearedRef.current = false;
    initDustParticles();
    force();
  }, [stageIndex]);

  function initDustParticles() {
    const arr: Particle[] = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.05,
        vy: -0.04 - Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        life: 1,
      });
    }
    particlesRef.current = arr;
  }

  // 키 입력
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (clearedRef.current) {
        // 클리어 후 거의 모든 키로 진행 (모바일 D-패드 / 탭 호환)
        const continueKeys = [
          'Enter', ' ', 'Spacebar',
          'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
          'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
        ];
        if (continueKeys.includes(e.key)) {
          onClear({ moves: stateRef.current.moves, pushes: stateRef.current.pushes });
        }
        return;
      }
      let dir: Dir | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dir = 'up';
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dir = 'down';
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dir = 'left';
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dir = 'right';
      else if (e.key === 'r' || e.key === 'R') {
        stateRef.current = loadStage(STAGES[stageIndex]);
        force();
        return;
      } else if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (dir && stateRef.current.anim.progress >= 1) {
        const next = tryMove(stateRef.current, dir);
        stateRef.current = next;
        if (next.cleared && !clearedRef.current) {
          clearedRef.current = true;
          spawnClearParticles();
        }
        force();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stageIndex, onClear, onExit]);

  function spawnClearParticles() {
    const s = stateRef.current;
    s.goals.forEach((g) => {
      const cx = boardOriginX() + g.x * TILE + TILE / 2;
      const cy = boardOriginY() + g.y * TILE + TILE / 2;
      for (let i = 0; i < 18; i++) {
        const a = (Math.PI * 2 * i) / 18;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * 0.6,
          vy: Math.sin(a) * 0.6 - 0.2,
          phase: Math.random() * Math.PI,
          life: 1,
        });
      }
    });
  }

  function boardOriginX(): number {
    const cols = stateRef.current.cols;
    return Math.floor((W - cols * TILE) / 2);
  }
  function boardOriginY(): number {
    const rows = stateRef.current.rows;
    return Math.floor((H - rows * TILE) / 2) + 8; // 상단 HUD 공간
  }

  // 메인 루프
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    initDustParticles();
    // 에셋 로드 (있는 만큼만, 없으면 폴백)
    loadAssets().then(() => force());

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000);
      lastTimeRef.current = t;
      tickRef.current++;
      stateRef.current = tickAnim(stateRef.current, dt);
      updateParticles(dt);
      draw(ctx);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateParticles(dt: number) {
    const tick = tickRef.current;
    particlesRef.current.forEach((p) => {
      p.x += p.vx + Math.sin(tick * 0.02 + p.phase) * 0.03;
      p.y += p.vy;
      // 클리어 파티클은 중력
      if (Math.abs(p.vx) > 0.3 || Math.abs(p.vy) > 0.3) {
        p.vy += 0.02;
        p.vx *= 0.98;
        p.life -= dt * 0.6;
      }
      // 화면 벗어나면 재배치 (먼지)
      if (p.life <= 0) {
        p.life = 0;
      } else if (Math.abs(p.vx) <= 0.3 && Math.abs(p.vy) <= 0.3) {
        if (p.y < -2) {
          p.y = H + 2;
          p.x = Math.random() * W;
        }
      }
    });
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
  }

  function draw(ctx: CanvasRenderingContext2D) {
    drawBackground(ctx);
    drawBoard(ctx);
    drawGoals(ctx);
    drawCrates(ctx);
    drawPlayer(ctx);
    drawObstacles(ctx);
    drawHUD(ctx);
    drawParticles(ctx);
    drawOverlay(ctx);
    if (clearedRef.current) drawClearBanner(ctx);
  }

  function drawBackground(ctx: CanvasRenderingContext2D) {
    // AI 배경 이미지 있으면 사용
    if (assets.bg) {
      ctx.drawImage(assets.bg, 0, 0, W * PX, H * PX);
      // 게임 영역에 시선 집중을 위해 살짝 어둡게
      ctx.fillStyle = 'rgba(20,12,28,0.18)';
      ctx.fillRect(0, 0, W * PX, H * PX);
      noise(ctx, 0, 0, W, H, 0.015);
      return;
    }
    // 폴백: 코드로 그리기
    const tick = tickRef.current;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * PX * 0.55);
    skyGrad.addColorStop(0, '#d8c896');
    skyGrad.addColorStop(0.5, '#e8d4a0');
    skyGrad.addColorStop(1, '#c4b888');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W * PX, Math.floor(H * PX * 0.55));

    const grassGrad = ctx.createLinearGradient(0, H * PX * 0.55, 0, H * PX);
    grassGrad.addColorStop(0, '#7a9658');
    grassGrad.addColorStop(0.6, '#5a7c44');
    grassGrad.addColorStop(1, '#3d5832');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, Math.floor(H * PX * 0.55), W * PX, Math.ceil(H * PX * 0.45));

    ctx.fillStyle = '#6a7a5c';
    ctx.globalAlpha = 0.5;
    drawHill(ctx, 60, 100, 80);
    drawHill(ctx, 180, 105, 100);
    drawHill(ctx, 300, 98, 70);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#a89878';
    ctx.globalAlpha = 0.55;
    rect(ctx, 30, 100, 3, 18, '#a89878');
    rect(ctx, 28, 99, 7, 2, '#988868');
    rect(ctx, 350, 102, 3, 16, '#a89878');
    rect(ctx, 348, 101, 7, 2, '#988868');
    ctx.globalAlpha = 1;

    for (let i = 0; i < 20; i++) {
      const x = (i * 19 + (tick % 40)) % W;
      const y = 130 + (i % 3) * 15;
      px(ctx, x, y, '#8aa668');
      px(ctx, x + 1, y - 1, '#9ab878');
    }
    noise(ctx, 0, 0, W, H, 0.025);
  }

  function drawHill(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    for (let dy = 0; dy < r * 0.4; dy++) {
      const w = Math.sqrt(1 - dy / (r * 0.4)) * r;
      ctx.fillRect((cx - w) * PX, (cy + dy) * PX, w * 2 * PX, PX);
    }
  }

  function drawBoard(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    const ox = boardOriginX();
    const oy = boardOriginY();
    // 보드를 배경에서 띄우기 위한 보라 그림자 (스킬 가이드: 검정 금지)
    ctx.fillStyle = 'rgba(26,20,40,0.45)';
    ctx.fillRect(
      (ox - 3) * PX,
      (oy - 1) * PX,
      (s.cols * TILE + 6) * PX,
      (s.rows * TILE + 4) * PX
    );
    // 보드 외곽 프레임
    rect(ctx, ox - 1, oy - 1, s.cols * TILE + 2, s.rows * TILE + 2, '#3a2e22');

    // 골 위치 캐싱 (돌 타일로 하이라이트)
    const goalSet = new Set(s.goals.map((g) => `${g.x},${g.y}`));

    for (let y = 0; y < s.rows; y++) {
      for (let x = 0; x < s.cols; x++) {
        const cx = ox + x * TILE;
        const cy = oy + y * TILE;
        const isGoal = goalSet.has(`${x},${y}`);

        // 잔디 ↔ 흙 체크무늬 + 골은 돌 타일
        const tileImg = isGoal
          ? assets.tileStone
          : (x + y) % 2 === 0
            ? assets.tileGrass
            : assets.tileDirt;

        if (tileImg) {
          // 골은 또렷, 잔디·흙은 더 옅게
          ctx.globalAlpha = isGoal ? 0.9 : 0.18;
          ctx.drawImage(tileImg, cx * PX, cy * PX, TILE * PX, TILE * PX);
          ctx.globalAlpha = 1;
        } else {
          // 폴백
          rect(
            ctx,
            cx,
            cy,
            TILE,
            TILE,
            isGoal
              ? '#7c6450'
              : (x + y) % 2 === 0
                ? '#7a9658'
                : '#a89070'
          );
        }
        // 격자선 — 진하게 (셀 경계 명확)
        ctx.fillStyle = 'rgba(20,12,8,0.85)';
        ctx.fillRect(cx * PX, cy * PX, TILE * PX, PX);
        ctx.fillRect(cx * PX, cy * PX, PX, TILE * PX);
      }
    }
    ctx.fillStyle = 'rgba(20,12,8,0.85)';
    ctx.fillRect((ox + s.cols * TILE) * PX - PX, oy * PX, PX, s.rows * TILE * PX);
    ctx.fillRect(ox * PX, (oy + s.rows * TILE) * PX - PX, s.cols * TILE * PX, PX);
  }

  function drawGoals(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    const ox = boardOriginX();
    const oy = boardOriginY();
    s.goals.forEach((g) => {
      const tx = ox + g.x * TILE;
      const ty = oy + g.y * TILE;
      const palette = SHAPE_COLORS[g.kind];
      // 골 색상 헤일로 (도형 종류별 색이 빛남)
      const pulse = 0.45 + Math.sin(tickRef.current * 0.06 + g.x) * 0.18;
      ctx.fillStyle = palette[1];
      ctx.globalAlpha = pulse * 0.35;
      ctx.fillRect(tx * PX, ty * PX, TILE * PX, TILE * PX);
      ctx.globalAlpha = 1;

      // 점선 테두리 (해당 도형 색)
      ctx.fillStyle = palette[2];
      for (let i = 0; i < TILE; i += 2) {
        ctx.fillRect((tx + i) * PX, ty * PX, PX, PX);
        ctx.fillRect((tx + i) * PX, (ty + TILE - 1) * PX, PX, PX);
        ctx.fillRect(tx * PX, (ty + i) * PX, PX, PX);
        ctx.fillRect((tx + TILE - 1) * PX, (ty + i) * PX, PX, PX);
      }

      // 가운데 작은 도형 미리보기 (어떤 도형이 와야 하는지 힌트)
      const previewMap = SHAPE_MAPS[g.kind];
      ctx.globalAlpha = 0.35 + pulse * 0.15;
      sprite(ctx, previewMap, palette, tx, ty);
      ctx.globalAlpha = 1;
    });
  }

  function drawObstacles(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    const ox = boardOriginX();
    const oy = boardOriginY();
    for (let y = 0; y < s.rows; y++) {
      for (let x = 0; x < s.cols; x++) {
        if (s.walls[y][x]) {
          const tx = ox + x * TILE;
          const ty = oy + y * TILE;
          shadow(ctx, tx + TILE / 2, ty + TILE - 1, 5, 0.35);
          sprite(ctx, OBSTACLE_STONE, OBSTACLE_COLORS, tx, ty);
        }
      }
    }
  }

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  function drawCrates(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    const ox = boardOriginX();
    const oy = boardOriginY();
    const t = s.anim.progress;
    s.crates.forEach((c) => {
      const prev = s.anim.cratesPrev[c.id] ?? { x: c.x, y: c.y };
      const ax = lerp(prev.x, c.x, t);
      const ay = lerp(prev.y, c.y, t);
      const tx = ox + ax * TILE;
      const ty = oy + ay * TILE;
      shadow(ctx, tx + TILE / 2, ty + TILE - 1, 5, 0.3);
      const map = SHAPE_MAPS[c.kind];
      const colors = SHAPE_COLORS[c.kind];
      sprite(ctx, map, colors, tx, ty);
      // 골 위에 있으면 빛 효과
      if (isOnGoal(s, c)) {
        const pulse = 0.4 + Math.sin(tickRef.current * 0.1 + c.id) * 0.2;
        ctx.fillStyle = `rgba(255,240,180,${pulse * 0.3})`;
        ctx.fillRect(tx * PX, ty * PX, TILE * PX, TILE * PX);
      }
    });
  }

  function drawPlayer(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    const ox = boardOriginX();
    const oy = boardOriginY();
    const t = s.anim.progress;
    const ax = lerp(s.anim.playerPrev.x, s.player.x, t);
    const ay = lerp(s.anim.playerPrev.y, s.player.y, t);
    const tx = ox + ax * TILE;
    const ty = oy + ay * TILE;
    const bob = Math.round(Math.sin(tickRef.current * 0.08) * 0.5);
    const yOff = s.anim.progress >= 1 ? bob : 0;
    shadow(ctx, tx + TILE / 2, ty + TILE - 1, 4, 0.4);

    // 방향별 이미지 우선 (좌/우는 같은 이미지를 미러링)
    const facing = s.player.facing;
    let img: HTMLImageElement | null = null;
    let mirror = false;
    if (facing === 'down') img = assets.charDown;
    else if (facing === 'up') img = assets.charUp;
    else if (facing === 'right') img = assets.charSide;
    else if (facing === 'left') {
      img = assets.charSide;
      mirror = true;
    }

    if (img) {
      ctx.save();
      if (mirror) {
        ctx.translate((tx + TILE) * PX, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, (ty + yOff) * PX, TILE * PX, TILE * PX);
      } else {
        ctx.drawImage(img, tx * PX, (ty + yOff) * PX, TILE * PX, TILE * PX);
      }
      ctx.restore();
    } else {
      // 폴백: 코드 스프라이트 (정면만)
      sprite(ctx, CHARACTER_DOWN, CHARACTER_COLORS, tx, ty + yOff);
    }

    // facing 방향 표시 (작은 빛 화살표)
    const fx = tx + TILE / 2;
    const fy = ty - 3;
    const arrow: Record<Dir, [number, number]> = {
      up: [0, -2],
      down: [0, 2],
      left: [-2, 0],
      right: [2, 0],
    };
    const [adx, ady] = arrow[facing];
    px(ctx, Math.round(fx + adx), Math.round(fy + ady), 'rgba(255,240,180,0.6)');
  }

  function drawHUD(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    // 상단 패널
    ctx.fillStyle = 'rgba(20,14,8,0.78)';
    ctx.fillRect(0, 0, W * PX, 22 * PX);
    // 상단 가는 골드 라인 (장식)
    ctx.fillStyle = 'rgba(245,216,120,0.35)';
    ctx.fillRect(0, 22 * PX, W * PX, PX);

    // 좌측: 차시·스테이지명
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f5d878';
    ctx.font = `bold ${9 * PX}px "Pretendard","Noto Sans KR",sans-serif`;
    ctx.fillText('🧭 1차시', 6 * PX, 11 * PX);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = `${9 * PX}px "Pretendard","Noto Sans KR",sans-serif`;
    ctx.fillText(STAGES[stageIndex].name, 56 * PX, 11 * PX);

    // 우측: 점수만 (오른쪽 정렬). 조작은 화면 버튼으로.
    ctx.textAlign = 'right';
    ctx.fillStyle = '#c8b890';
    ctx.font = `${8 * PX}px "Pretendard","Noto Sans KR",sans-serif`;
    ctx.fillText(
      `이동 ${s.moves}  ·  민 ${s.pushes}`,
      (W - 6) * PX,
      11 * PX
    );
    ctx.textAlign = 'left';

    // 힌트 (하단)
    ctx.fillStyle = 'rgba(20,14,8,0.78)';
    ctx.fillRect(0, (H - 16) * PX, W * PX, 16 * PX);
    ctx.fillStyle = 'rgba(245,216,120,0.35)';
    ctx.fillRect(0, (H - 16) * PX - PX, W * PX, PX);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = `${7 * PX}px "Pretendard","Noto Sans KR",sans-serif`;
    ctx.fillText('💡 ' + STAGES[stageIndex].hint, 6 * PX, (H - 8) * PX);
  }

  function drawParticles(ctx: CanvasRenderingContext2D) {
    particlesRef.current.forEach((p) => {
      const isClearP = Math.abs(p.vx) > 0.3 || Math.abs(p.vy) > 0.3;
      if (isClearP) {
        ctx.fillStyle = `rgba(255,230,150,${Math.max(0, p.life)})`;
        ctx.fillRect(Math.round(p.x) * PX, Math.round(p.y) * PX, PX, PX);
      } else {
        ctx.fillStyle = 'rgba(255,240,200,0.5)';
        ctx.fillRect(Math.round(p.x) * PX, Math.round(p.y) * PX, PX, PX);
      }
    });
  }

  function drawOverlay(ctx: CanvasRenderingContext2D) {
    // 따뜻한 앰버 톤
    ctx.fillStyle = 'rgba(255,240,180,0.04)';
    ctx.fillRect(0, 0, W * PX, H * PX);
    // 비네팅
    const grad = ctx.createRadialGradient(
      (W * PX) / 2,
      (H * PX) / 2,
      W * PX * 0.3,
      (W * PX) / 2,
      (H * PX) / 2,
      W * PX * 0.7
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(20,12,28,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W * PX, H * PX);
  }

  function drawClearBanner(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    ctx.fillStyle = 'rgba(20,14,8,0.88)';
    ctx.fillRect(28 * PX, 56 * PX, 328 * PX, 104 * PX);
    ctx.fillStyle = '#f5d878';
    ctx.font = `bold ${16 * PX}px "Pretendard","Noto Sans KR",sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🏺 유물 조각 획득!', (W * PX) / 2, 80 * PX);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = `${8 * PX}px "Pretendard","Noto Sans KR",sans-serif`;
    ctx.fillText(
      `${STAGES[stageIndex].name}  ·  이동 ${s.moves}회 · 민 ${s.pushes}회`,
      (W * PX) / 2,
      100 * PX
    );
    // 학습 포인트
    ctx.fillStyle = '#a8c890';
    ctx.font = `${7 * PX}px "Pretendard","Noto Sans KR",sans-serif`;
    const lesson = STAGES[stageIndex].lesson;
    wrapText(ctx, '🌱 ' + lesson, (W * PX) / 2, 122 * PX, 290 * PX, 11 * PX);
    const blink = Math.floor(tickRef.current / 30) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#f5d878';
      ctx.font = `${8 * PX}px "Pretendard","Noto Sans KR",sans-serif`;
      ctx.fillText('👆 화면을 탭하여 계속', (W * PX) / 2, 152 * PX);
    }
    ctx.textAlign = 'left';
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const chars = Array.from(text);
    let line = '';
    let yy = y;
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line.length > 0) {
        ctx.fillText(line, x, yy);
        line = chars[i];
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, yy);
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0a0614',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 게임 영역 (16:9). 가상 컨트롤은 이 영역 내부에 배치 */}
      <div
        style={{
          position: 'relative',
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
        }}
      >
        <canvas
          ref={canvasRef}
          width={W * PX}
          height={H * PX}
          onPointerDown={(e) => {
            // 클리어 배너 떠 있을 때 화면 탭하면 다음 진행
            if (clearedRef.current) {
              e.preventDefault();
              onClear({
                moves: stateRef.current.moves,
                pushes: stateRef.current.pushes,
              });
            }
          }}
          style={{
            imageRendering: 'pixelated',
            display: 'block',
            width: '100%',
            height: '100%',
            touchAction: 'none',
            cursor: 'default',
          }}
        />
        {/* 가상 D-패드 + 액션 버튼 — 게임 영역 안쪽 */}
        <TouchControls />
      </div>
    </div>
  );
}
