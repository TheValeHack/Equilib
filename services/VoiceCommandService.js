import { router } from 'expo-router'
import Voice from '@react-native-voice/voice'
import TextToSpeechService from './TextToSpeechService'
import commandsData from './../data/commands.json'
import {getPageFromText, isNumeric} from "../util/helper";
import bookData from './../data/data.json'

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
    }

    if (commandsData.speakBookData.some(prefix => command.startsWith(prefix))) {
        response = speakBookData()
    }

    if (commandsData.openBook.some(prefix => command.startsWith(prefix))) {
        const matchingCommand = commandsData.openBook.find(prefix => command.startsWith(prefix))
        const title = command.replace(matchingCommand, '').trim()
        response = openBookDetail(title)
    }

    if (response === '') {
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
      'pengaturan': 'settings',
      'readlist': 'readlist'
    }
    const findPage = getPageFromText(page)
    if(Object.keys(namaHalaman).includes(findPage)){
      console.log('Navigating to:', findPage)
      router.push(findPage)
      return `Berhasil pindah ke halaman ${findPage}`
    } else {
      return 'Halaman tidak ditemukan!'
    }
  }

  // function to speak top 5 book data
    const speakBookData = () => {
        const top5Books = bookData.slice(0, 5)
        let response = 'Berikut adalah 5 buku teratas: '
        top5Books.forEach((book, index) => {
        response += `${index + 1}. ${book.title} oleh ${book.author}. `
        })

        return response
    }

  //   function to open the book detail page by title
    const openBookDetail = (title) => {
        const book = bookData.find(book => book.title.toLowerCase() === title.toLowerCase())
        if (book) {
        router.push(`detail/${btoa(book.pdfUrl)}`)
        return `Buku ${book.title} telah dibuka`
        } else {
        return openBookDetailByIndex(title)
        }
    }

  //   function to open book detail page by index order's number
    const openBookDetailByIndex = (index) => {
        if (index > 0 && index <= bookData.length && isNumeric(index)) {
          console.log(index)
        const book = bookData[parseInt(index) - 1]
        console.log('Opening book detail for:', book.title)
        router.push(`detail/${btoa(book.pdfUrl)}`)
        return `Buku ${book.title} telah dibuka`
        } else {
        return 'Buku tidak ditemukan!'
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
