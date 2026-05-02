import { useState } from 'react';
import Scene from './game/Scene';
import { STAGES } from './game/stages';

type View = 'intro' | 'select' | 'play' | 'finale';

interface ClearedRecord {
  moves: number;
  pushes: number;
}

export default function App() {
  const [view, setView] = useState<View>('intro');
  const [stageIndex, setStageIndex] = useState(0);
  const [cleared, setCleared] = useState<Record<number, ClearedRecord>>({});

  function startStage(i: number) {
    setStageIndex(i);
    setView('play');
  }

  function onClear(info: ClearedRecord) {
    const id = STAGES[stageIndex].id;
    setCleared((prev) => ({ ...prev, [id]: info }));
    if (stageIndex >= STAGES.length - 1) {
      setView('finale');
    } else {
      setStageIndex(stageIndex + 1);
      setView('select');
    }
  }

  if (view === 'intro') return <Intro onStart={() => setView('select')} />;
  if (view === 'select')
    return (
      <StageSelect
        cleared={cleared}
        onPick={startStage}
        onBack={() => setView('intro')}
      />
    );
  if (view === 'finale')
    return (
      <Finale
        cleared={cleared}
        onAgain={() => {
          setCleared({});
          setStageIndex(0);
          setView('select');
        }}
      />
    );
  return (
    <Scene
      stageIndex={stageIndex}
      onClear={onClear}
      onExit={() => setView('select')}
    />
  );
}

// ─────────────────────────────────────────────
// 인트로
// ─────────────────────────────────────────────
function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 14, color: '#c8b890', letterSpacing: 4 }}>
          기하 탐험대 1차시
        </div>
        <h1
          style={{
            fontSize: 48,
            margin: '16px 0 8px',
            color: '#f5d878',
            textShadow: '0 0 12px rgba(245,216,120,0.4)',
          }}
        >
          🧭 화물 운송 대작전
        </h1>
        <div style={{ fontSize: 18, color: '#e8d4a0', marginBottom: 32 }}>
          평면도형의 평행이동 — 모양은 그대로, 위치만 바뀐다
        </div>
        <div
          style={{
            background: 'rgba(20,14,8,0.5)',
            padding: 24,
            borderRadius: 12,
            color: '#e8d4a0',
            lineHeight: 1.8,
            fontSize: 15,
            textAlign: 'left',
            maxWidth: 560,
          }}
        >
          <div style={{ color: '#f5d878', fontWeight: 700, marginBottom: 8 }}>
            📜 임무 보고
          </div>
          사악한 마법사가 고대 기하 대륙의 유물(도형)들을 흩뿌렸다.
          <br />
          탐험대원이여, 화물(도형)을 정해진 자리로 운송하라.
          <br />
          <br />
          <span style={{ color: '#a8c890' }}>
            🎯 학습 목표: 도형을 밀어도 모양과 크기는 변하지 않고 위치만 바뀜을 발견하기
          </span>
        </div>
        <button style={btnStyle} onClick={onStart}>
          ▶ 시작하기
        </button>
        <div style={{ marginTop: 16, fontSize: 12, color: '#8a7860' }}>
          조작: ↑↓←→ 이동 / R 다시하기 / ESC 메뉴
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 스테이지 선택
// ─────────────────────────────────────────────
function StageSelect({
  cleared,
  onPick,
  onBack,
}: {
  cleared: Record<number, ClearedRecord>;
  onPick: (i: number) => void;
  onBack: () => void;
}) {
  const totalCleared = Object.keys(cleared).length;
  const total = STAGES.length;

  // 티어별 색상 (5티어)
  const tierStyle: Record<string, { color: string; label: string }> = {
    A: { color: '#a8c890', label: '기초' },
    B: { color: '#c8c478', label: '방향조합' },
    C: { color: '#c8a878', label: '장애물' },
    D: { color: '#c87878', label: '다화물' },
    E: { color: '#a878c8', label: '마스터' },
  };

  return (
    <div style={pageStyle}>
      <div style={{ ...cardStyle, maxWidth: 920 }}>
        <div style={{ fontSize: 12, color: '#c8b890', letterSpacing: 3 }}>
          STAGE SELECT
        </div>
        <h2 style={{ fontSize: 28, color: '#f5d878', margin: '8px 0 8px' }}>
          🗺 운송 미션
        </h2>
        <div
          style={{
            fontSize: 13,
            color: '#c8b890',
            marginBottom: 20,
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(tierStyle).map(([k, t]) => (
            <span key={k} style={{ color: t.color }}>
              ● 티어 {k} {t.label}
            </span>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
            width: '100%',
          }}
        >
          {STAGES.map((s, i) => {
            const c = cleared[s.id];
            const locked = i > 0 && !cleared[STAGES[i - 1].id];
            const tier = tierStyle[s.tier];
            return (
              <button
                key={s.id}
                disabled={locked}
                onClick={() => onPick(i)}
                style={{
                  ...stageBtnStyle,
                  opacity: locked ? 0.4 : 1,
                  cursor: locked ? 'not-allowed' : 'pointer',
                  borderColor: c ? '#f5d878' : tier.color + '66',
                  background: c
                    ? 'rgba(245,216,120,0.15)'
                    : 'rgba(20,14,8,0.55)',
                  position: 'relative',
                  padding: '14px 6px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 6,
                    fontSize: 9,
                    color: tier.color,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {s.tier}
                </div>
                <div style={{ fontSize: 26, marginBottom: 2 }}>
                  {c ? '🏺' : locked ? '🔒' : '📦'}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#f5e6c8',
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  {s.id}. {s.name}
                </div>
                {c && (
                  <div
                    style={{
                      fontSize: 10,
                      color: '#a8c890',
                      marginTop: 4,
                    }}
                  >
                    ✓ {c.moves}이동/{c.pushes}민
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 20, color: '#c8b890', fontSize: 14 }}>
          🏺 유물 조각 <b style={{ color: '#f5d878' }}>{totalCleared}</b>/{total}
        </div>
        <button
          style={{ ...btnStyle, marginTop: 12, fontSize: 14, padding: '8px 16px' }}
          onClick={onBack}
        >
          ← 인트로로
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 엔딩 (5스테이지 완료)
// ─────────────────────────────────────────────
function Finale({
  cleared,
  onAgain,
}: {
  cleared: Record<number, ClearedRecord>;
  onAgain: () => void;
}) {
  const totalMoves = Object.values(cleared).reduce(
    (s, r) => s + r.moves,
    0
  );
  const totalPushes = Object.values(cleared).reduce(
    (s, r) => s + r.pushes,
    0
  );
  const total = STAGES.length;
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
        <h1 style={{ color: '#f5d878', fontSize: 36, margin: '0 0 12px' }}>
          1차시 완료!
        </h1>
        <div style={{ color: '#e8d4a0', fontSize: 18, marginBottom: 24 }}>
          {total}개 미션 모두 클리어 — 진정한 기하 탐험대!
        </div>
        <div
          style={{
            background: 'rgba(20,14,8,0.55)',
            padding: 24,
            borderRadius: 12,
            color: '#e8d4a0',
            lineHeight: 1.8,
            fontSize: 15,
            textAlign: 'left',
            maxWidth: 560,
          }}
        >
          <div style={{ color: '#a8c890', fontWeight: 700, marginBottom: 8 }}>
            🌱 발견한 사실
          </div>
          도형을 어느 방향으로 얼마나 밀어도{' '}
          <b style={{ color: '#f5d878' }}>모양과 크기는 변하지 않았다</b>.<br />
          오직 <b style={{ color: '#f5d878' }}>위치만 바뀌었다</b>.<br />
          <br />
          이것이 바로 <b style={{ color: '#a8c8e8' }}>평행이동(밀기)</b>이다.
          <br />
          <br />
          <div style={{ color: '#c8b890', fontSize: 13 }}>
            🏺 유물 조각 {total}/{total} · 누적 이동 {totalMoves}회 · 민 {totalPushes}회
          </div>
        </div>
        <button style={btnStyle} onClick={onAgain}>
          🔁 다시 도전
        </button>
        <div style={{ marginTop: 12, color: '#8a7860', fontSize: 12 }}>
          다음 차시: [뒤집기] 거울의 성 탈출
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 공통 스타일
// ─────────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  width: '100vw',
  minHeight: '100vh',
  // 수채화 배경 + 어두운 그라데이션 오버레이 (글자 가독성)
  background:
    'radial-gradient(ellipse at center, rgba(42,31,58,0.55) 0%, rgba(10,6,20,0.85) 80%), url(/assets/bg_ancient_field.png) center/cover no-repeat',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(40,28,52,0.7)',
  border: '2px solid rgba(245,216,120,0.25)',
  borderRadius: 16,
  padding: '36px 40px',
  textAlign: 'center',
  color: '#f5e6c8',
  boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
  maxWidth: 640,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const btnStyle: React.CSSProperties = {
  marginTop: 24,
  padding: '14px 40px',
  fontSize: 18,
  fontWeight: 700,
  background:
    'linear-gradient(180deg, #f5d878 0%, #c89c40 100%)',
  color: '#2a1f0a',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 10,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  letterSpacing: 2,
};

const stageBtnStyle: React.CSSProperties = {
  padding: '16px 8px',
  border: '2px solid rgba(245,216,120,0.3)',
  borderRadius: 10,
  color: '#f5e6c8',
  background: 'rgba(20,14,8,0.5)',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: 'inherit',
};
