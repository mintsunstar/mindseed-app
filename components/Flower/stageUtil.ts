// components/Flower/stageUtil.ts
export type StageProgress = {
  level: 0 | 1 | 2 | 3 | 4 | 5
  label: string
}

export function calcStageProgress(pt: number): StageProgress {
  const p = Math.max(0, Math.min(100, Number.isFinite(+pt) ? +pt : 0))

  // 최종 UX Flow 기준:
  // 0: 씨앗 / 10~29: 새싹 / 30~49: 줄기 / 50~69: 꽃봉오리 / 70~99: 개화직전 / 100: 개화
  if (p >= 100) return { level: 5, label: '개화(활짝핀꽃)' }
  if (p >= 70) return { level: 4, label: '개화직전' }
  if (p >= 50) return { level: 3, label: '꽃봉오리' }
  if (p >= 30) return { level: 2, label: '줄기' }
  if (p >= 10) return { level: 1, label: '새싹' }
  return { level: 0, label: '씨앗' }
}
