import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
export default function Gauge({ pct }:{ pct:number }){
  const r=46, c=2*Math.PI*r, offset= c*(1-Math.max(0,Math.min(100,pct))/100);
  const stage = pct<25?'새싹':pct<50?'줄기':pct<75?'봉오리':'개화 직전';
  return (<View style={s.wrap}>
    <Svg width={120} height={120} style={{transform:[{rotate:'-90deg'}]}}>
      <Defs><LinearGradient id="g" x1="0" y1="0" x2="1" y2="1"><Stop offset="0%" stopColor="#7fb3ff"/><Stop offset="100%" stopColor="#6ab59b"/></LinearGradient></Defs>
      <Circle cx={60} cy={60} r={r} stroke="#eee" strokeWidth={12} fill="none"/>
      <Circle cx={60} cy={60} r={r} stroke="url(#g)" strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}/>
    </Svg>
    <Text style={s.stage}>{stage}</Text>
    <Text style={s.pct}>{Math.round(pct)}%</Text>
  </View>);
}
const s=StyleSheet.create({ wrap:{alignItems:'center', gap:6}, stage:{fontWeight:'800'}, pct:{fontWeight:'900', fontSize:16} });
