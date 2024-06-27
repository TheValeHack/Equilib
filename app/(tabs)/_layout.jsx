import { Tabs } from 'expo-router';
import React from 'react';
import GlobalStyles from '@/styles/GlobalStyle';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { View } from 'react-native';

const VoiceButton = () => {
  return (
    <View className="z-10 items-center justify-center w-16 h-16 rounded-full bg-primary bottom-8">
      <TabBarIcon name={'stop'} color={"#FFFFFF"} size={36} />
    </View>
  );
}

export default function TabLayout() {

  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: "#FFFFFF" }} 
      screenOptions={{
        tabBarActiveTintColor: "#EFAC00",
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10, 
        },
        tabBarLabelStyle: GlobalStyles.text_medium
      }
      }>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="readlist/index"
        options={{
          title: 'Readlist',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={'list'} color={color}/>
          ),
        }}
      />
      <Tabs.Screen
        name="ignore"
        options={{
          title: '',
          tabBarButton: () => <VoiceButton />,
        }}
      />
      <Tabs.Screen
        name="offline/index"
        options={{
          title: 'Offline',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={'download'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="detail/[slug]/index"
        options={{
          title: '',
          tabBarButton: () =>null,
        }}
      />
    </Tabs>
  );
}
