// app/(tabs)/_layout.tsx
import React from 'react'
import { Text } from 'react-native'
import { Tabs } from 'expo-router'

function EmojiIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2AA884',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: () => <EmojiIcon emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="forest"
        options={{
          title: '공감숲',
          tabBarIcon: () => <EmojiIcon emoji="🌿" />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: '기록',
          tabBarIcon: () => <EmojiIcon emoji="📝" />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '내 정보',
          tabBarIcon: () => <EmojiIcon emoji="🌸" />,
        }}
      />
      {/* ※ index.tsx 는 home 으로 redirect 되도록 되어 있을 가능성이 높으니까
          별도 탭으로 안 뽑았어. 지금 구조 그대로 두면 됨. */}
    </Tabs>
  )
}
