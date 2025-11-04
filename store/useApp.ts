// store/useApp.ts
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

/* ========= 타입 ========= */
export type Emotion = '기쁨' | '슬픔' | '불안' | '분노' | '외로움' | '설렘' | '공허'

export type Category = '일상' | '고민' | '연애' | '회사' | '유머' | '성장' | '자기돌봄' | '관계'

export interface RecordItem {
  id: string
  date: string // YYYY-MM-DD
  emotion: Emotion
  content: string
  isPublic: boolean
  category?: Category
  imageUri?: string
  likes: number
}

export interface Bloom {
  id: string
  name: string
  tagEmotion: Emotion | string
  date: string
  likes: number
  emoji: string
  note?: string
}

export type NotiType = 'empathy' | 'bloom' | 'streak'
export interface Notification {
  id: string
  type: NotiType
  text: string
  createdAt: string // ISO
  read: boolean
}

export interface AppSettings {
  notifications: {
    empathy: boolean
    recordTime?: string
  }
  mbti?: string
  lock: {
    enabled: boolean
    type?: 'biometric' | 'pin'
    pin?: string
  }
  profileImageUri?: string
  /** 씨앗명 월 1회 제한 체크용 ISO */
  lastSeedEditAt?: string
}

export interface AppState {
  seedName: string
  growthPct: number
  records: RecordItem[]
  blooms: Bloom[]
  settings: AppSettings
  notifications: Notification[]

  load: () => Promise<void>
  save: () => Promise<void>

  addOrUpdateRecord: (r: Omit<RecordItem, 'id' | 'likes'> & { id?: string }) => Promise<void>
  getRecordByDate: (date: string) => RecordItem | undefined
  updateRecord: (r: RecordItem) => Promise<void>
  deleteRecord: (id: string) => Promise<void>

  setSeedName: (name: string) => Promise<void>
  setSeedNameWithLimit: (name: string) => Promise<'ok' | 'blocked' | 'invalid'>

  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>
  markAllRead: () => Promise<void>

  setSettings: (patch: Partial<AppSettings>) => Promise<void>
  setProfileImage: (uri?: string) => Promise<void>

  exportRecordsJSON: () => string
  exportRecordsCSV: () => string
  clearAll: () => Promise<void>

  getGrowthPt: () => number
  getStreakDays: () => number

  /** 같은 id 알림이 이미 있으면 추가하지 않는다 */
  pushNotiOnce: (id: string, payload: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
}

/* ========= 유틸 ========= */

// useApp.ts 상단 근처
const makeId = (prefix = 'noti') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const KEY = 'maeumsee_state_v1'

const ymLocal = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`

function computeGrowthPt(records: Array<{ isPublic: boolean; likes?: number }>) {
  let pt = 0
  for (const r of records) {
    pt += r.isPublic ? 10 : 5
    pt += (r.likes ?? 0) * 2
  }
  return pt
}

function computeStreakDays(records: Array<{ date: string }>) {
  const set = new Set(records.map((r) => r.date))
  const d = new Date()
  let streak = 0
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/* ========= 초기 상태 ========= */
const initial: AppState = {
  seedName: '봄비',
  growthPct: 0,
  records: [],
  blooms: [],
  settings: {
    notifications: { empathy: true, recordTime: '21:00' },
    mbti: 'INFJ',
    lock: { enabled: false, type: 'pin', pin: undefined },
    profileImageUri: undefined,
    lastSeedEditAt: undefined,
  },
  notifications: [],

  /* 파생 셀렉터 */
  getGrowthPt() {
    return computeGrowthPt(this.records)
  },
  getStreakDays() {
    return computeStreakDays(this.records)
  },

  /* 로드/세이브 */
  async load() {
    try {
      const raw = await AsyncStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        this.seedName = parsed.seedName ?? this.seedName
        this.records = parsed.records ?? this.records
        this.blooms = parsed.blooms ?? this.blooms
        this.settings = { ...this.settings, ...(parsed.settings ?? {}) }
        this.notifications = parsed.notifications ?? []
      } else {
        const d = new Date()
        d.setDate(d.getDate() - 2)
        const dd = d.toISOString().slice(0, 10)
        this.records = [
          {
            id: 'seed-1',
            date: dd,
            emotion: '기쁨',
            content: '작은 성취가 있었던 날',
            isPublic: true,
            category: '성장',
            likes: 4,
          },
        ]
        this.blooms = [
          {
            id: 'b-1',
            name: '봄비',
            tagEmotion: '기쁨',
            date: dd,
            likes: 12,
            emoji: '🌸',
            note: '첫 성취의 기쁨',
          },
        ]
        this.notifications = [
          {
            id: 'n-hello',
            type: 'streak',
            text: '마음씨에 오신 것을 환영해요! 오늘 첫 기록을 남겨보세요.',
            createdAt: new Date().toISOString(),
            read: false,
          },
        ]
      }
      this.growthPct = Math.min(100, computeGrowthPt(this.records))
    } catch (e) {
      console.warn('load error', e)
    }
  },

  async save() {
    try {
      this.growthPct = Math.min(100, computeGrowthPt(this.records))
      const { seedName, growthPct, records, blooms, settings, notifications } = this
      await AsyncStorage.setItem(
        KEY,
        JSON.stringify({ seedName, growthPct, records, blooms, settings, notifications })
      )
    } catch (e) {
      console.warn('save error', e)
    }
  },

  /* 기록 관련 */
  getRecordByDate(date) {
    return this.records.find((r) => r.date === date)
  },

  async updateRecord(r) {
    const idx = this.records.findIndex((x) => x.id === r.id)
    if (idx >= 0) this.records[idx] = r
    this.growthPct = Math.min(100, computeGrowthPt(this.records))
    await this.save()
  },

  async deleteRecord(id) {
    this.records = this.records.filter((r) => r.id !== id)
    this.growthPct = Math.min(100, computeGrowthPt(this.records))
    await this.save()
  },

  async addOrUpdateRecord(r) {
    const idx = this.records.findIndex((x) => x.date === r.date)
    const record: RecordItem = {
      ...r,
      id: r.id || String(Date.now()),
      likes: r.isPublic ? (idx >= 0 ? this.records[idx].likes : Math.floor(Math.random() * 5)) : 0,
    }
    const beforePt = computeGrowthPt(this.records)
    if (idx >= 0) this.records[idx] = record
    else this.records.push(record)
    const afterPt = computeGrowthPt(this.records)
    this.growthPct = Math.min(100, afterPt)

    const thresholds = [25, 50, 75, 100]
    thresholds.forEach((t, i) => {
      if (beforePt < t && afterPt >= t) {
        const bloom: Bloom = {
          id: record.id + '-b' + i,
          name: this.seedName,
          tagEmotion: record.emotion,
          date: record.date,
          likes: record.likes,
          emoji: ['🌱', '🌿', '🌼', '🌸', '🌺'][i + 1] || '🌸',
          note: record.content.slice(0, 40),
        }
        this.blooms.push(bloom)
        this.notifications.unshift({
          id: 'noti-' + bloom.id,
          type: 'bloom',
          text: `개화 단계 도달! (${t}pt)`,
          createdAt: new Date().toISOString(),
          read: false,
        })
      }
    })

    if (record.isPublic) {
      this.notifications.unshift({
        id: 'noti-pub-' + record.id,
        type: 'empathy',
        text: '공개 기록이 등록됐어요. 공감을 기다려봅시다 💧',
        createdAt: new Date().toISOString(),
        read: false,
      })
    }
    await this.save()
  },

  /* 씨앗명 월 1회 제한 */
  async setSeedName(name) {
    this.seedName = name
    await this.save()
  },

  async setSeedNameWithLimit(name) {
    const next = (name ?? '').trim()
    if (!next || next.length > 12) return 'invalid'

    const prevISO = this.settings.lastSeedEditAt
    const now = new Date()
    const nowYM = ymLocal(now)
    const prevYM = prevISO ? ymLocal(new Date(prevISO)) : null

    if (prevYM && prevYM === nowYM) return 'blocked'

    this.seedName = next
    this.settings = { ...this.settings, lastSeedEditAt: now.toISOString() }
    await this.save()
    return 'ok'
  },

  /* 알림 */
  async addNotification(n) {
    const item: Notification = {
      id: makeId('noti'), // ← 무조건 유니크
      type: n.type,
      text: n.text,
      createdAt: new Date().toISOString(),
      read: false,
    }
    this.notifications.unshift(item)
    await this.save()
  },

  async markAllRead() {
    this.notifications = this.notifications.map((x) => ({ ...x, read: true }))
    await this.save()
  },

  /** 같은 id 알림이 이미 있으면 추가하지 않는다 */
  pushNotiOnce(id: string, payload: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    if (!this.notifications.some((n) => n.id === id)) {
      this.notifications.unshift({
        id,
        ...payload,
        createdAt: new Date().toISOString(),
        read: false,
      })
    }
  },

  /* 설정/프로필 */
  async setSettings(patch) {
    this.settings = {
      ...this.settings,
      ...patch,
      notifications: {
        ...(this.settings.notifications || {}),
        ...(patch.notifications || {}),
      },
      lock: { ...(this.settings.lock || {}), ...(patch.lock || {}) },
    }
    await this.save()
  },

  async setProfileImage(uri) {
    this.settings = { ...this.settings, profileImageUri: uri }
    await this.save()
  },

  /* 내보내기/초기화 */
  exportRecordsJSON() {
    return JSON.stringify(this.records, null, 2)
  },

  exportRecordsCSV() {
    const header = ['id', 'date', 'emotion', 'content', 'isPublic', 'category', 'likes']
    const rows = this.records.map((r) => [
      r.id,
      r.date,
      r.emotion,
      (r.content ?? '').replace(/\n/g, '\\n').replace(/"/g, '""'),
      r.isPublic ? 'true' : 'false',
      r.category ?? '',
      String(r.likes ?? 0),
    ])
    const csv = [header, ...rows]
      .map((cols) =>
        cols.map((v) => (/[",\n,]/.test(String(v)) ? `"${String(v)}"` : String(v))).join(',')
      )
      .join('\n')
    return csv
  },

  async clearAll() {
    this.seedName = '봄비'
    this.records = []
    this.blooms = []
    this.notifications = []
    this.settings = {
      notifications: { empathy: true, recordTime: '21:00' },
      mbti: 'INFJ',
      lock: { enabled: false, type: 'pin', pin: undefined },
      profileImageUri: undefined,
      lastSeedEditAt: undefined,
    }
    this.growthPct = 0
    await AsyncStorage.removeItem(KEY)
    await this.save()
  },
}

export const useApp = create<AppState>(() => initial)
