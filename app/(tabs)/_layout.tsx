import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
export default function TabsLayout(){
  return (
    <Tabs screenOptions={{ headerShown:false }}>
      <Tabs.Screen name="home" options={{ title:'홈', tabBarIcon: ()=> <Text>🏠</Text> }} />
      <Tabs.Screen name="forest" options={{ title:'공감숲', tabBarIcon: ()=> <Text>🌿</Text> }} />
      <Tabs.Screen name="record" options={{ title:'기록', tabBarIcon: ()=> <Text>💧</Text> }} />
      <Tabs.Screen name="my" options={{ title:'마이', tabBarIcon: ()=> <Text>👤</Text> }} />
    </Tabs>
  );
}
