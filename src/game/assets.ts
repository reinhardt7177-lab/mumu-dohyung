// 에셋 로더 — 이미지가 있으면 사용, 없으면 폴백(코드 렌더)
// 사용법:
//   import { assets, loadAssets } from './assets';
//   loadAssets().then(() => { ... });
//   if (assets.bg) ctx.drawImage(assets.bg, 0, 0, ...);

export interface AssetMap {
  bg: HTMLImageElement | null;        // 배경 일러스트 (1536x864 권장)
  tileGrass: HTMLImageElement | null; // 잔디 타일 (64x64 또는 큰 패턴)
  tileDirt: HTMLImageElement | null;  // 흙 타일
  tileStone: HTMLImageElement | null; // 돌 타일 (골 자리용)
  charDown: HTMLImageElement | null;  // 캐릭터 정면 (64x64)
  charUp: HTMLImageElement | null;    // 캐릭터 후면 (64x64)
  charSide: HTMLImageElement | null;  // 캐릭터 옆면 (오른쪽 기준, 좌우 미러링) (64x64)
}

export const assets: AssetMap = {
  bg: null,
  tileGrass: null,
  tileDirt: null,
  tileStone: null,
  charDown: null,
  charUp: null,
  charSide: null,
};

const ASSET_PATHS: Record<keyof AssetMap, string> = {
  bg: '/assets/bg_ancient_field.png',
  tileGrass: '/assets/tile_grass.png',
  tileDirt: '/assets/tile_dirt.png',
  tileStone: '/assets/tile_stone.png',
  charDown: '/assets/char_down.png',
  charUp: '/assets/char_up.png',
  charSide: '/assets/char_side.png',
};

function loadOne(path: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // 에셋 없어도 게임은 동작
    img.src = path;
  });
}

let loadingPromise: Promise<void> | null = null;

export function loadAssets(): Promise<void> {
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const keys = Object.keys(ASSET_PATHS) as (keyof AssetMap)[];
    const results = await Promise.all(keys.map((k) => loadOne(ASSET_PATHS[k])));
    keys.forEach((k, i) => {
      assets[k] = results[i];
    });
  })();
  return loadingPromise;
}
