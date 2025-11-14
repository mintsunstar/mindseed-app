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
