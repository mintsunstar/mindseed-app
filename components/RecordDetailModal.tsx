// components/RecordDetailModal.tsx
import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TextInput, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RecordItem, Emotion, Category, useApp } from '@/store/useApp';
import { EmotionStickerPicker } from '@/components/EmotionStickerPicker';

const CATEGORIES: Category[] = ['일상','고민','연애','회사','유머','성장','자기돌봄','관계'];

type Props = {
  visible: boolean;
  record: RecordItem;
  onClose: () => void;
};

export default function RecordDetailModal({ visible, record, onClose }: Props) {
  const app = useApp();

  // 편집 상태
  const [emotion, setEmotion] = useState<Emotion>(record.emotion);
  const [text, setText] = useState(record.content);
  const [isPublic, setIsPublic] = useState(record.isPublic);
  const [category, setCategory] = useState<Category | undefined>(record.category);
  const [imgUri, setImgUri] = useState<string | undefined>(record.imageUri);

  const canSave = useMemo(() => {
    if (!text.trim()) return false;
    if (isPublic && !category) return false;
    return true;
  }, [text, isPublic, category]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('사진 접근 권한이 필요해요.');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85
    });
    if (!res.canceled && res.assets?.[0]?.uri) setImgUri(res.assets[0].uri);
  };

  const removeImage = () => setImgUri(undefined);

  const save = async () => {
    if (!canSave) {
      if (!text.trim()) return Alert.alert('내용을 입력해 주세요.');
      if (isPublic && !category) return Alert.alert('공개 시 카테고리 선택은 필수예요.');
    }
    await app.updateRecord({
      ...record,
      emotion,
      content: text.trim(),
      isPublic,
      category,
      imageUri: imgUri,
    });
    Alert.alert('저장 완료', '수정이 반영되었습니다.');
    onClose();
  };

  const del = async () => {
    Alert.alert('삭제할까요?', '이 기록은 복구할 수 없어요.', [
      { text: '취소' },
      { text: '삭제', style: 'destructive', onPress: async () => {
          await app.deleteRecord(record.id);
          Alert.alert('삭제 완료', '기록이 삭제되었습니다.');
          onClose();
        }
      }
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>{record.date}</Text>

          {/* 감정 스티커 */}
          <EmotionStickerPicker value={emotion} onChange={(v)=>setEmotion(v as Emotion)} />

          {/* 내용 */}
          <TextInput
            style={s.textarea}
            multiline
            placeholder="기록 내용"
            value={text}
            onChangeText={setText}
          />

          {/* 이미지 */}
          <View style={{ gap:8 }}>
            {imgUri ? (
              <View style={{ gap:8 }}>
                <Image source={{ uri: imgUri }} style={{ width:240, height:240, borderRadius:12 }} />
                <View style={{ flexDirection:'row', gap:8 }}>
                  <Pressable style={[s.btn, s.ghost]} onPress={pickImage}><Text>다시 선택</Text></Pressable>
                  <Pressable style={[s.btn, { backgroundColor:'#b00020' }]} onPress={removeImage}><Text style={s.btnTxt}>삭제</Text></Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={s.btn} onPress={pickImage}><Text style={s.btnTxt}>사진 첨부</Text></Pressable>
            )}
          </View>

          {/* 공개 / 카테고리 */}
          <View style={{ marginTop:10, gap:8 }}>
            <View style={s.row}>
              <Text style={s.label}>공개</Text>
              <Pressable onPress={()=>setIsPublic(v=>!v)} style={[s.switch, isPublic && s.switchOn]}>
                <View style={[s.knob, isPublic && { left:22 }]} />
              </Pressable>
            </View>

            {isPublic && (
              <View>
                <Text style={[s.label, { marginBottom:6 }]}>카테고리</Text>
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
          </View>

          {/* 버튼 */}
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:14 }}>
            <Pressable style={[s.btn, s.ghost]} onPress={onClose}><Text>닫기</Text></Pressable>
            <View style={{ flexDirection:'row', gap:8 }}>
              <Pressable style={[s.btn, { backgroundColor:'#b00020' }]} onPress={del}><Text style={s.btnTxt}>삭제</Text></Pressable>
              <Pressable style={s.btn} onPress={save} disabled={!canSave}><Text style={s.btnTxt}>저장</Text></Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', alignItems:'center', justifyContent:'center' },
  sheet:{ backgroundColor:'#fff', borderRadius:14, padding:14, width:340, maxHeight:'90%', gap:10 },
  title:{ fontWeight:'900', fontSize:18, textAlign:'center' },

  textarea:{
    minHeight:120, borderWidth:1, borderColor:'#ece7e2', borderRadius:12,
    backgroundColor:'#fff', padding:12, textAlignVertical:'top'
  },

  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
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
  ghost:{ backgroundColor:'#fff' },
});
