import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** ===== 타입 정의 ===== */
export type Emotion = '기쁨' | '슬픔' | '불안' | '분노' | '외로움' | '설렘' | '공허';
export type Category =
  | '일상'
  | '고민'
  | '연애'
  | '회사'
  | '유머'
  | '성장'
  | '자기돌봄'
  | '관계';

export interface RecordItem {
  id: string;
  date: string; // YYYY-MM-DD
  emotion: Emotion;
  content: string;
  isPublic: boolean;
  category?: Category;
  imageUri?: string;
  likes: number;
}

export interface Bloom {
  id: string;
  name: string;
  tagEmotion: Emotion | string;
  date: string;
  likes: number;
  emoji: string;
  note?: string;
}

/** 알림 */
export type NotiType = 'empathy' | 'bloom' | 'streak';
export interface Notification {
  id: string;
  type: NotiType;
  text: string;
  createdAt: string; // ISO
  read: boolean;
}

// 설정 타입
export interface AppSettings {
  notifications: {
    empathy: boolean;     // 공감 알림 ON/OFF
    recordTime?: string;  // 기록 루틴 시간 (예: '21:30')
  };
  mbti?: string;
  lock: {
    enabled: boolean;
    type?: 'biometric' | 'pin';
    pin?: string; // 4자리
  };
    profileImageUri?: string; // 프로필 이미지
}

export interface AppState {
  seedName: string;
  growthPct: number;
  records: RecordItem[];
  blooms: Bloom[];
  settings: AppSettings;

  // 알림
  notifications: Notification[];

  // 공통
  load: () => Promise<void>;
  save: () => Promise<void>;

  // 기록
  addOrUpdateRecord: (
    r: Omit<RecordItem, 'id' | 'likes'> & { id?: string }
  ) => Promise<void>;

  // 씨앗명
  setSeedName: (name: string) => Promise<void>;

  // 알림
  addNotification: (
    n: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => Promise<void>;
  markAllRead: () => Promise<void>;

  // 설정/프로필/내보내기/초기화
  setSettings: (patch: Partial<AppSettings>) => Promise<void>;
  setProfileImage: (uri?: string) => Promise<void>;
  exportRecordsJSON: () => string;
  exportRecordsCSV: () => string;
  clearAll: () => Promise<void>;

  // 기록 관련 메서드
  getRecordByDate: (date: string) => RecordItem | undefined;
  updateRecord: (r: RecordItem) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

const KEY = 'maeumsee_state_v1';

/** ===== 초기 상태 & 구현 ===== */
const initial: AppState = {
 seedName: '봄비',
  growthPct: 10,
  records: [],
  blooms: [],
  settings: {
    notifications: { empathy: true, recordTime: '21:00' },
    mbti: 'INFJ',
    lock: { enabled: false, type: 'pin', pin: undefined },
    profileImageUri: undefined,
  }, 

  // 특정 날짜 기록 조회
  getRecordByDate(date) {
    return this.records.find(r => r.date === date);
  },

  // 기록 전체 필드 업데이트(같은 id 유지)
  async updateRecord(r) {
    const idx = this.records.findIndex(x => x.id === r.id);
    if (idx >= 0) this.records[idx] = r;
    await this.save();
  },

  // 기록 삭제
  async deleteRecord(id) {
    this.records = this.records.filter(r => r.id !== id);
    await this.save();
  },

  notifications: [],

  /** 로드 */
  async load() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 필드 안전 병합
        this.seedName = parsed.seedName ?? this.seedName;
        this.growthPct = parsed.growthPct ?? this.growthPct;
        this.records = parsed.records ?? this.records;
        this.blooms = parsed.blooms ?? this.blooms;
        this.settings = { ...this.settings, ...(parsed.settings ?? {}) };
        this.notifications = parsed.notifications ?? [];
      } else {
        // 데모 데이터
        const d = new Date();
        d.setDate(d.getDate() - 2);
        const dd = d.toISOString().slice(0, 10);
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
        ];
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
        ];
        this.notifications = [
          {
            id: 'n-hello',
            type: 'streak',
            text: '마음씨에 오신 것을 환영해요! 오늘 첫 기록을 남겨보세요.',
            createdAt: new Date().toISOString(),
            read: false,
          },
        ];
      }
    } catch (e) {
      console.warn('load error', e);
    }
  },

  /** 저장 */
  async save() {
    try {
      const { seedName, growthPct, records, blooms, settings, notifications } =
        this;
      await AsyncStorage.setItem(
        KEY,
        JSON.stringify({
          seedName,
          growthPct,
          records,
          blooms,
          settings,
          notifications,
        })
      );
    } catch (e) {
      console.warn('save error', e);
    }
  },

  /** 기록 추가/수정 + 성장/개화 + (옵션) 알림 */
  async addOrUpdateRecord(r) {
    const today = r.date;
    const idx = this.records.findIndex((x) => x.date === today);

    const record: RecordItem = {
      ...r,
      id: r.id || String(Date.now()),
      likes: r.isPublic
        ? idx >= 0
          ? this.records[idx].likes
          : Math.floor(Math.random() * 5)
        : 0,
    };

    if (idx >= 0) this.records[idx] = record;
    else this.records.push(record);

    // 성장 게이지
    const before = this.growthPct;
    this.growthPct = Math.min(100, this.growthPct + 10);

    // 개화 임계치 통과 시 앨범 + 알림
    const thresholds = [25, 50, 75, 100];
    thresholds.forEach((t, i) => {
      if (before < t && this.growthPct >= t) {
        const bloom: Bloom = {
          id: record.id + '-b' + i,
          name: this.seedName,
          tagEmotion: record.emotion,
          date: record.date,
          likes: record.likes,
          emoji: ['🌱', '🌿', '🌼', '🌸', '🌺'][i + 1] || '🌸',
          note: record.content.slice(0, 40),
        };
        this.blooms.push(bloom);

        // 개화 알림
        this.notifications.unshift({
          id: 'noti-' + bloom.id,
          type: 'bloom',
          text: `개화 단계 도달! (${t}%)`,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    });

    // 공개 기록 시 가벼운 안내 알림(데모)
    if (record.isPublic) {
      this.notifications.unshift({
        id: 'noti-pub-' + record.id,
        type: 'empathy',
        text: '공개 기록이 등록됐어요. 공감을 기다려봅시다 💧',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    await this.save();
  },

  /** 씨앗명 수정 */
  async setSeedName(name) {
    this.seedName = name;
    await this.save();
  },

  /** 알림 추가(시뮬레이션/실시간 수신 공용) */
  async addNotification(n) {
    const item: Notification = {
      id: String(Date.now()),
      type: n.type,
      text: n.text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(item);
    await this.save();
  },

  /** 모두 읽음 처리 */
  async markAllRead() {
    this.notifications = this.notifications.map((x) => ({ ...x, read: true }));
    await this.save();
  },

  /** 설정 업데이트 */
  async setSettings(patch) {
    this.settings = { ...this.settings, ...patch,
      // 중첩 객체 notifications/lock도 안전 병합
      notifications: { ...(this.settings.notifications || {}), ...(patch.notifications || {}) },
      lock: { ...(this.settings.lock || {}), ...(patch.lock || {}) },
    };
    await this.save();
  },

  /** 프로필 이미지 경로 저장 */
  async setProfileImage(uri) {
    this.settings = { ...this.settings, profileImageUri: uri };
    await this.save();
  },

  /** 기록 내보내기(JSON) */
  exportRecordsJSON() {
    return JSON.stringify(this.records, null, 2);
  },

  /** 기록 내보내기(CSV) */
  exportRecordsCSV() {
    const header = ['id','date','emotion','content','isPublic','category','likes'];
    const rows = this.records.map(r => [
      r.id,
      r.date,
      r.emotion,
      (r.content ?? '').replace(/\n/g,'\\n').replace(/"/g,'""'),
      r.isPublic ? 'true' : 'false',
      r.category ?? '',
      String(r.likes ?? 0),
    ]);
    const csv = [header, ...rows].map(cols =>
      cols.map(v => /[",\n,]/.test(String(v)) ? `"${String(v)}"` : String(v)).join(',')
    ).join('\n');
    return csv;
  },

  /** 전체 초기화(로그아웃/회원탈퇴용) */
  async clearAll() {
    this.seedName = '봄비';
    this.growthPct = 0;
    this.records = [];
    this.blooms = [];
    this.notifications = [];
    this.settings = {
      notifications: { empathy: true, recordTime: '21:00' },
      mbti: 'INFJ',
      lock: { enabled: false, type: 'pin', pin: undefined },
      profileImageUri: undefined,
    };
    await AsyncStorage.removeItem(KEY);
    await this.save();
  },
};


export const useApp = create<AppState>(() => initial);

// 기존 AppState에 아래 3개를 추가
export interface AppState {
  // ...
  getRecordByDate: (date: string) => RecordItem | undefined;
  updateRecord: (r: RecordItem) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}
