import { router, usePathname } from 'expo-router'
import Voice from '@react-native-voice/voice'
import TextToSpeechService from './TextToSpeechService'
import commandsData from './../data/commands.json'
import getSettings from '../util/getSettings'
import {getPageFromText, isNumeric} from "../util/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import downloadBook from '../util/downloadBook'
import fetchBooks from '../util/fetchBooks'
import steps from '../data/steps.json'
import * as FileSystem from 'expo-file-system';

export default function VoiceCommandService(externalData, setCommands) {
  let settingsValue = null;
  let currentPage = '/'
  let booksData = []
  let offlineBooksData = []
  let savedBooksData = []
  let booksListIndex = [0, 0]
  let booksPerPage = 4
  let doneFetch = false
  let availableVoices = []

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

  const fetchSavedBooksData = async () => {
    try {
      const JSONSavedBook = await AsyncStorage.getItem('savedBook')
      const savedBook = JSONSavedBook ? JSON.parse(JSONSavedBook) : [];
      savedBooksData = savedBook
    }  catch (error) {
      console.error('Failed to fetch book data:', error);
    }
  }

  const initialize = async () => {
    await fetchSettings();
    await fetchBookData();
    availableVoices = await TextToSpeechService.getAvailableVoices()
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
  const updateBooksListIndex = (startIndex, lastIndex) => {
    booksListIndex = [startIndex, lastIndex];
    console.log('vcs: ' + booksListIndex)
    if(startIndex == 0){
      doneFetch = false;
    } else {
      doneFetch = true;
    }
  };

  const startListening = () => {
    Voice.removeAllListeners() 

    Voice.onSpeechResults = (results) => {
      console.log('Speech Results:', results)
      if (results && results.value && results.value.length > 0) {
        const spokenText = results.value[0].toLowerCase()
        setCommands(prevCommands => [...prevCommands, spokenText]) 

        if (isListeningForCommand && !TextToSpeechService.isStoppedForcibly) {
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
    } else if(commandsData.keyword.includes(command.replace("-", " "))){
      response = 'Halo! Silakan beri perintah'
    } else if (commandsData.stop.some(prefix => command == prefix)) {
      response = 'Input suara diberhentikan.'
      TextToSpeechService.stop()
      isListeningForCommand = false
    } else if (commandsData.next.some(prefix => command == prefix)) {
      response = changePanduan('next');
    } else if (commandsData.previous.some(prefix => command == prefix)) {
      response = changePanduan('previous');
    } else if (commandsData.skip.some(prefix => command == prefix)) {
      response = changePanduan('skip');
    } else if (commandsData.close.some(prefix => command == prefix)) {
      response = changePanduan('close');
    } else if (commandsData.openPanduan.some(prefix => command == prefix)) {
      response = openPanduan();
    } else if (commandsData.readPanduan.some(prefix => command == prefix)) {
      response = readPanduan();
    } else if (commandsData.back.some(prefix => command.startsWith(prefix))) {
      response = goBack()
    } else if(commandsData.changeWomanVoice.some(prefix => command.startsWith(prefix))){
      response = changeVoice(0)
    }  else if(commandsData.changeManVoice.some(prefix => command.startsWith(prefix))){
      response = changeVoice(1)
    } else if(commandsData.increaseSpeed.some(prefix => command == prefix)){
      response = changeSpeed('increase')
    } else if(commandsData.decreaseSpeed.some(prefix => command == prefix)){
      response = changeSpeed('decrease')
    } else if(commandsData.normalSpeed.some(prefix => command == prefix)){
      response = changeSpeed('normal')
    } else if (commandsData.speakSavedBookData.some(prefix => command.startsWith(prefix))) {
      response = await speakSavedBookData();
    } else if (commandsData.cariBuku.some(prefix => command.startsWith(prefix))) {
      const matchingCommand = commandsData.cariBuku.find(prefix => command.startsWith(prefix));
      const title = command.replace(matchingCommand, '').trim();
      response = cariBuku(title);
    } else if (commandsData.readBook.some(prefix => command.startsWith(prefix))) {
      response = readCurrentBook();
    } else if (commandsData.speakBookData.some(prefix => command.startsWith(prefix))) {
      response = await speakBookData();
    } else if (commandsData.nextBookData.some(prefix => command.startsWith(prefix))) {
      response = await nextBookData();
    }  else if (commandsData.previousBookData.some(prefix => command.startsWith(prefix))) {
      response = await previousBookData();
    } else if (commandsData.readPage.some(prefix => command.startsWith(prefix))) {
      response = await readCurrentPage();
    }  else if (commandsData.readAllPage.some(prefix => command.startsWith(prefix))) {
      response = await readAllPage();
    }  else if (commandsData.nextPage.some(prefix => command.startsWith(prefix))) {
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
      if(settingsValue["tidak_merespon_perintah_salah"]["status"]){
        response = ''
      } else if (settingsValue["perintah_salah"]["status"]) {
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

  const changePanduan = (operator) => {
    let response = 'Maaf, perintah tidak valid!'
    if(currentPage == '/'){
      if(externalData['changePanduan']){
        externalData['changePanduan'](operator)
        switch(operator){
          case 'next':
            response = 'Berhasil berpindah ke panduan selanjutnya.'
            break
          case 'previous':
            response = 'Berhasil berpindah ke panduan sebelumnya.'
            break
          default:
            response = 'Berhasil menutup panduan.'
            break
        }
      }
    }

    return response
  }

  const changeVoice = (index) => {
    if(index == 0){
      TextToSpeechService.changeVoice(0)
      return 'Berhasil mengubah suara ke suara wanita'
    } else if(index == 1) {
      TextToSpeechService.changeVoice(1)
      return 'Berhasil mengubah suara ke suara pria'
    } else {
      return 'Suara tidak valid.'
    }
  }

  const changeSpeed = (speed) => {
    if(speed == 'decrease'){
      if(TextToSpeechService.rate <= 0.25){
        return 'Kecepatan suara sudah yang paling lambat.'
      } else {
        TextToSpeechService.setRate(TextToSpeechService.rate - 0.25)
        return 'Kecepatan suara berhasil diperlambat.'
      }
    } else if(speed == 'increase') {
      if(TextToSpeechService.rate >= 2.0){
        return 'Kecepatan suara sudah yang paling cepat.'
      } else {
        TextToSpeechService.setRate(TextToSpeechService.rate + 0.25)
        return 'Kecepatan suara berhasil dipercepat.'
      }
    } else {
      TextToSpeechService.setRate(1.0)
      return 'Kecepatan suara kembali normal.'
    }
  }

  const openPanduan = () => {
    if(currentPage == '/'){
      if(externalData['openPanduan']){
        externalData['openPanduan']()
        return 'Panduan berhasil dibuka.'
      } else {
        return 'Maaf, terjadi kesalahan.'
      }
    }
    return 'Silahkan ke halaman beranda untuk membuka panduan.'
  }

  const readPanduan = () => {
    if(currentPage == '/'){
      if(isNumeric(externalData['currentPanduan'])){
        if(steps[externalData['currentPanduan']]){
          return steps[externalData['currentPanduan']]['step']
        } else {
          return 'Panduan tidak valid.'
        }
      } else {
        console.log(externalData)
        return 'Maaf, terjadi kesalahan.'
      }
    }
    return 'Silahkan ke halaman beranda untuk membaca panduan.'
  }

  const navigateToPage = (page) => {
    const namaHalaman = {
      'beranda': '/',
      'settings': '/settings',
      'offline': '/offline',
      'readlist': '/readlist'
    }
    const suaraHalaman = {
      'beranda': 'beranda',
      'settings': 'pengaturan',
      'offline': 'unduhan',
      'readlist': 'daftar bacaan'
    }
    const findPage = getPageFromText(page)
    if(Object.keys(namaHalaman).includes(findPage)){
      console.log('Navigating to:', findPage)
      router.push(namaHalaman[findPage])
      return `Berhasil pindah ke halaman ${suaraHalaman[findPage]}`
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
      router.push(`/search${currentPage}/${judul}`)
    } else {
        router.push(`/search/${judul}`)
    }
    return `Berhasil mencari buku dengan judul ${judul}`
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

    const nextBookData = async () => {
      if(currentPage == '/' || currentPage == '/readlist' || currentPage == '/offline' || currentPage.startsWith('/search/')){
        if(!doneFetch){
          if(currentPage == '/readlist' || currentPage.startsWith('/search/readlist')){
            await fetchSavedBooksData()
          } else if(currentPage == '/offline' || currentPage.startsWith('/search/offline')){
            await fetchOfflineBooksData()
          }
        }

        let booksDataList = null
        let setCurrentPageNumber = null

        switch(currentPage){
          case '/':
            booksDataList = booksData
            setCurrentPageNumber = externalData['setCurrentPageNumber']
            break
          case '/readlist':
            booksDataList = savedBooksData
            setCurrentPageNumber = externalData['setCurrentPageNumberReadlist']
            break
          case '/offline':
            booksDataList = offlineBooksData
            setCurrentPageNumber = externalData['setCurrentPageNumberOffline']
            break
          default:
            if(currentPage.startsWith('/search')){
              judul = ""
              if(currentPage.startsWith('/search/readlist/')){
                judul = currentPage.slice(17).trim();
                booksDataList = savedBooksData.filter(book =>
                    book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                )
                setCurrentPageNumber = externalData['setCurrentPageNumberSearchReadlist']
              } else if(currentPage.startsWith('/search/offline/')){
                judul = currentPage.slice(16).trim();
                booksDataList = offlineBooksData.filter(book =>
                    book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                )
                setCurrentPageNumber = externalData['setCurrentPageNumberSearchOffline']
              } else {
                judul = currentPage.slice(8).trim();
                booksDataList = booksData.filter(book =>
                    book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                )
                setCurrentPageNumber = externalData['setCurrentPageNumberSearch']
              }
            }
            break
        }
        const currentPageNumber = (booksListIndex[0] /  booksPerPage) + 1
        const totalPages = Math.ceil(booksDataList.length / booksPerPage);

        if(booksDataList.length == 0){
          return "Tidak ada buku apapun pada daftar."
        } else {
          if (currentPageNumber < totalPages) {
            const startIndex = (currentPageNumber) * booksPerPage;
            const endIndex = startIndex + booksPerPage;
    
            setCurrentPageNumber(currentPageNumber + 1)
            booksListIndex = [startIndex, endIndex]
    
            return 'Berhasil berpindah ke daftar selanjutnya.'
          } else {
            return 'Anda sudah berada di daftar terakhir.'
          }
        }
      } else {
        return 'Anda tidak berada dalam halaman daftar buku apapun.'
      }
    }

    const previousBookData = async () => {
      if(currentPage == '/' || currentPage == '/readlist' || currentPage == '/offline' || currentPage.startsWith('/search/')){
        if(!doneFetch){
          if(currentPage == '/readlist' || currentPage.startsWith('/search/readlist')){
            await fetchSavedBooksData()
          } else if(currentPage == '/offline' || currentPage.startsWith('/search/offline')){
            await fetchOfflineBooksData()
          }
        }

        let booksDataList = null
        let setCurrentPageNumber = null

        switch(currentPage){
          case '/':
            booksDataList = booksData
            setCurrentPageNumber = externalData['setCurrentPageNumber']
            break
          case '/readlist':
            booksDataList = savedBooksData
            setCurrentPageNumber = externalData['setCurrentPageNumberReadlist']
            break
          case '/offline':
            booksDataList = offlineBooksData
            setCurrentPageNumber = externalData['setCurrentPageNumberOffline']
            break
          default:
            if(currentPage.startsWith('/search')){
              judul = ""
              if(currentPage.startsWith('/search/readlist/')){
                judul = currentPage.slice(17).trim();
                booksDataList = savedBooksData.filter(book =>
                    book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                )
                setCurrentPageNumber = externalData['setCurrentPageNumberSearchReadlist']
              } else if(currentPage.startsWith('/search/offline/')){
                judul = currentPage.slice(16).trim();
                booksDataList = offlineBooksData.filter(book =>
                    book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                )
                setCurrentPageNumber = externalData['setCurrentPageNumberSearchOffline']
              } else {
                judul = currentPage.slice(8).trim();
                booksDataList = booksData.filter(book =>
                    book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                )
                setCurrentPageNumber = externalData['setCurrentPageNumberSearch']
              }
            }
            break
        }
        const currentPageNumber = (booksListIndex[0] /  booksPerPage) + 1
        const totalPages = Math.ceil(booksData.length / booksPerPage);
          if (currentPageNumber > 1) {
            const startIndex = (currentPageNumber - 1) * booksPerPage;
            const endIndex = startIndex + booksPerPage;
    
            setCurrentPageNumber(currentPageNumber - 1)
            booksListIndex = [startIndex, endIndex]
    
            return 'Berhasil berpindah ke daftar sebelumnya.'
          } else {
            return 'Anda sudah berada di daftar pertama.'
          }
      } else {
        return 'Anda tidak berada dalam halaman daftar buku apapun.'
      }
    }

    const speakBookData = async () => {
        let bookToSpeak = null;
        let speakText = ""
        let nullText = ""
        if(currentPage == '/' || currentPage == '/readlist' || currentPage == '/offline' || currentPage.startsWith('/search/')){
          if(!doneFetch){
            if(currentPage == '/readlist' || currentPage.startsWith('/search/readlist')){
              await fetchSavedBooksData()
            } else if(currentPage == '/offline' || currentPage.startsWith('/search/offline')){
              await fetchOfflineBooksData()
            }
          }
          switch(currentPage){
            case '/':
              bookToSpeak = booksData
              speakText = "Berikut daftar buku teratas pada halaman beranda."
              nullText = "Tidak ditemukan buku apapun pada beranda."
              break
            case '/readlist':
              bookToSpeak = savedBooksData
              speakText = "Berikut daftar buku teratas yang anda simpan."
              nullText = "Anda belum menyimpan buku apapun."
              break
            case '/offline':
              bookToSpeak = offlineBooksData
              speakText = "Berikut daftar buku teratas yang anda unduh."
              nullText = "Anda belum mengunduh buku apapun."
              break
            default:
              if(currentPage.startsWith('/search')){
                judul = ""
                if(currentPage.startsWith('/search/readlist/')){
                  judul = currentPage.slice(17).trim();
                  bookToSpeak = savedBooksData.filter(book =>
                      book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                  )
                  console.log(bookToSpeak)
                  speakText = `Berikut daftar buku tersimpan teratas yang sesuai dengan kata kunci ${judul}.`
                  nullText = `Tidak ditemukan hasil yang sesuai dengan kata kunci ${judul}.`
                } else if(currentPage.startsWith('/search/offline/')){
                  judul = currentPage.slice(16).trim();
                  bookToSpeak = offlineBooksData.filter(book =>
                      book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                  )
                  speakText = `Berikut daftar buku terunduh teratas yang sesuai dengan kata kunci ${judul}.`
                  nullText = `Tidak ditemukan hasil yang sesuai dengan kata kunci ${judul}.`
                } else {
                  judul = currentPage.slice(8).trim();
                  bookToSpeak = booksData.filter(book =>
                      book.attributes.title.toLowerCase().includes(judul?.toLowerCase()) || book.attributes.author.toLowerCase().includes(judul?.toLowerCase())
                  )
                  speakText = `Berikut daftar buku teratas yang sesuai dengan kata kunci ${judul}.`
                  nullText = `Tidak ditemukan hasil yang sesuai dengan kata kunci ${judul} .`
                }
                if(judul.length == 0){
                  bookToSpeak = []
                  speakText = ""
                  nullText = `Tidak ditemukan hasil yang sesuai dengan kata kunci ${judul} .`
                }
              }
              break
          }
          if(bookToSpeak.length == 0){
            return nullText
          } else {
            let response = ""
            console.log('ini' + booksListIndex)
            const speakedBooks = bookToSpeak.slice(booksListIndex[0], booksListIndex[1])
            if(booksListIndex[0] == 0){
              response += speakText
            }
            for(book of speakedBooks){
              response += `Buku ${book.id} berjudul ${book.attributes.title} oleh ${book.attributes.author}.`
            }
            return response
          }
        } else {
          return 'Anda tidak berada dalam halaman daftar buku apapun.'
        }
    }

    const speakSavedBookData = async () => {
        const JSONSavedBook = await AsyncStorage.getItem('savedBook')
        const savedBook = JSONSavedBook ? JSON.parse(JSONSavedBook) : []
        let response = 'Berikut adalah buku yang telah disimpan: '
        savedBook.forEach((book, index) => {
        response += `${index + 1}. ${book.attributes.title} oleh ${book.attributes.author}. `
        })

        return response
  }

    const openBookDetail = async (title) => {
        const book = booksData.find(book => book.attributes.title.toLowerCase() === title.toLowerCase())
        if (book) {
          let detailPath = '/detail/'
          if(currentPage.startsWith('/offline') || currentPage.startsWith('/search/offline')){
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

    const openBookDetailByIndex = async (index) => {
        if (index > 0 && isNumeric(index)) {
          const book = booksData.find(book => book.id == index)
          console.log(index)
          console.log(book)
          if(!book){
            return 'Buku tidak ditemukan!'
          }
          let detailPath = '/detail/'
          if(currentPage.startsWith('/offline') || currentPage.startsWith('/search/offline')){
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
      const pageText = jsonObject.find(item => item.page+1 == currentBookData['currentPage'])
      if(pageText){
        console.log(pageText.page)
        return pageText.text
      } else {
        return 'Halaman tidak ditemukan.'
      }
    }  else {
      return ''
    }
  } else {
    return 'Anda belum membuka buku apapun!'
  }
}

const readAllPage = async () => {
  if(currentPage.startsWith('/baca/') || currentPage.startsWith('/offline/baca/')){
    const slug = currentPage.startsWith('/baca/') ? currentPage.slice(6) : currentPage.slice(14)
    const currentBookData = externalData['currentBookData']
    if(currentBookData.id == parseInt(slug)){
      const jsonString = await FileSystem.readAsStringAsync(currentBookData['transcriptLocation'], { encoding: FileSystem.EncodingType.UTF8 });
      const jsonObject = JSON.parse(jsonString);
      let pageNumber = currentBookData['currentPage'] == 1 ? 1 :  currentBookData['currentPage'] - 2
      if(jsonObject[pageNumber]){
        function readBook(pageNumber){
          if(pageNumber < jsonObject.length){
            console.log(pageNumber)
            let newPage = jsonObject[pageNumber]
            TextToSpeechService.speak(newPage.text, {
              onDone: () => {
                goToNextPage()
                return readBook(pageNumber+1)
              }
            })
          } else {
            return "Buku telah selesai dibaca."
          }
        }
        
        return readBook(pageNumber)
      } else {
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
    updateBooksListIndex,
    initialize,
    startListening,
    stopListening,
  }
}
