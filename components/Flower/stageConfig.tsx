// components/Flower/stageConfig.ts
export type StageId = 'seed' | 'sprout' | 'stem' | 'bud' | 'half' | 'bloom'

export type StageDef = {
  id: StageId
  label: string
  min: number // 포함
  max: number // 포함
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lottie: any // require(...)
  loop?: boolean
  playSfx?: 'bloom' | 'chime'
}

export const STAGES: StageDef[] = [
  {
    id: 'seed',
    label: '씨앗',
    min: 0,
    max: 0,
    lottie: require('@/assets/lottie/seed.json'),
    loop: true,
  },
  {
    id: 'sprout',
    label: '새싹',
    min: 10,
    max: 29,
    lottie: require('@/assets/lottie/sprout.json'),
    loop: true,
  },
  {
    id: 'stem',
    label: '줄기',
    min: 30,
    max: 49,
    lottie: require('@/assets/lottie/stem.json'),
    loop: true,
  },
  {
    id: 'bud',
    label: '꽃봉오리',
    min: 50,
    max: 69,
    lottie: require('@/assets/lottie/bud.json'),
    loop: true,
  },
  {
    id: 'half',
    label: '반쯤핀꽃',
    min: 70,
    max: 99,
    lottie: require('@/assets/lottie/half.json'),
    loop: true,
  },
  {
    id: 'bloom',
    label: '개화',
    min: 100,
    max: 100,
    lottie: require('@/assets/lottie/bloom.json'),
    loop: false,
    playSfx: 'bloom',
  },
]

/** 누적 pt → StageDef */
export function findStageByPt(pt: number): StageDef {
  // 범위를 벗어난 경우 방어
  if (pt <= 0) return STAGES[0]
  if (pt >= 100) return STAGES[STAGES.length - 1]
  return STAGES.find((s) => pt >= s.min && pt <= s.max) ?? STAGES[0]
}
