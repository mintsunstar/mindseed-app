// components/profile/ProfileMenu.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

export type MenuItem = {
  label: string
  description?: string
  onPress: () => void
}

export type MenuSection = {
  title: string
  items: MenuItem[]
}

type Props = {
  sections: MenuSection[]
}

function ProfileMenu({ sections }: Props) {
  return (
    <View style={{ marginTop: 24 }}>
      {sections.map((section, idx) => (
        <View key={section.title + idx} style={{ marginBottom: 24, paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 13,
              color: '#999',
              marginBottom: 6,
            }}
          >
            {section.title}
          </Text>

          {section.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={{
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 0.5,
                borderBottomColor: '#eee',
              }}
            >
              <Text style={{ fontSize: 15 }}>{item.label}</Text>
              {item.description ? (
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: '#999',
                  }}
                >
                  {item.description}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  )
}

export default ProfileMenu
