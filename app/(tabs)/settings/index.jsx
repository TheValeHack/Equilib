import { ScrollView, View, Text, Switch } from 'react-native';
import GlobalStyles from "@/styles/GlobalStyles";
import { useEffect, useState, useRef, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultSettings from '../../../data/default_settings.json'
import { AppContext } from '../../../context/AppContext';
import CommandBox from '../../../components/global/CommandBox';

export default function SettingsScreen() {
  const { dispatch, externalData } = useContext(AppContext);
  const [settingsData, setSettingsData] = useState({});
  const [loading, setLoading] = useState(true);

  const toggleSwitch = async (key) => {
    const updatedSettings = {
      ...settingsData,
      [key]: {
        ...settingsData[key],
        status: !settingsData[key].status
      }
    };
    setSettingsData(updatedSettings);
    await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsStorageData = await AsyncStorage.getItem('settings');
        if (settingsStorageData) {
          setSettingsData(JSON.parse(settingsStorageData));
          dispatch({
            type: 'SET_EXTERNAL_DATA',
            payload: {
              externalData: {
                'settings': JSON.parse(settingsStorageData),
                'setSettings': setSettingsData
              }
            }
          })
          dispatch({
            type: 'SET_SETTINGS',
            payload: {
              settingsData: JSON.parse(settingsStorageData)
            }
          })
        } else {
          await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));
          setSettingsData(defaultSettings);
          dispatch({
            type: 'SET_EXTERNAL_DATA',
            payload: {
              externalData: {
                'settings': defaultSettings,
                'setSettings': setSettingsData
              }
            }
          })
          dispatch({
            type: 'SET_SETTINGS',
            payload: {
              settingsData: defaultSettings
            }
          })
        }
      } catch (error) {
        console.log('Error getting item:', error);
      }
      setLoading(false);
    };

    loadSettings();


  }, []);

  useEffect(() => {
    dispatch({
      type: 'SET_EXTERNAL_DATA',
      payload: {
        externalData: {
          'settings': settingsData,
          'setSettings': setSettingsData
        }
      }
    })
    dispatch({
      type: 'SET_SETTINGS',
      payload: {
        settingsData: settingsData
      }
    })
    const setSettings = async (settingsData) => {
      try {
        await AsyncStorage.setItem('settings', JSON.stringify(settingsData));
      } catch (error) {
        console.log('Error getting item:', error);
      }
    };
    if(settingsData != {}){
      setSettings(settingsData)
    }
  }, [settingsData])

  if (loading) {
    return <View></View>;
  }

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <ScrollView className="mt-4">
        <Text className="text-xl mb-3 mt-3" style={GlobalStyles.text_bold}>Settings</Text>
        <View className="flex flex-col flex-1 w-full pb-16">
          {
            Object.keys(settingsData).map((key, index) => (
              <View key={index} className="flex flex-row flex-1 justify-between w-full bg-slate-50 p-4 rounded-xl mb-4">
                <View className="relative flex-1 pr-6"> 
                  <Text style={GlobalStyles.text_bold} className="text-lg">{settingsData[key].title}</Text>
                  <Text style={GlobalStyles.text_medium} className="text-sm text-slate-500 text-justify">{settingsData[key].desc}</Text>
                </View>
                <Switch
                  thumbColor={settingsData[key].status ? '#EFAC00' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => toggleSwitch(key)}
                  value={settingsData[key].status}
                />
              </View>
            ))
          }
        </View>
      </ScrollView>
    </View>
  );
}
