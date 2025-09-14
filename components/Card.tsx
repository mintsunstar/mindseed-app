import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme/tokens';
export default function Card({children}:PropsWithChildren){ return <View style={s.card}>{children}</View>; }
const s=StyleSheet.create({ card:{ backgroundColor:colors.card, borderColor:colors.line, borderWidth:1, borderRadius:14, padding:12 } });
