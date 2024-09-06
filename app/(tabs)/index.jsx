import { ScrollView, Text, View, Button } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import BookReadList from "@/components/global/BookReadList";
import { useState, useRef, useEffect, useContext } from "react";
import VoiceCommandService from "../../services/VoiceCommandService";
import { AppContext } from "../../context/AppContext";
import getSettings from "../../util/getSettings";
import CommandBox from "../../components/global/CommandBox";
import {useIsFocused} from "@react-navigation/native";
import { usePathname } from "expo-router";

export default function HomeScreen() {
  const currentPage = usePathname();
  const { externalData, settingsData, dispatch, booklist } = useContext(AppContext);
  const { data, updateData } = useData();
  const [commands, setCommands] = useState([]);
  const voiceCommandServiceRef = useRef(null);
  const isFocused = useIsFocused();

  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const booksPerPage = 4;
  const totalPages = Math.ceil(data.length / booksPerPage);

  const getCurrentPageBooks = () => {
    const startIndex = (currentPageNumber - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    console.log('di index : ' + data.slice(startIndex, endIndex).length)
    return data.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPageNumber < totalPages) {
      setCurrentPageNumber(currentPageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageNumber > 1) {
      setCurrentPageNumber(currentPageNumber - 1);
    }
  };

  useEffect(() => {
    setCurrentPageNumber(1)
    dispatch({
      type: 'SET_EXTERNAL_DATA',
      payload: {
          externalData: {
              ...externalData,
              'setCurrentPageNumber': setCurrentPageNumber
          }
      }
    })

    const startIndex = (currentPageNumber - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    dispatch({
      type: 'SET_BOOKLIST_INDEX',
      payload: {
          booklist: [startIndex, endIndex]
      }
    })
  }, [isFocused])

  useEffect(() => {
    const startIndex = (currentPageNumber - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    console.log([startIndex, endIndex])
    dispatch({
      type: 'SET_BOOKLIST_INDEX',
      payload: {
          booklist: [startIndex, endIndex]
      }
    })
  }, [currentPageNumber])

  useEffect(() => {
    voiceCommandServiceRef.current = VoiceCommandService({}, setCommands);
    voiceCommandServiceRef.current.initialize();

    const fetchSettings = async () => {
      let settingsValue = await getSettings();
      dispatch({
        type: 'SET_SETTINGS',
        payload: {
          settingsData: settingsValue
        }
      })
    };
  
    fetchSettings();

    return () => {
      voiceCommandServiceRef.current.stopListening();
    };
  }, []);

  useEffect(() => {
    voiceCommandServiceRef.current.updateCurrentPage(currentPage)
    voiceCommandServiceRef.current.updateBooksListIndex(0)
  }, [currentPage])

  useEffect(() => {
    console.log('booklist: ' + booklist)
    voiceCommandServiceRef.current.updateBooksListIndex(booklist[0], booklist[1])
  }, [booklist])

  useEffect(() => {
    if (voiceCommandServiceRef.current) {
      voiceCommandServiceRef.current.updateExternalData(externalData);
    }
  }, [externalData]);

  useEffect(() => {
    if (voiceCommandServiceRef.current) {
      if(settingsData != {}){
        voiceCommandServiceRef.current.updateSettingsData(settingsData);
      }
    }
  }, [settingsData]);

  useEffect(() => {
    if(commands.length > 0){
      dispatch({
        type: 'SET_CURRENT_COMMAND',
        payload: {
          currentCommand: commands[commands.length - 1]
        }
      })
    }
  }, [commands])

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <Text className="mb-3 text-xl" style={GlobalStyles.text_bold}>Selamat datang!</Text>
      <SearchBar placeholder="Cari buku atau penulis" route="" />
      
      <ScrollView className="mt-4">
        {
          // (lastReadBook) ? <BookReadList {...lastReadBook} coverUrl={gambar} /> : <></>
        }
        <Text className="mt-3 mb-3 text-xl" style={GlobalStyles.text_bold}>Buku untukmu</Text>
        <View className="flex flex-row flex-wrap justify-between w-full">
          {
            getCurrentPageBooks().map((book, index) => (
              <BookCard {...book.attributes} id={book.id} coverUrl={process.env.EXPO_PUBLIC_BE_URL + book.attributes.coverUrl.data.attributes.url} key={index} />
            ))
          }
        </View>

        <View className="flex-row justify-between mt-4 mb-96">
          <Button title="Sebelumnya" onPress={handlePreviousPage} color="#EFAC00" disabled={currentPageNumber === 1} />
          <Button title="Selanjutnya" onPress={handleNextPage} color="#EFAC00" disabled={currentPageNumber === totalPages} />
        </View>
      </ScrollView>
    </View>
  );
}