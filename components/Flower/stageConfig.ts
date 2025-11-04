// components/Flower/stageConfig.ts
export type StageId = 'seed' | 'sprout' | 'stem' | 'bud' | 'half' | 'bloom'
export type StageDef = {
  id: StageId
  label: string
  min: number
  max: number
  lottie: any // 웹: animationData, 네이티브: source
  loop?: boolean
}

/** ← 정적 import (require 대신 import 사용) */
import seedJson from '@/assets/lottie/seed.json'
import sproutJson from '@/assets/lottie/sprout.json'
import stemJson from '@/assets/lottie/stem.json'
import budJson from '@/assets/lottie/bud.json'
import halfJson from '@/assets/lottie/half.json'
import bloomJson from '@/assets/lottie/bloom.json'

export const STAGES: StageDef[] = [
  { id: 'seed', label: '씨앗', min: 0, max: 9, lottie: seedJson, loop: true },
  { id: 'sprout', label: '새싹', min: 10, max: 29, lottie: sproutJson, loop: true },
  { id: 'stem', label: '줄기', min: 30, max: 49, lottie: stemJson, loop: true },
  { id: 'bud', label: '꽃봉오리', min: 50, max: 69, lottie: budJson, loop: true },
  { id: 'half', label: '반쯤핀꽃', min: 70, max: 99, lottie: halfJson, loop: true },
  { id: 'bloom', label: '개화', min: 100, max: 100, lottie: bloomJson, loop: false },
]
