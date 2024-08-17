import { router } from 'expo-router'
import Voice from '@react-native-voice/voice'
import TextToSpeechService from './TextToSpeechService'
import commandsData from './../data/commands.json'
import getSettings from '../util/getSettings'

export default function VoiceCommandService(externalData, setCommands) {
  let settingsValue = null;

  const fetchSettings = async () => {
    settingsValue = await getSettings();
  };

  fetchSettings();
  
  let isListeningForCommand = false

  const updateExternalData = (newExternalData) => {
    externalData = newExternalData;
  };
  const updateSettingsData = (newSettingsData) => {
    settingsValue = newSettingsData;
  };

  const startListening = () => {
    Voice.removeAllListeners() 

    Voice.onSpeechResults = (results) => {
      console.log('Speech Results:', results)
      if (results && results.value && results.value.length > 0) {
        const spokenText = results.value[0].toLowerCase()
        setCommands(prevCommands => [...prevCommands, spokenText])

        if (isListeningForCommand) {
          executeCommand(spokenText)
        } else if (commandsData.keyword.includes(spokenText.replace("-", " "))) {
          stopListening()

          if(settingsValue["respon_suara"]["status"]){
            TextToSpeechService.speak('Halo! Silakan beri perintah', {
              onDone: () => {
                isListeningForCommand = true
                startListening()
              }
            })
          } else {
            isListeningForCommand = true
            startListening()
          }
          
        } else {
          restartListening()
        }
      } else {
        console.log('No speech results found.')
        restartListening()
      }
    }

    Voice.onSpeechError = (error) => {
      console.log('Speech Error: ', error)
      handleVoiceError(error)
    }

    Voice.onSpeechEnd = () => {
      console.log('Speech ended')
    }

    Voice.start('id-ID')
      .catch(error => console.log('Voice.start error: ', error))
  }

  const stopListening = () => {
    Voice.stop()
      .catch(error => console.log('Voice.stop error: ', error))
  }

  const restartListening = () => {
    stopListening()
    startListening()
  }

  const executeCommand = (command) => {
    if(!settingsValue["sekali_kata_kunci"]["status"]){
      isListeningForCommand = false
    }

    let response = ''

    if (commandsData.navigate.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.navigate.find(prefix => command.startsWith(prefix))
      const pageName = command.replace(matchingCommand, '').trim()
      response = navigateToPage(pageName)
    } else if(commandsData.read_settings.includes(command)) {
      response = readPengaturan(externalData)
    }  else if (commandsData.detail_settings.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.detail_settings.find(prefix => command.startsWith(prefix))
      const settingName = command.replace(matchingCommand, '').trim()
      response = readDetailPengaturan(externalData, settingName, true)
    } else if (commandsData.activate_settings.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.activate_settings.find(prefix => command.startsWith(prefix))
      const settingName = command.replace(matchingCommand, '').trim()
      response = changeSettings(externalData, settingName, true)
    }  else if (commandsData.nonactivate_settings.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.nonactivate_settings.find(prefix => command.startsWith(prefix))
      const settingName = command.replace(matchingCommand, '').trim()
      response = changeSettings(externalData, settingName, false)
    } else {
      if(settingsValue["perintah_salah"]["status"]){
        response = `Maaf, Perintah ${command} tidak valid!`
      } else {
        response = 'Maaf, Perintah anda tidak valid!'
      }
    }

    stopListening()

    if(settingsValue["respon_suara"]["status"]){
      TextToSpeechService.speak(response, {
        onDone: () => {
          startListening()
        }
      })
    }
  }

  const navigateToPage = (page) => {
    const namaHalaman = {
      'beranda': '/',
      'pengaturan': 'settings'
    }
    if(Object.keys(namaHalaman).includes(page)){
      console.log('Navigating to:', page) 
      router.push(namaHalaman[page])
      return `Berhasil pindah ke halaman ${page}`
    } else {
      return `Halaman ${page} tidak ditemukan!`
    }
  }
  const readPengaturan = (pengaturan) => {
    if(!pengaturan.hasOwnProperty('settings')){
      return 'Silakan pergi ke halaman pengaturan untuk mulai mengatur pengaturan!'
    }
    let response = "Berikut pengaturan anda saat ini. "
    pengaturan = pengaturan['settings']
    for (let key in pengaturan) {
      response += `Pengaturan ${pengaturan[key]['title']} ${pengaturan[key]['status'] ? 'aktif' : 'tidak aktif'}. `
    }
    return response
  }

  const readDetailPengaturan = (pengaturan, settingName) => {
    if(!pengaturan.hasOwnProperty('settings')){
      return 'Silakan pergi ke halaman pengaturan untuk mulai mengatur pengaturan!'
    }
    const matchingSetting = Object.entries(pengaturan["settings"]).find(val => val[1]["title"].toLowerCase() == settingName)
    if(!matchingSetting){
      return `Pengaturan ${settingName} tidak ditemukan` 
    }
    let response = `Berikut detail pengaturan ${settingName}. ` + matchingSetting[1]["desc"]
    return response
  }

  const changeSettings = (pengaturan, settingName, status) => {
    if(!pengaturan.hasOwnProperty('settings')){
      return 'Silakan pergi ke halaman pengaturan untuk mulai mengatur pengaturan!'
    }
    if(!pengaturan.hasOwnProperty('setSettings')){
      return 'Silakan pergi ke halaman pengaturan untuk mulai mengatur pengaturan!'
    }
    const matchingSetting = Object.entries(pengaturan["settings"]).find(val => val[1]["title"].toLowerCase() == settingName)
    if(!matchingSetting){
      return `Pengaturan ${settingName} tidak ditemukan` 
    }
    let newPengaturan = {...pengaturan["settings"]}
    newPengaturan[matchingSetting[0]] = {
      ...matchingSetting[1],
      "status": status
    }
    pengaturan["setSettings"](newPengaturan)
    return 'Pengaturan berhasil diperbarui'
  }

  const handleVoiceError = (error) => {
    console.log(error)
    restartListening()
  }

  startListening()

  return {
    updateExternalData,
    updateSettingsData,
    startListening,
    stopListening,
  }
}
