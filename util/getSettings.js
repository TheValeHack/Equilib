import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultSettings from '../data/default_settings.json'

export default async function getSettings(){
    try {
        let settingsStorageData = await AsyncStorage.getItem('settings');
        if(settingsStorageData){
            return JSON.parse(settingsStorageData)
        } 
      } catch (error) {
        console.log('Error getting item:', error);
      }

    return defaultSettings
}