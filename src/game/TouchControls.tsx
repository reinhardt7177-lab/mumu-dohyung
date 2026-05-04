import { useState, CSSProperties } from 'react';

// 게임 액션 트리거 (Scene의 keydown 핸들러가 받음)
function trigger(key: string) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(15);
  }
  window.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

interface PressBtnProps {
  label: string;
  onPress: () => void;
  style?: CSSProperties;
  fontSize?: number;
}

function PressBtn({ label, onPress, style, fontSize = 28 }: PressBtnProps) {
  const [pressed, setPressed] = useState(false);
  const handleStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPressed(true);
    onPress();
  };
  const handleEnd = (e: React.PointerEvent) => {
    e.preventDefault();
    setPressed(false);
  };
  return (
    <button
      onPointerDown={handleStart}
      onPointerUp={handleEnd}
      onPointerLeave={handleEnd}
      onPointerCancel={handleEnd}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        ...btnBase,
        ...style,
        fontSize,
        background: pressed
          ? 'rgba(245,216,120,0.45)'
          : (style?.background ?? 'rgba(20,14,8,0.78)'),
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
      }}
    >
      {label}
    </button>
  );
}

// 모바일/태블릿 중심 — 항상 표시. Scene의 캔버스 래퍼 내부에 위치.
export default function TouchControls() {
  return (
    <>
      {/* D-pad (왼쪽 하단 — 게임 영역 안쪽) */}
      <div style={dpadContainer}>
        <PressBtn
          label="↑"
          onPress={() => trigger('ArrowUp')}
          style={{ ...arrowBase, top: 0, left: 56, ...arrowTop }}
        />
        <PressBtn
          label="←"
          onPress={() => trigger('ArrowLeft')}
          style={{ ...arrowBase, top: 56, left: 0, ...arrowSide }}
        />
        <PressBtn
          label="→"
          onPress={() => trigger('ArrowRight')}
          style={{ ...arrowBase, top: 56, left: 112, ...arrowSide }}
        />
        <PressBtn
          label="↓"
          onPress={() => trigger('ArrowDown')}
          style={{ ...arrowBase, top: 112, left: 56, ...arrowBottom }}
        />
        <div style={dpadCenter} />
      </div>

      {/* 액션 버튼 (오른쪽 하단 — 게임 영역 안쪽) */}
      <div style={actionContainer}>
        <PressBtn
          label="다시"
          onPress={() => trigger('r')}
          fontSize={14}
          style={{
            ...actionBase,
            background: 'rgba(168,88,88,0.88)',
          }}
        />
        <PressBtn
          label="메뉴"
          onPress={() => trigger('Escape')}
          fontSize={14}
          style={{
            ...actionBase,
            background: 'rgba(88,104,168,0.88)',
          }}
        />
      </div>
    </>
  );
}

// ────────── 스타일 ──────────
const btnBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(245,216,120,0.55)',
  color: '#f5d878',
  fontWeight: 700,
  cursor: 'pointer',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  touchAction: 'manipulation',
  transition: 'transform 0.05s ease, background 0.1s ease',
  fontFamily: 'inherit',
  padding: 0,
  boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)',
};

// 캔버스 래퍼 내부 absolute 배치
const dpadContainer: CSSProperties = {
  position: 'absolute',
  bottom: '4%',
  left: '2.5%',
  width: 168,
  height: 168,
  zIndex: 100,
  pointerEvents: 'none',
};

const arrowBase: CSSProperties = {
  position: 'absolute',
  width: 56,
  height: 56,
  pointerEvents: 'auto',
};

const arrowTop: CSSProperties = {
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
};
const arrowBottom: CSSProperties = {
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  borderBottomLeftRadius: 16,
  borderBottomRightRadius: 16,
};
const arrowSide: CSSProperties = {
  borderRadius: 12,
};

const dpadCenter: CSSProperties = {
  position: 'absolute',
  top: 60,
  left: 60,
  width: 48,
  height: 48,
  borderRadius: 24,
  background: 'rgba(20,14,8,0.5)',
  border: '1px solid rgba(245,216,120,0.3)',
  pointerEvents: 'none',
};

const actionContainer: CSSProperties = {
  position: 'absolute',
  bottom: '4%',
  right: '2.5%',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  zIndex: 100,
};

const actionBase: CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 28,
  pointerEvents: 'auto',
  color: '#f5e6c8',
  border: '2px solid rgba(245,216,120,0.55)',
};
