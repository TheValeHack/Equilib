import { router } from 'expo-router'
import Voice from '@react-native-voice/voice'
import TextToSpeechService from './TextToSpeechService'
import commandsData from './../data/commands.json'

export default function VoiceCommandService(externalData, setCommands) {
  let isListeningForCommand = false

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

          TextToSpeechService.speak('Halo! Silakan beri perintah', {
            onDone: () => {
              isListeningForCommand = true
              startListening()
            }
          })
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
    isListeningForCommand = false

    let response = ''

    if (commandsData.navigate.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.navigate.find(prefix => command.startsWith(prefix))
      const pageName = command.replace(matchingCommand, '').trim()
      response = navigateToPage(pageName)
    } else {
      response = 'Maaf, Perintah anda tidak valid!'
    }

    stopListening()

    TextToSpeechService.speak(response, {
      onDone: () => {
        startListening()
      }
    })
  }

  const navigateToPage = (page) => {
    const namaHalaman = {
      'beranda': 'index',
      'pengaturan': 'settings'
    }
    if(Object.keys(namaHalaman).includes(page)){
      console.log('Navigating to:', page) 
      router.push(page)
      return `Berhasil pindah ke halaman ${page}`
    } else {
      return 'Halaman tidak ditemukan!'
    }
  }

  const handleVoiceError = (error) => {
    console.log(error)
    restartListening()
  }

  startListening()

  return {
    startListening,
    stopListening,
  }
}
