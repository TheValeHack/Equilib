import { router, usePathname } from 'expo-router'
import Voice from '@react-native-voice/voice'
import TextToSpeechService from './TextToSpeechService'
import commandsData from './../data/commands.json'
import getSettings from '../util/getSettings'
import {getPageFromText, isNumeric} from "../util/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import downloadBook from '../util/downloadBook'
import fetchBooks from '../util/fetchBooks'
import * as FileSystem from 'expo-file-system';

export default function VoiceCommandService(externalData, setCommands) {
  let settingsValue = null;
  let currentPage = '/'
  let booksData = []
  let offlineBooksData = []

  const fetchSettings = async () => {
    settingsValue = await getSettings();
  };

  const fetchBookData = async () => {
    try {
      booksData = await fetchBooks();
    } catch (error) {
      console.error('Failed to fetch book data:', error);
    }
  };

  const fetchOfflineBooksData = async () => {
    try {
      const JSONOfflineData = await AsyncStorage.getItem('offlineBook')
      const offlineData = JSONOfflineData ? JSON.parse(JSONOfflineData) : [];
      offlineBooksData = offlineData
    }  catch (error) {
      console.error('Failed to fetch book data:', error);
    }
  }

  const initialize = async () => {
    await fetchSettings();
    await fetchBookData();
    startListening();
  };


  let isListeningForCommand = false

  const updateExternalData = (newExternalData) => {
    externalData = newExternalData;
  };
  const updateSettingsData = (newSettingsData) => {
    settingsValue = newSettingsData;
  };
  const updateCurrentPage = (newPage) => {
    currentPage = newPage;
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

  const executeCommand = async (command) => {
    if(!settingsValue["sekali_kata_kunci"]["status"]){
      isListeningForCommand = false
    }

    let response = ''

    if (commandsData.navigate.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.navigate.find(prefix => command.startsWith(prefix))
      const pageName = command.replace(matchingCommand, '').trim()
      response = navigateToPage(pageName)
    } else if (commandsData.back.some(prefix => command.startsWith(prefix))) {
      response = goBack()
    } else if (commandsData.speakSavedBookData.some(prefix => command.startsWith(prefix))) {
      response = await speakSavedBookData();
    } else if (commandsData.cariBuku.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.cariBuku.find(prefix => command.startsWith(prefix));
      const title = command.replace(matchingCommand, '').trim();
      response = cariBuku(title);
    } else if (commandsData.readBook.some(prefix => command.startsWith(prefix))) {
      response = readCurrentBook();
    } else if (commandsData.speakBookData.some(prefix => command.startsWith(prefix))) {
      response = speakBookData();
    } else if (commandsData.readPage.some(prefix => command.startsWith(prefix))) {
      response = await readCurrentPage();
    } else if (commandsData.nextPage.some(prefix => command.startsWith(prefix))) {
      response = goToNextPage();
    } else if (commandsData.previousPage.some(prefix => command.startsWith(prefix))) {
      response = goToPreviousPage();
    } else if (commandsData.spesificPage.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.spesificPage.find(prefix => command.startsWith(prefix));
      const number = command.replace(matchingCommand, '').trim().split(" ")[0];
      response = goToSpesificPage(number);
    } else if (commandsData.openBook.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.openBook.find(prefix => command.startsWith(prefix));
      const title = command.replace(matchingCommand, '').trim();
      response = await openBookDetail(title);
    } else if (commandsData.downloadBook.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.downloadBook.find(prefix => command.startsWith(prefix));
      const title = command.replace(matchingCommand, '').trim();
      if (currentPage.startsWith('/baca/')) {
        if (title.length === 0) {
          const slug = currentPage.slice(6);
          const book = booksData.find((item) => item.id === parseInt(slug));
          response = await downloadOfflineBook(book.attributes.title);
        } else {
          response = 'Silahkan ke halaman beranda untuk mengunduh buku spesifik';
        }
      } else {
        response = await downloadOfflineBook(title);
      }
    } else if (commandsData.readSynopsis.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.readSynopsis.find(prefix => command.startsWith(prefix));
      const title = command.replace(matchingCommand, '').trim();
      if (currentPage.startsWith('/detail/') || currentPage.startsWith('/offline/detail/')) {
        if (title.length === 0) {
          const slug = currentPage.startsWith('/offline/detail/') ? currentPage.slice(16) : currentPage.slice(8);
          const book = booksData.find((item) => item.id === parseInt(slug));
          response = readBookSynopsis(book.attributes.title);
        } else {
          response = 'Silahkan ke halaman beranda untuk membaca sinopsis buku spesifik.';
        }
      } else {
        if (title.length === 0) {
          response = 'Tolong sertakan judul atau nomor buku.';
        } else {
          response = readBookSynopsis(title);
        }
      }
    } else if (commandsData.readDetail.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.readDetail.find(prefix => command.startsWith(prefix));
      const title = command.replace(matchingCommand, '').trim();
      if (currentPage.startsWith('/detail/') || currentPage.startsWith('/offline/detail/')) {
        if (title.length === 0) {
          const slug = currentPage.startsWith('/offline/detail/') ? currentPage.slice(16) : currentPage.slice(8);
          const book = booksData.find((item) => item.id === parseInt(slug));
          response = readBookDetail(book.attributes.title);
        } else {
          response = 'Silahkan ke halaman beranda untuk membaca detail buku spesifik.';
        }
      } else {
        if (title.length === 0) {
          response = 'Tolong sertakan judul atau nomor buku.';
        } else {
          response = readBookDetail(title);
        }
      }
    } else if (commandsData.read_settings.includes(command)) {
      response = readPengaturan(externalData);
    } else if (commandsData.detail_settings.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.detail_settings.find(prefix => command.startsWith(prefix));
      const settingName = command.replace(matchingCommand, '').trim();
      response = readDetailPengaturan(externalData, settingName, true);
    } else if (commandsData.activate_settings.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.activate_settings.find(prefix => command.startsWith(prefix));
      const settingName = command.replace(matchingCommand, '').trim();
      response = changeSettings(externalData, settingName, true);
    } else if (commandsData.nonactivate_settings.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.nonactivate_settings.find(prefix => command.startsWith(prefix));
      const settingName = command.replace(matchingCommand, '').trim();
      response = changeSettings(externalData, settingName, false);
    } else if (commandsData.save_book.some(prefix => command.startsWith(prefix))) {
      response = saveBook();
    } else if (commandsData.unsave_book.some(prefix => command.startsWith(prefix))) {
      response = unsaveBook();
    } else {
      if (settingsValue["perintah_salah"]["status"]) {
        response = `Maaf, Perintah ${command} tidak valid!`;
      } else {
        response = 'Maaf, Perintah anda tidak valid!';
      }
    }

    stopListening();

    if (settingsValue["respon_suara"]["status"]) {
      TextToSpeechService.speak(response, {
        onDone: () => {
          startListening();
        }
      });
    }
  };

  const navigateToPage = (page) => {
    const namaHalaman = {
      'beranda': '/',
      'settings': '/settings',
      'offline': '/offline',
      'readlist': '/readlist'
    }
    const findPage = getPageFromText(page)
    if(Object.keys(namaHalaman).includes(findPage)){
      console.log('Navigating to:', findPage)
      router.push(namaHalaman[findPage])
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
    judul = judul.trim()
    if(judul.length == 0){
      return `Tolong sertakan judul buku`
    }
    if ((currentPage == '/readlist') || currentPage == '/offline'){
      router.push(`search${currentPage}/${judul}`)
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
        if(currentPage == '/' || currentPage == '/readlist' || currentPage == '/offline'){
          return 'sabar'
        } else {
          return 'Anda tidak berada dalam halaman daftar buku apapun.'
        }
    }

  //   function to speak saved book data
    const speakSavedBookData = async () => {
        const JSONSavedBook = await AsyncStorage.getItem('savedBook')
        const savedBook = JSONSavedBook ? JSON.parse(JSONSavedBook) : []
        let response = 'Berikut adalah buku yang telah disimpan: '
        savedBook.forEach((book, index) => {
        response += `${index + 1}. ${book.attributes.title} oleh ${book.attributes.author}. `
        })

        return response
  }

  //   function to open the book detail page by title
    const openBookDetail = async (title) => {
        const book = booksData.find(book => book.attributes.title.toLowerCase() === title.toLowerCase())
        if (book) {
          let detailPath = '/detail/'
          if(currentPage.startsWith('/offline')){
            await fetchOfflineBooksData()
            if(offlineBooksData.find(offlineBook => offlineBook.id == book.id)){
              detailPath = '/offline' + detailPath
            } else {
              return 'Anda belum mengunduh buku tersebut.'
            }
          }
          console.log(currentPage)
          console.log(detailPath)
          router.push(`${detailPath}${book.id}`)
          return `Buku ${book.attributes.title} telah dibuka`
        } else {
        return openBookDetailByIndex(title)
        }
    }

  //   function to open book detail page by index order's number
    const openBookDetailByIndex = async (index) => {
        if (index > 0 && isNumeric(index)) {
          const book = booksData.find(book => book.id == index)
          console.log(index)
          console.log(book)
          if(!book){
            return 'Buku tidak ditemukan!'
          }
          let detailPath = '/detail/'
          if(currentPage.startsWith('/offline')){
            await fetchOfflineBooksData()
            if(offlineBooksData.find(offlineBook => offlineBook.id == book.id)){
              detailPath = '/offline' + detailPath
            } else {
              return 'Anda belum mengunduh buku tersebut.'
            }
          }
          console.log(currentPage)
          console.log(detailPath)
          router.push(`${detailPath}${book.id}`)
          return `Buku ${book.attributes.title} telah dibuka`
        } else {
          return 'Buku tidak ditemukan!'
        }
  }

  const downloadOfflineBook = async (title) => {
    const book = booksData.find(book => book.attributes.title.toLowerCase() === title.toLowerCase())
    if (book) {
      TextToSpeechService.speak(`memulai pengunduhan buku ${book.attributes.title}...`)
      let downloadedBook = await downloadBook(book)
      return downloadedBook["message"]
    } else {
      return await downloadOfflineBookByIndex(title)
    }
}

const downloadOfflineBookByIndex = async (index) => {
    if (index > 0 && index <= booksData.length && isNumeric(index)) {
      console.log(index)
      const book = booksData[parseInt(index) - 1]
      console.log(book)
      TextToSpeechService.speak(`memulai pengunduhan buku ${book.attributes.title}...`)
      let downloadedBook = await downloadBook(book)
      return downloadedBook["message"]
    } else {
      return 'Buku tidak ditemukan!'
    }
}

const readCurrentBook = () => {
  if(currentPage.startsWith('/detail/')){
    const slug = currentPage.slice(8);
    router.push(`/baca/${slug}`)
    return 'Buku siap dibaca.'
  } else if(currentPage.startsWith('/offline/detail/')){
    const slug = currentPage.slice(16);
    router.push(`/offline/baca/${slug}`)
    return 'Buku siap dibaca.'
  } else {
    return 'Silahkan buka buku terlebih dahulu.'
  }
}

const readBookSynopsis = (title) => {
  const book = booksData.find(book => book.attributes.title.toLowerCase() === title.toLowerCase())
  if (book) {
    return `Berikut sinopsis buku ${book.attributes.title}. ${book.attributes.synopsis}`
  } else {
    return readBookSynopsisByIndex(title)
  }
}

const readBookSynopsisByIndex = (index) => {
  if (index > 0 && index <= booksData.length && isNumeric(index)) {
    const book = booksData[parseInt(index) - 1]
    return `Berikut sinopsis buku ${book.attributes.title}. ${book.attributes.synopsis}`
  } else {
    return 'Buku tidak ditemukan!'
  }
}
const readBookDetail = (title) => {
  const book = booksData.find(book => book.attributes.title.toLowerCase() === title.toLowerCase())
  if (book) {
    return `Buku ini berjudul ${book.attributes.title}, ditulis oleh ${book.attributes.author} pada tahun ${book.attributes.year}`
  } else {
    return readBookDetailByIndex(title)
  }
}

const readBookDetailByIndex = (index) => {
  if (index > 0 && index <= booksData.length && isNumeric(index)) {
    const book = booksData[parseInt(index) - 1]
    return `Buku ini berjudul ${book.attributes.title}, ditulis oleh ${book.attributes.author} pada tahun ${book.attributes.year}`
  } else {
    return 'Buku tidak ditemukan!'
  }
}

const readCurrentPage = async () => {
  if(currentPage.startsWith('/baca/') || currentPage.startsWith('/offline/baca/')){
    const slug = currentPage.startsWith('/baca/') ? currentPage.slice(6) : currentPage.slice(14)
    const currentBookData = externalData['currentBookData']
    if(currentBookData.id == parseInt(slug)){
      const jsonString = await FileSystem.readAsStringAsync(currentBookData['transcriptLocation'], { encoding: FileSystem.EncodingType.UTF8 });
      const jsonObject = JSON.parse(jsonString);
      const pageText = jsonObject.find(item => item.page == currentBookData['currentPage'])
      if(pageText){
        console.log(pageText.page)
        return pageText.text
      } else {
        console.log(jsonString)
        return 'Halaman tidak ditemukan.'
      }
    }  else {
      return ''
    }
  } else {
    return 'Anda belum membuka buku apapun!'
  }
}

const goBack = () => {
  try {
    router.back()
    return 'Berhasil kembali ke halaman sebelumnya.'
  } catch {
    return 'Maaf, anda tidak bisa kembali ke halaman sebelumnya.'
  }
}

const goToNextPage = () => {
  if(currentPage.startsWith('/baca/') || currentPage.startsWith('/offline/baca/')){
    const slug = currentPage.startsWith('/baca/') ? currentPage.slice(6) : currentPage.slice(14)
    const currentBookData = externalData['currentBookData']
    const setCurrentBookData = externalData['setCurrentBookData']
    console.log('here')
    if(currentBookData.id == parseInt(slug)){
      if(setCurrentBookData){
        setCurrentBookData({
          ...currentBookData,
          'currentPage': currentBookData['currentPage'] + 1
        })
        return 'Berhasil ke halaman selanjutnya!'
      } else {
        console.log(setCurrentBookData)
        return 'Maaf, terjadi kesalahan!'
      }
    } else {
      return ''
    }
  } else {
    return 'Anda belum membuka buku apapun!'
  }
}

const goToPreviousPage = () => {
  if(currentPage.startsWith('/baca/') || currentPage.startsWith('/offline/baca/')){
    const slug = currentPage.startsWith('/baca/') ? currentPage.slice(6) : currentPage.slice(14)
    const currentBookData = externalData['currentBookData']
    const setCurrentBookData = externalData['setCurrentBookData']
    console.log('here')
    if(currentBookData.id == parseInt(slug)){
      if(setCurrentBookData){
        setCurrentBookData({
          ...currentBookData,
          'currentPage': currentBookData['currentPage'] - 1
        })
        return 'Berhasil ke halaman sebelumnya!'
      } else {
        console.log(setCurrentBookData)
        return 'Maaf, terjadi kesalahan!'
      }
    } else {
      return ''
    }
  } else {
    return 'Anda belum membuka buku apapun!'
  }
}

const goToSpesificPage = (number) => {
  if(currentPage.startsWith('/baca/') || currentPage.startsWith('/offline/baca/')){
    const slug = currentPage.startsWith('/baca/') ? currentPage.slice(6) : currentPage.slice(14)
    const currentBookData = externalData['currentBookData']
    const setCurrentBookData = externalData['setCurrentBookData']
    console.log('here')
    if(currentBookData.id == parseInt(slug)){
      if(setCurrentBookData){
        if(!isNaN(number)){
          setCurrentBookData({
            ...currentBookData,
            'currentPage': parseInt(number)
          })
          return `Berhasil ke halaman ${number}`
        } else {
          return 'Tolong sebutkan nomor halaman!'
        }
      } else {
        console.log(setCurrentBookData)
        return 'Maaf, terjadi kesalahan!'
      }
    } else {
      return ''
    }
  } else {
    return 'Anda belum membuka buku apapun!'
  }
}

  const handleVoiceError = (error) => {
    console.log(error)
    restartListening()
  }

  startListening()

  return {
    updateCurrentPage,
    updateExternalData,
    updateSettingsData,
    initialize,
    startListening,
    stopListening,
  }
}
