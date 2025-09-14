// app/(tabs)/record.tsx
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert, Image, ScrollView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import Card from '@/components/Card';
import Section from '@/components/Section';
import { useApp, Emotion, Category } from '@/store/useApp';
import { fmtDate } from '@/lib/date';
import { EmotionStickerPicker } from '@/components/EmotionStickerPicker';
import SeedLaunch from '@/components/SeedLaunch';

const CATEGORIES: Category[] = ['일상','고민','연애','회사','유머','성장','자기돌봄','관계'];

export default function RecordScreen() {
  const app = useApp();
  const today = fmtDate(new Date());
  const prev = app.records.find(r => r.date === today);

  // 상태
  const [emotion, setEmotion]   = useState<Emotion>((prev?.emotion as Emotion) ?? '기쁨');
  const [text, setText]         = useState(prev?.content ?? '');
  const [isPublic, setIsPublic] = useState(prev?.isPublic ?? false);
  const [category, setCategory] = useState<Category | undefined>(prev?.category);
  const [imgUri, setImgUri]     = useState<string | undefined>(prev?.imageUri);

  const [launchKey, setLaunchKey] = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);

  const canSave = useMemo(() => {
    if (!text.trim()) return false;
    if (isPublic && !category) return false;
    return true;
  }, [text, isPublic, category]);

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert('사진 접근 권한이 필요해요.');
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85
      });
      if (!res.canceled && res.assets?.[0]?.uri) setImgUri(res.assets[0].uri);
    } catch (e) {
      Alert.alert('이미지 선택 오류', String(e));
    }
  };
  const removeImage = () => setImgUri(undefined);

  // 웹에서는 haptics 미지원 → 안전 가드
  async function pingHaptic() {
    try {
      if (Platform.OS !== 'web') {
        const ok = (Haptics as any).isAvailableAsync ? await Haptics.isAvailableAsync() : true;
        if (ok) await Haptics.selectionAsync();
      }
    } catch {}
  }

  const save = async () => {
    if (!canSave) {
      if (!text.trim()) return Alert.alert('내용을 입력해 주세요.');
      if (isPublic && !category) return Alert.alert('공개 시 카테고리 선택은 필수예요.');
    }
    try {
      setSaving(true);
      await pingHaptic();

      await app.addOrUpdateRecord({
        id: prev?.id,
        date: today,
        emotion,
        content: text.trim(),
        isPublic,
        category,
        imageUri: imgUri,
      });

      // 씨앗 발사 애니메이션
      setLaunchKey(Date.now());

      setTimeout(() => {
        Alert.alert('저장 완료', '오늘의 기록이 저장되었어요.');
      }, 950);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ScrollView style={s.container} contentContainerStyle={{ padding:12, gap:12 }}>
        <Card>
          <Section title="오늘 날짜" subtitle="자동 표기">
            <Text style={{ fontWeight:'800' }}>{today}</Text>
          </Section>
        </Card>

        {/* 감정 스티커 */}
        <Card>
          <Section title="오늘은 어떤 하루였나요?" subtitle="스티커를 골라주세요">
            <EmotionStickerPicker value={emotion} onChange={(v)=>setEmotion(v as Emotion)} />
          </Section>
        </Card>

        {/* 텍스트 + 사진 첨부 */}
        <Card>
          <Section title="오늘 하루에 대해 기록해보아요" subtitle="감정, 사건, 생각… 자유롭게">
            <TextInput
              style={s.textarea}
              multiline
              placeholder="무슨 일이 있었나요?"
              value={text}
              onChangeText={setText}
            />
            <View style={{ marginTop:10, gap:8 }}>
              {imgUri ? (
                <View style={{ alignItems:'flex-start', gap:8 }}>
                  <Image source={{ uri: imgUri }} style={{ width:220, height:220, borderRadius:12 }} />
                  <View style={{ flexDirection:'row', gap:8 }}>
                    <Pressable style={[s.btn, s.ghost]} onPress={pickImage}><Text>다시 선택</Text></Pressable>
                    <Pressable style={[s.btn, { backgroundColor:'#b00020' }]} onPress={removeImage}><Text style={s.btnTxt}>삭제</Text></Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={s.btn} onPress={pickImage}>
                  <Text style={s.btnTxt}>사진 첨부</Text>
                </Pressable>
              )}
              <Text style={{ color:'#888' }}>※ “마음씨 전용 스티커팩”은 추후 items prop으로 교체 가능</Text>
            </View>
          </Section>
        </Card>

        {/* 공개/비공개 + 카테고리 */}
        <Card>
          <Section title="공개 설정" subtitle="공개 시 공감숲에 반영">
            <View style={s.row}>
              <Text style={s.label}>공개</Text>
              <Pressable onPress={()=>setIsPublic(v=>!v)} style={[s.switch, isPublic && s.switchOn]}>
                <View style={[s.knob, isPublic && { left:22 }]} />
              </Pressable>
            </View>

            {isPublic && (
              <View style={{ marginTop:8 }}>
                <Text style={[s.label, { marginBottom:6 }]}>카테고리 (필수)</Text>
                <View style={s.categories}>
                  {CATEGORIES.map(c=>{
                    const on = c===category;
                    return (
                      <Pressable key={c} onPress={()=>setCategory(c)} style={[s.chip, on && s.chipOn]}>
                        <Text style={[s.chipTxt, on && s.chipOnTxt]}>{c}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </Section>
        </Card>

        {/* 저장 */}
        <View style={{ alignItems:'flex-end' }}>
          <Pressable
            style={[s.btn, { paddingHorizontal:18, paddingVertical:12, opacity: (!canSave || saving) ? 0.5 : 1 }]}
            onPress={save}
            disabled={!canSave || saving}
          >
            <Text style={s.btnTxt}>{saving ? '저장 중…' : '저장'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 저장 후 씨앗이 날아가는 효과 */}
      <SeedLaunch trigger={launchKey} onDone={() => setLaunchKey(null)} />
    </>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fffdfb' },

  textarea:{
    minHeight:140, borderWidth:1, borderColor:'#ece7e2', borderRadius:12,
    backgroundColor:'#fff', padding:12, textAlignVertical:'top'
  },

  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:6 },
  label:{ fontWeight:'800' },

  switch:{ width:40, height:24, borderRadius:12, backgroundColor:'#ddd', position:'relative', padding:2 },
  switchOn:{ backgroundColor:'#1f1f1f' },
  knob:{ position:'absolute', top:2, left:2, width:20, height:20, borderRadius:10, backgroundColor:'#fff' },

  categories:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  chip:{ borderWidth:1, borderColor:'#ece7e2', paddingHorizontal:10, paddingVertical:6, borderRadius:999, backgroundColor:'#fff' },
  chipOn:{ backgroundColor:'#1f1f1f', borderColor:'#1f1f1f' },
  chipTxt:{ color:'#222' },
  chipOnTxt:{ color:'#fff', fontWeight:'800' },

  btn:{ backgroundColor:'#1f1f1f', paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  btnTxt:{ color:'#fff', fontWeight:'700' },
  ghost:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#ece7e2' },
});
