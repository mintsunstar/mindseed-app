export type StageKey = 'seed' | 'sprout' | 'stem' | 'bud' | 'half' | 'bloom'

export const STAGE_LABEL: Record<StageKey, string> = {
  seed: '씨앗',
  sprout: '새싹',
  stem: '줄기',
  bud: '꽃봉오리',
  half: '반쯤 핀 꽃',
  bloom: '개화',
}

export function progressToStageKey(p: number): StageKey {
  const v = Math.max(0, Math.min(100, Math.floor(p)))
  if (v >= 100) return 'bloom'
  if (v >= 70) return 'half'
  if (v >= 50) return 'bud'
  if (v >= 30) return 'stem'
  if (v >= 10) return 'sprout'
  return 'seed'
}

export const STAGE_IMAGE: Record<StageKey, any> = {
  seed: require('../../assets/flowers/seed.png'),
  sprout: require('../../assets/flowers/sprout.png'),
  stem: require('../../assets/flowers/stem.png'),
  bud: require('../../assets/flowers/bud.png'),
  half: require('../../assets/flowers/half.png'),
  bloom: require('../../assets/flowers/bloom.png'),
}
