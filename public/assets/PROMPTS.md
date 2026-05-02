# 🎨 제미나이 에셋 제작 가이드 (P1 — 7개 이미지)

> 각 에셋마다 **① 프롬프트 → ② 검증 → ③ 후처리 → ④ 저장** 4단계로 정리되어 있습니다.
> PNG 만들면 이 폴더(`public/assets/`)에 정확한 파일명으로 저장 → 브라우저 새로고침 → 자동 반영.
> 이미지 없어도 게임은 코드 폴백으로 동작합니다.

## 🛠️ 공통 도구 (북마크 추천)
| 용도 | 도구 (무료, 웹) |
|---|---|
| 리사이즈 / 자르기 / nearest-neighbor 다운스케일 | https://www.photopea.com |
| 투명 배경 만들기 | https://www.remove.bg |
| 타일 seamless 처리 | Photopea의 `Filter > Other > Offset` 활용 |
| 픽셀화(고해상도→픽셀아트) | https://giventofly.github.io/pixelit/ |

---

# 🌄 ① 배경 — `bg_ancient_field.png` (1536×864)
> **가장 먼저 만들 것.** 한 장만으로 전체 분위기가 바뀝니다. ⭐⭐⭐⭐⭐

### 1) 프롬프트 (제미나이에 그대로 붙여넣기)
```
A Studio Ghibli style watercolor illustration in the manner of My Neighbor Totoro.
A peaceful ancient grassland in late afternoon, viewed from a slight elevation.
Soft rolling hills covered in warm olive-green grass with tiny yellow wildflowers.
In the middle distance: 2 or 3 broken stone pillars covered in moss, the remains
of an ancient civilization, weathered and overgrown. Far background: misty
mountains fading into a dreamy amber sky with soft cumulus clouds catching
golden hour light. Warm color palette: amber, olive, sage green, soft purple
shadows (no pure black). Soft watercolor texture, hand-painted feel, no characters,
no text, no UI elements. Wide cinematic aspect ratio 16:9.
The lower 45% should be open grass field where game tiles will be placed
(keep that area relatively unobstructed and uniform).
```

### 2) 검증 체크리스트
- [ ] 사람·텍스트·UI가 **없음**
- [ ] 따뜻한 톤 (앰버/올리브)
- [ ] **하단 절반**이 비교적 단순 (게임 보드 들어갈 공간)
- [ ] 검정색 그림자 없음 (보랏빛 그림자)

### 3) 후처리
1. **Photopea** 열기 → File > Open → 받은 이미지 열기
2. Image > Image Size → **Width 1536, Height 864** (Resample: Bilinear)
3. File > Export As > PNG

### 4) 저장
- 경로: `public/assets/bg_ancient_field.png`
- 새로고침 → 즉시 반영

### 💡 안 풀릴 때
- 너무 어둡다: "warmer, brighter, more golden afternoon light" 추가
- 사람이 들어간다: "absolutely no humans, no creatures, empty landscape" 강조
- 16:9 비율 안 줌: 이미지 받은 후 Photopea에서 "Crop"으로 16:9 잘라내기

---

# 🌿 ② 잔디 타일 — `tile_grass.png` (64×64)
> 보드의 짝수 칸. 가장 자주 보이는 타일. ⭐⭐⭐⭐

### 1) 프롬프트
```
Top-down pixel art texture tile of soft grass ground, suitable for a 2D RPG game.
Studio Ghibli Totoro inspired. Warm color palette: olive green base,
sage highlights, purple-tinted shadows (no pure black). A few tiny darker grass
tufts scattered, one small yellow wildflower. Hand-drawn pixel art style with
visible chunky pixels, limited 4-5 color palette, no anti-aliasing on edges.
Seamless tileable texture (left edge matches right, top matches bottom).
Square format 1:1. Empty/no characters, no objects, just ground texture.
```

### 2) 검증
- [ ] 정사각형
- [ ] 내용이 단순 (잔디 + 풀잎 1~2개 정도, 너무 많으면 반복 시 이상함)
- [ ] 색감이 따뜻한 올리브
- [ ] 검정 외곽선 없음

### 3) 후처리
1. **Photopea** → 열기
2. **크롭**: Image > Canvas Size → 정사각형으로 (한 변 잘라냄)
3. **다운스케일**: Image > Image Size → Width **64**, Height **64**
   - **Resample: Nearest Neighbor** (← 픽셀 살아남)
4. **Tileable 확인** (선택):
   - Filter > Other > Offset → x=32, y=32, Wrap Around
   - 가운데에 보이는 이음새가 부자연스러우면 같은 색 픽셀로 살짝 칠하기
5. File > Export As > PNG

### 4) 저장
- 경로: `public/assets/tile_grass.png`

---

# 🟫 ③ 흙 타일 — `tile_dirt.png` (64×64)
> 보드의 홀수 칸. 잔디와 체크무늬로 번갈아 배치됨. ⭐⭐⭐⭐

### 1) 프롬프트
```
Top-down pixel art texture tile of warm earthen ground/dirt path, suitable for
a 2D RPG game. Studio Ghibli Totoro inspired. Warm color palette: tan/sandy
brown base, lighter sandy highlights, purple-tinted shadows (no pure black).
A few tiny pebbles, faint hint of grass sprouts at one edge. Hand-drawn pixel
art with visible chunky pixels, limited 4-5 color palette, no anti-aliasing.
Seamless tileable texture. Square format 1:1. Empty ground only.
```

### 2) 검증
- [ ] 잔디 타일과 **톤이 어울림** (둘 나란히 놓아도 어색하지 않게)
- [ ] 너무 어둡지 않음 (모눈 위에서 잘 보일 정도)
- [ ] 단순한 텍스처

### 3) 후처리
- **잔디 타일과 동일** (Photopea → 크롭 → 64×64 nearest-neighbor → Export)

### 4) 저장
- 경로: `public/assets/tile_dirt.png`

---

# 🪨 ④ 돌 타일 (골 자리) — `tile_stone.png` (64×64)
> **유물을 놓을 자리** 표시. 살짝 빛나는 룬 모양이 핵심. ⭐⭐⭐⭐

### 1) 프롬프트
```
Top-down pixel art texture tile of an ancient stone pedestal slab, suitable for
a 2D RPG game. Studio Ghibli Totoro inspired. Warm palette: weathered grey
stone base, moss green highlights at corners, purple-tinted shadows (no pure
black). The center has a clearly visible glowing rune circle in soft amber
yellow — this marks where a relic should be placed. Hand-drawn pixel art with
visible chunky pixels, limited 5-6 color palette, no anti-aliasing.
Square format 1:1. The amber rune at center should be the focal point.
```

### 2) 검증
- [ ] 가운데에 **앰버 색 빛/마크** 명확히 보임 (학생이 골인 줄 알아야 함)
- [ ] 잔디·흙 타일과 색감 호환
- [ ] 정사각형

### 3) 후처리
- 잔디·흙과 동일 (Photopea → 64×64 nearest-neighbor)

### 4) 저장
- 경로: `public/assets/tile_stone.png`

---

# 🧭 ⑤ 캐릭터 정면 — `char_down.png` (64×64, 투명 배경)
> 가장 자주 보이는 방향(시작 시 정면). ⭐⭐⭐

### 1) 프롬프트
```
Pixel art character sprite for a top-down 2D RPG game, viewed from above and
slightly in front (character facing toward camera/down). A young explorer
child in Studio Ghibli Totoro style. Wears: olive green tunic with leather
belt, dark brown shorts, brown leather boots, small brown leather satchel
on the side. Brown messy hair. Simple two-dot eyes (no detailed face — pixel
art style). Arms at sides, calm neutral pose, slight smile. Hand-drawn pixel
art with chunky pixels (effective resolution about 16x16 pixels), limited
6-color palette, no anti-aliasing on outlines. PURE WHITE BACKGROUND for easy
removal later. Centered with padding around the character. Square 1:1.
```

### 2) 검증
- [ ] 정면을 바라보는 자세
- [ ] 흰 배경 (제거 쉽게)
- [ ] 픽셀이 또렷함 (흐릿하면 다시 요청)
- [ ] 옷 색이 올리브 그린 (다른 캐릭터들과 일관성)

### 3) 후처리 (⚠️ 가장 까다로움)
1. **배경 제거**: https://remove.bg 에 업로드 → 다운로드
2. **Photopea** → 열기
3. **정사각형 크롭** (캐릭터 중앙 정렬)
4. **다운스케일**: Image > Image Size → 64×64, **Nearest Neighbor**
5. **외곽선 정리** (선택): 픽셀이 흐릿하면 지우개로 가장자리 한 줄 정리
6. File > Export As > PNG (**투명 유지**)

### 4) 저장
- 경로: `public/assets/char_down.png`

### 💡 안 풀릴 때
- 픽셀이 흐릿: "very chunky pixels, effective 16x16 resolution, blocky" 강조
- 얼굴이 너무 디테일: "no facial details, just two black dots for eyes"
- 너무 어른스럽다: "small child, chibi proportions, big head"

---

# 🚶 ⑥ 캐릭터 후면 — `char_up.png` (64×64, 투명 배경)
> 위로 이동/밀 때 등 보이는 모습. ⭐⭐⭐

### 1) 프롬프트
```
Pixel art character sprite for a top-down 2D RPG game, viewed from BEHIND
(character facing AWAY from camera, walking up). The same young explorer child
as the front view: olive green tunic, brown shorts, brown leather boots,
brown leather satchel on the right hip (visible from behind). Brown messy
hair viewed from the back of the head — no face visible. Arms at sides, calm
pose. Studio Ghibli Totoro style, hand-drawn pixel art with chunky pixels
(effective 16x16 resolution), limited 6-color palette, no anti-aliasing.
PURE WHITE BACKGROUND. Centered with padding. Square 1:1.
IMPORTANT: This is the back view. No face. Show back of head and shoulders.
```

### 2) 검증
- [ ] **얼굴 안 보임** (등이 보여야 함)
- [ ] 정면 캐릭터와 옷 색 동일
- [ ] 가방이 같은 위치
- [ ] 흰 배경

### 3) 후처리
- 정면 캐릭터와 동일 (remove.bg → Photopea → 64×64)

### 4) 저장
- 경로: `public/assets/char_up.png`

### 💡 안 풀릴 때
- AI가 자꾸 얼굴을 그림: "viewed from directly behind, only back of head visible, NO FACE" 반복 강조
- 정면과 다른 옷: 정면 이미지를 함께 첨부하며 "same character as this image, but viewed from behind"

---

# 🚶‍♂️ ⑦ 캐릭터 옆면 (오른쪽 보기) — `char_side.png` (64×64, 투명 배경)
> 좌우 이동 시 사용 (왼쪽은 자동 미러링). ⭐⭐⭐

### 1) 프롬프트
```
Pixel art character sprite for a top-down 2D RPG game, SIDE PROFILE VIEW
(character facing to the RIGHT). The same young explorer child: olive green
tunic, brown shorts, brown leather boots, brown leather satchel visible on
the back/side. Brown messy hair in profile. ONE visible eye (simple black
pixel dot). Slight walking pose with one foot stepping forward. Studio Ghibli
Totoro style, hand-drawn pixel art with chunky pixels (effective 16x16
resolution), limited 6-color palette, no anti-aliasing. PURE WHITE BACKGROUND.
Centered with padding. Square 1:1.
IMPORTANT: Profile/side view, looking right. One eye visible.
```

### 2) 검증
- [ ] **옆모습** (정면이나 후면이 아님)
- [ ] 오른쪽을 봄 (왼쪽 보면 게임에서 자동 미러링되니 오른쪽으로!)
- [ ] 한쪽 눈만 보임
- [ ] 다른 두 캐릭터와 옷·색 일관

### 3) 후처리
- 동일 (remove.bg → Photopea → 64×64)

### 4) 저장
- 경로: `public/assets/char_side.png`

---

## 🚦 추천 작업 순서 & 예상 시간

| 순번 | 에셋 | 예상 소요 | 난이도 |
|---|---|---|---|
| 1 | 배경 | 5분 | ⭐ 쉬움 |
| 2~4 | 타일 3종 | 15분 (5분×3) | ⭐⭐ 보통 |
| 5~7 | 캐릭터 3종 | 30분 (10분×3) | ⭐⭐⭐ 어려움 |
| **합계** | | **약 50분** | |

> **빠른 검증 모드**: 배경(5분) + 정면 캐릭터(10분)만 먼저 만들어서 분위기 확인 → 나머지는 천천히.

---

## ⚠️ 자주 만나는 문제

| 증상 | 해결 |
|---|---|
| 제미나이가 사진처럼 줌 | "PIXEL ART, blocky, chunky pixels, NOT photo, NOT realistic" 강조 |
| 사이즈가 안 맞음 (1024×1024로 줌) | Photopea에서 크롭/리사이즈 (Nearest Neighbor 필수) |
| 캐릭터 배경이 흰색 (투명 아님) | remove.bg 사용 |
| 픽셀이 흐릿함 | "16×16 pixel resolution, very chunky, blocky pixels" 강조 후 재생성 |
| 캐릭터들이 서로 안 닮음 | 첫 캐릭터 이미지를 다음 프롬프트에 첨부 |
| 타일이 반복 시 이음새 보임 | Photopea > Filter > Other > Offset 으로 확인 후 보정 |

---

## 📋 최종 파일 매니페스트

이 폴더에 들어가야 할 PNG 7개:

```
public/assets/
├── bg_ancient_field.png   (1536×864)
├── tile_grass.png         (64×64)
├── tile_dirt.png          (64×64)
├── tile_stone.png         (64×64)
├── char_down.png          (64×64, 투명 배경)
├── char_up.png            (64×64, 투명 배경)
└── char_side.png          (64×64, 투명 배경)
```

만든 만큼 게임에 반영됩니다 — 7개 다 안 만들어도 OK.
