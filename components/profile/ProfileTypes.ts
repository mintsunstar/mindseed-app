// components/profile/ProfileTypes.ts
export type ProfileStats = {
  totalRecords: number
  totalLikes: number
  totalBlooms: number
}

export type ProfileData = {
  nickname: string
  mbti?: string
  seedName?: string
  intro?: string
  stats: ProfileStats
}
// components/profile/ProfileTypes.ts
export type MenuItem = {
  id?: string // ✅ 추가 (key로 쓰기 좋게)
  label: string
  icon: string
  description?: string
  danger?: boolean
  onPress: () => void
}
