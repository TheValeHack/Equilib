import { router, usePathname } from 'expo-router'
import Voice from '@react-native-voice/voice'
import TextToSpeechService from './TextToSpeechService'
import commandsData from './../data/commands.json'
import getSettings from '../util/getSettings'
import {getPageFromText, isNumeric} from "../util/helper";
import bookData from './../data/data.json'
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    } else if(commandsData.speakSavedBookData.some(prefix => command.startsWith(prefix))) {
        response = speakSavedBookData
    }
    else if (commandsData.cariBuku.some(prefix => command.startsWith(prefix))) {
        const matchingCommand = commandsData.cariBuku.find(prefix => command.startsWith(prefix))
        const title = command.replace(matchingCommand, '').trim()
        response = cariBuku(title)
    }
      else if (commandsData.speakBookData.some(prefix => command.startsWith(prefix))) {
          response = speakBookData()
      } else if (commandsData.openBook.some(prefix => command.startsWith(prefix))) {
          const matchingCommand = commandsData.openBook.find(prefix => command.startsWith(prefix))
          const title = command.replace(matchingCommand, '').trim()
          response = openBookDetail(title)
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
    } else if(commandsData.save_book.some(prefix => command.startsWith(prefix))){
        response = saveBook()
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
      'pengaturan': 'settings',
      'readlist': 'readlist'
    }
    const findPage = getPageFromText(page)
    if(Object.keys(namaHalaman).includes(findPage)){
      console.log('Navigating to:', findPage)
      router.push(findPage)
      return `Berhasil pindah ke halaman ${findPage}`
    } else {
      return `Halaman ${findPage} tidak ditemukan!`
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

  const cariBuku = (judul) => {
    const currentPage = externalData["currentPage"]
    if (currentPage){
      router.push(`search/${currentPage}/${judul}`)
    } else {
        router.push(`search/${judul}`)
    }
    return `Mencari buku dengan judul ${judul}`
  }

  const saveBook = () => {
    externalData["setIsSave"](true)
    return 'Buku berhasil disimpan'
  }

  const unsaveBook = () => {
    externalData["setIsSave"](false)
    return 'Buku berhasil dihapus dari daftar simpanan'
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

  // function to speak top 5 book data
    const speakBookData = () => {
        const top5Books = bookData.slice(0, 5)
        let response = 'Berikut adalah 5 buku teratas: '
        top5Books.forEach((book, index) => {
        response += `${index + 1}. ${book.title} oleh ${book.author}. `
        })

        return response
    }

  //   function to speak saved book data
    const speakSavedBookData = async () => {
        const JSONSavedBook = await AsyncStorage.getItem('savedBook')
        const savedBook = JSONSavedBook ? JSON.parse(JSONSavedBook) : []
        let response = 'Berikut adalah buku yang telah disimpan: '
        savedBook.forEach((book, index) => {
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
    updateExternalData,
    updateSettingsData,
    startListening,
    stopListening,
  }
}
