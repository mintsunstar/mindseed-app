import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Switch, Alert,
  Platform, Modal, FlatList, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Card from '@/components/Card';
import Section from '@/components/Section';
import { useApp, Bloom } from '@/store/useApp';

function downloadWeb(filename: string, content: string, mime = 'text/plain') {
  if (Platform.OS !== 'web') {
    Alert.alert('모바일 앱에서 제공됩니다.');
    return;
  }
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function My() {
  const app = useApp();
  useEffect(() => { app.load(); }, []);

  const posts = app.records.length;
  const likes = app.records.reduce((a, r) => a + (r.likes || 0), 0);

  // MBTI 편집
  const [editingMBTI, setEditingMBTI] = useState(false);
  const [mbti, setMbti] = useState(app.settings.mbti ?? '');
  useEffect(() => setMbti(app.settings.mbti ?? ''), [app.settings.mbti]);

  // 앨범 필터/상세
  const [filter, setFilter] = useState<'latest' | 'likes'>('latest');
  const blooms = useMemo(() => {
    const arr = app.blooms.slice();
    if (filter === 'latest') return arr.sort((a, b) => b.date.localeCompare(a.date));
    return arr.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
  }, [app.blooms, filter]);
  const [detail, setDetail] = useState<Bloom | null>(null);

  return (
    <View style={s.container}>
      {/* 1. 프로필: 이미지/MBTI/카운트 */}
      <Card>
        <Section title="프로필" subtitle="이미지 · MBTI · 알림설정">
          <View style={s.profileRow}>
            <Pressable
              onPress={async () => {
                try {
                  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!perm.granted) return Alert.alert('사진 접근 권한이 필요해요.');
                  const res = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8
                  });
                  if (!res.canceled && res.assets?.[0]?.uri) {
                    await app.setProfileImage(res.assets[0].uri);
                  }
                } catch (e) { Alert.alert('이미지 선택 오류', String(e)); }
              }}
            >
              <View style={s.avatarWrap}>
                {app.settings.profileImageUri ? (
                  <Image source={{ uri: app.settings.profileImageUri }} style={s.avatarImg}/>
                ) : (<View style={s.avatar}/>)}
                <Text style={s.change}>이미지 변경</Text>
              </View>
            </Pressable>

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: '900', marginBottom: 4 }}>{app.seedName}</Text>

              {!editingMBTI ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text>MBTI: <Text style={{ fontWeight:'800' }}>{app.settings.mbti ?? '-'}</Text></Text>
                  <Pressable onPress={() => setEditingMBTI(true)}><Text>✏️</Text></Pressable>
                </View>
              ) : (
                <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <TextInput style={s.input} placeholder="MBTI (예: INFJ)" value={mbti}
                    onChangeText={setMbti} autoCapitalize="characters" maxLength={4}/>
                  <Pressable style={s.btn} onPress={async()=>{
                    await app.setSettings({ mbti: mbti.toUpperCase() }); setEditingMBTI(false);
                  }}><Text style={s.btnTxt}>저장</Text></Pressable>
                  <Pressable style={[s.btn, s.ghost]} onPress={()=>{
                    setMbti(app.settings.mbti ?? ''); setEditingMBTI(false);
                  }}><Text>취소</Text></Pressable>
                </View>
              )}

              <View style={{ flexDirection:'row', gap:10, marginTop:6 }}>
                <Text>기록 {posts}</Text>
                <Text>공감 {likes}</Text>
              </View>
            </View>
          </View>

          {/* 2. 알림 설정: 공감 알림 + 기록 루틴 시간 */}
          <View style={s.row}>
            <Text style={s.label}>공감 알림</Text>
            <Switch
              value={app.settings.notifications.empathy}
              onValueChange={v =>
                app.setSettings({ notifications: { ...app.settings.notifications, empathy: v } })
              }
            />
          </View>
          <View style={s.row}>
            <Text style={s.label}>기록 루틴 시간</Text>
            <TextInput
              style={[s.input, { width: 100, textAlign:'center' }]}
              placeholder="21:00"
              value={app.settings.notifications.recordTime ?? ''}
              onChangeText={t =>
                app.setSettings({ notifications: { ...app.settings.notifications, recordTime: t } })
              }
            />
          </View>
        </Section>
      </Card>

      {/* 3. 감정꽃 앨범: 필터/썸네일/상세/공유/PNG저장 안내 */}
      <Card>
        <Section title="감정꽃 앨범" subtitle="개화한 꽃 모아보기">
          <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
            <Pressable onPress={()=>setFilter('latest')} style={[s.chip, filter==='latest'&&s.chipOn]}>
              <Text style={[s.chipTxt, filter==='latest'&&s.chipOnTxt]}>최신순</Text>
            </Pressable>
            <Pressable onPress={()=>setFilter('likes')} style={[s.chip, filter==='likes'&&s.chipOn]}>
              <Text style={[s.chipTxt, filter==='likes'&&s.chipOnTxt]}>공감순</Text>
            </Pressable>
          </View>

          {blooms.length ? (
            <FlatList
              data={blooms}
              keyExtractor={(b)=>b.id}
              horizontal
              ItemSeparatorComponent={()=> <View style={{width:10}}/>}
              showsHorizontalScrollIndicator={false}
              renderItem={({item})=>(
                <View style={s.thumb}>
                  <Text style={{ fontSize:24 }}>{item.emoji}</Text>
                  <Text style={{ fontWeight:'800' }}>{item.name}</Text>
                  <Text style={{ color:'#666', fontSize:12 }}>
                    {item.date} · {item.tagEmotion} · 💧 {item.likes}
                  </Text>
                  <View style={{ flexDirection:'row', gap:6, marginTop:6 }}>
                    <Pressable style={s.btn} onPress={()=>Alert.alert('PNG 저장','스토어 빌드에서 제공 예정')}>
                      <Text style={s.btnTxt}>PNG 저장</Text>
                    </Pressable>
                    <Pressable style={s.btn} onPress={()=>{
                      const body = encodeURIComponent(`${item.name}\n${item.date}\n감정:${item.tagEmotion}\n공감:${item.likes}\n${item.note ?? ''}`);
                      if (Platform.OS==='web') location.href = `mailto:?subject=${encodeURIComponent('[마음씨] 감정꽃 공유')}&body=${body}`;
                      else Alert.alert('공유', '메일 앱이 열립니다.');
                    }}>
                      <Text style={s.btnTxt}>공유</Text>
                    </Pressable>
                    <Pressable style={[s.btn, s.ghost]} onPress={()=>setDetail(item)}>
                      <Text>상세</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          ) : <Text style={{color:'#666'}}>아직 개화된 꽃이 없어요.</Text>}

          {/* 상세 모달 */}
          <Modal visible={!!detail} transparent animationType="fade" onRequestClose={()=>setDetail(null)}>
            <View style={s.backdrop}>
              <View style={s.detail}>
                {detail && (
                  <>
                    <Text style={{ fontSize:28, textAlign:'center' }}>{detail.emoji}</Text>
                    <Text style={s.h3}>{detail.name}</Text>
                    <Text style={{ color:'#666', marginBottom:6 }}>
                      {detail.date} · 태그 {detail.tagEmotion} · 💧 {detail.likes}
                    </Text>
                    {!!detail.note && <Text style={{ marginBottom:10 }}>메모: {detail.note}</Text>}
                    <View style={{ flexDirection:'row', gap:8, justifyContent:'flex-end' }}>
                      <Pressable style={s.btn} onPress={()=>Alert.alert('PNG 저장','스토어 빌드에서 제공 예정')}>
                        <Text style={s.btnTxt}>PNG 저장</Text>
                      </Pressable>
                      <Pressable style={s.btn} onPress={()=>{
                        const body = encodeURIComponent(`${detail.name}\n${detail.date}\n감정:${detail.tagEmotion}\n공감:${detail.likes}\n${detail.note ?? ''}`);
                        if (Platform.OS==='web') location.href = `mailto:?subject=${encodeURIComponent('[마음씨] 감정꽃 공유')}&body=${body}`;
                        else Alert.alert('공유', '메일 앱이 열립니다.');
                      }}>
                        <Text style={s.btnTxt}>공유</Text>
                      </Pressable>
                      <Pressable style={[s.btn, s.ghost]} onPress={()=>setDetail(null)}>
                        <Text>닫기</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </Section>
      </Card>

      {/* 4. 감정기록 모아보기: JSON/CSV 내려받기 */}
      <Card>
        <Section title="감정기록 모아보기" subtitle="JSON/CSV 내려받기">
          <View style={{ flexDirection:'row', gap:8, justifyContent:'flex-end' }}>
            <Pressable style={s.btn} onPress={()=>downloadWeb('maeumsee-records.json', app.exportRecordsJSON(), 'application/json')}>
              <Text style={s.btnTxt}>JSON 내려받기</Text>
            </Pressable>
            <Pressable style={s.btn} onPress={()=>downloadWeb('maeumsee-records.csv', app.exportRecordsCSV(), 'text/csv')}>
              <Text style={s.btnTxt}>CSV 내려받기</Text>
            </Pressable>
          </View>
        </Section>
      </Card>

      {/* 5. 화면 잠금: 토글/방식 선택/PIN */}
      <Card>
        <Section title="화면 잠금" subtitle="생체인증 & PIN(4자리)">
          <View style={s.row}>
            <Text style={s.label}>사용</Text>
            <Switch
              value={app.settings.lock.enabled}
              onValueChange={v => app.setSettings({ lock: { ...app.settings.lock, enabled: v } })}
            />
          </View>
          <View style={s.row}>
            <Text style={s.label}>방식</Text>
            <View style={{ flexDirection:'row', gap:8 }}>
              <Pressable onPress={()=>app.setSettings({ lock:{ ...app.settings.lock, type:'biometric' } })}
                        style={[s.chip, app.settings.lock.type==='biometric'&&s.chipOn]}>
                <Text style={[s.chipTxt, app.settings.lock.type==='biometric'&&s.chipOnTxt]}>생체</Text>
              </Pressable>
              <Pressable onPress={()=>app.setSettings({ lock:{ ...app.settings.lock, type:'pin' } })}
                        style={[s.chip, app.settings.lock.type==='pin'&&s.chipOn]}>
                <Text style={[s.chipTxt, app.settings.lock.type==='pin'&&s.chipOnTxt]}>PIN</Text>
              </Pressable>
            </View>
          </View>
          {app.settings.lock.type==='pin' && (
            <View style={s.row}>
              <Text style={s.label}>PIN (4자리)</Text>
              <TextInput
                style={[s.input, { width:120, textAlign:'center', letterSpacing:4 }]}
                value={app.settings.lock.pin ?? ''}
                maxLength={4} keyboardType="number-pad"
                onChangeText={t => app.setSettings({ lock:{ ...app.settings.lock, pin: t.replace(/[^0-9]/g,'').slice(0,4) } })}
                placeholder="••••"
              />
            </View>
          )}
          <Text style={{ color:'#888' }}>※ 실제 잠금 화면은 라우트 가드로 추가 예정</Text>
        </Section>
      </Card>

      {/* 6. 고객 문의 */}
      <Card>
        <Section title="고객 문의" subtitle="이메일(선택) · 제목 · 내용">
          <Inquiry />
        </Section>
      </Card>

      {/* 7. 회원탈퇴 & 8. 로그아웃 */}
      <Card>
        <Section title="계정" subtitle="데이터 초기화">
          <View style={{ flexDirection:'row', gap:8, justifyContent:'flex-end' }}>
            <Pressable style={[s.btn, s.ghost]} onPress={async ()=>{ await app.clearAll(); Alert.alert('로그아웃','로컬 데이터 초기화 완료'); }}>
              <Text>로그아웃</Text>
            </Pressable>
            <Pressable style={[s.btn, { backgroundColor:'#b00020' }]} onPress={()=>{
              Alert.alert('회원탈퇴','정말 탈퇴하시겠어요? 모든 로컬 데이터가 삭제됩니다.',[
                { text:'취소' },
                { text:'탈퇴', style:'destructive', onPress: async()=>{ await app.clearAll(); Alert.alert('탈퇴 완료','앱을 재시작하세요.'); } }
              ]);
            }}>
              <Text style={s.btnTxt}>회원탈퇴</Text>
            </Pressable>
          </View>
        </Section>
      </Card>
    </View>
  );
}

function Inquiry() {
  const [email, setEmail] = useState('');
  const [subj, setSubj] = useState('');
  const [body, setBody] = useState('');
  return (
    <View style={{ gap:8 }}>
      <TextInput style={s.input} placeholder="이메일(선택)" value={email} onChangeText={setEmail} keyboardType="email-address"/>
      <TextInput style={s.input} placeholder="제목" value={subj} onChangeText={setSubj}/>
      <TextInput style={[s.input, { minHeight:120 }]} multiline placeholder="문의 내용을 적어주세요" value={body} onChangeText={setBody}/>
      <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
        <Pressable style={s.btn} onPress={()=>{
          const mail = email || 'support@maeumsee.app';
          const url = `mailto:${encodeURIComponent(mail)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
          if (Platform.OS==='web') location.href = url; else Alert.alert('메일 앱이 열립니다.');
        }}>
          <Text style={s.btnTxt}>문의 보내기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, padding:12, gap:12, backgroundColor:'#fffdfb' },

  profileRow: { flexDirection:'row', alignItems:'center' },
  avatarWrap: { alignItems:'center' },
  avatar: { width:72, height:72, borderRadius:36, backgroundColor:'#dfe7f3', borderWidth:4, borderColor:'#fff' },
  avatarImg: { width:72, height:72, borderRadius:36, borderWidth:2, borderColor:'#fff' },
  change: { marginTop:4, fontSize:12, color:'#444' },

  row: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginVertical:6 },
  label: { fontWeight:'800' },

  input: { borderWidth:1, borderColor:'#ece7e2', borderRadius:10, padding:10, backgroundColor:'#fff' },

  chip: { borderWidth:1, borderColor:'#ece7e2', paddingHorizontal:10, paddingVertical:6, borderRadius:999, backgroundColor:'#fff' },
  chipOn: { backgroundColor:'#1f1f1f', borderColor:'#1f1f1f' },
  chipTxt: { color:'#222' },
  chipOnTxt: { color:'#fff', fontWeight:'800' },

  btn: { backgroundColor:'#1f1f1f', paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  btnTxt: { color:'#fff', fontWeight:'700' },
  ghost: { backgroundColor:'#fff' },

  thumb: { borderWidth:1, borderColor:'#ece7e2', borderRadius:12, padding:10, backgroundColor:'#fff', width:200 },

  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'center', alignItems:'center' },
  detail: { backgroundColor:'#fff', borderRadius:14, padding:16, width:320 },

  h3: { fontWeight:'900', fontSize:18, marginVertical:6 },
});
