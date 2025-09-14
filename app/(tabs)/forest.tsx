import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import Card from '@/components/Card'; import Section from '@/components/Section'; import { useApp } from '@/store/useApp'; import { Link } from 'expo-router';
const CATS = ['이별','일상','유머','회사','불안','자기돌봄','관계','성장'] as const;
export default function Forest(){
  const app = useApp();
  const catAgg = CATS.map(cat=>{ const recs=app.records.filter(r=>r.isPublic && r.category===cat); const likes=recs.reduce((a,r)=>a+r.likes,0); return {cat, posts:recs.length, likes}; });
  const top = [...app.records.filter(r=>r.isPublic)].sort((a,b)=> (b.likes||0)-(a.likes||0)).slice(0,3);
  return (<View style={s.container}>
    <Card><Section title="공감숲" subtitle="카테고리를 함께 키워요">
      {top.length? (<View style={s.top}>{top.map((r,i)=>(<View key={r.id} style={s.topCard}><Text style={s.topTitle}>#{i+1} {r.category ?? ''}</Text><Text numberOfLines={2}>“{r.content}”</Text><Text style={s.meta}>감정 {r.emotion} · 💧 {r.likes}</Text></View>))}</View>): <Text style={{color:'#666'}}>아직 집계할 기록이 없어요.</Text>}
      <FlatList data={catAgg} keyExtractor={(it)=>String(it.cat)} renderItem={({item})=> (<View style={s.row}><Text style={s.cat}>{item.cat}</Text><Text style={s.kpi}>기록 {item.posts}</Text><Text style={s.kpi}>공감 {item.likes}</Text><Link href='/(tabs)/record' asChild><Pressable style={s.btn}><Text style={s.btnTxt}>이 주제로 기록</Text></Pressable></Link></View>)} />
    </Section></Card>
  </View>);
}
const s=StyleSheet.create({ container:{flex:1,padding:12,gap:12,backgroundColor:'#fffdfb'}, top:{flexDirection:'row',gap:8,flexWrap:'wrap'}, topCard:{flex:1,minWidth:180,borderWidth:1,borderColor:'#ece7e2',borderRadius:12,padding:10,backgroundColor:'#fff',gap:4}, topTitle:{fontWeight:'800'}, meta:{color:'#666',fontSize:12}, row:{flexDirection:'row',gap:10,alignItems:'center',paddingVertical:10}, cat:{fontWeight:'900',minWidth:50}, kpi:{color:'#444'}, btn:{marginLeft:'auto',backgroundColor:'#1f1f1f',paddingHorizontal:10,paddingVertical:6,borderRadius:10}, btnTxt:{color:'#fff',fontWeight:'700'} });
