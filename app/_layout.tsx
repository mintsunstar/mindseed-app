import { Stack } from 'expo-router'

export default function RootLayout() {
  // 루트는 Stack(or Slot)만! Tabs는 (tabs)/_layout.tsx 에서만 렌더
  return <Stack screenOptions={{ headerShown: false }} />
}
