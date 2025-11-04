// components/Flower/stageConfig.ts
import { ImageSourcePropType } from 'react-native'

export type StageId = 'seed' | 'sprout' | 'stem' | 'bud' | 'half' | 'bloom'

export interface StageDef {
  id: StageId
  label: string
  min: number
  max: number
  img: ImageSourcePropType
}

export const STAGES: StageDef[] = [
  {
    id: 'seed',
    label: '씨앗',
    min: 0,
    max: 9,
    img: require('@/assets/stages/seed.png'),
  },
  {
    id: 'sprout',
    label: '새싹',
    min: 10,
    max: 29,
    img: require('@/assets/stages/sprout.png'),
  },
  {
    id: 'stem',
    label: '줄기',
    min: 30,
    max: 49,
    img: require('@/assets/stages/stem.png'),
  },
  {
    id: 'bud',
    label: '꽃봉오리',
    min: 50,
    max: 69,
    img: require('@/assets/stages/bud.png'),
  },
  {
    id: 'half',
    label: '반쯤 핀 꽃',
    min: 70,
    max: 89,
    img: require('@/assets/stages/half.png'),
  },
  {
    id: 'bloom',
    label: '개화',
    min: 90,
    max: 100,
    img: require('@/assets/stages/bloom.png'),
  },
]
