// components/Flower/stageConfig.ts
export type StageId = 'seed' | 'sprout' | 'stem' | 'bud' | 'half' | 'bloom'
export type StageDef = {
  id: StageId
  label: string
  min: number
  max: number
  lottie: any // 웹: animationData, 네이티브: source
  png: any
  //웹 폴백 png(웹에서 사용)
  loop?: boolean
  playSfx?: 'bloom' | 'chime'
}

export const STAGES: StageDef[] = [
  {
    id: 'seed',
    label: '씨앗',
    min: 0,
    max: 9,
    lottie: require('@/assets/lottie/seed.json'),
    png: require('@/assets/stage_png/seed.png'),
    loop: true,
  },
  {
    id: 'sprout',
    label: '새싹',
    min: 10,
    max: 29,
    lottie: require('@/assets/lottie/sprout.json'),
    png: require('@/assets/stage_png/sprout.png'),
    loop: true,
  },
  {
    id: 'stem',
    label: '줄기',
    min: 30,
    max: 49,
    lottie: require('@/assets/lottie/stem.json'),
    png: require('@/assets/stage_png/stem.png'),
    loop: true,
  },
  {
    id: 'bud',
    label: '꽃봉오리',
    min: 50,
    max: 69,
    lottie: require('@/assets/lottie/bud.json'),
    png: require('@/assets/stage_png/bud.png'),
    loop: true,
  },
  {
    id: 'half',
    label: '반쯤핀꽃',
    min: 70,
    max: 99,
    lottie: require('@/assets/lottie/half.json'),
    png: require('@/assets/stage_png/half.png'),
    loop: true,
  },
  {
    id: 'bloom',
    label: '개화',
    min: 100,
    max: 100,
    lottie: require('@/assets/lottie/bloom.json'),
    png: require('@/assets/stage_png/bloom.png'),
    loop: false,
    playSfx: 'bloom',
  },
]
