import { ScrollView, Text, View, Button } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import BookReadList from "@/components/global/BookReadList";
import CommandBox from "../../../components/global/CommandBox";
import {useContext, useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useIsFocused} from "@react-navigation/native";
import {AppContext} from "../../../context/AppContext";

export default function ReadListScreen() {
  const { data, updateData } = useData();
  const [savedData, setSavedData] = useState([])
  const [loading, setLoading] = useState(true);
  const { dispatch, externalData, booklist } = useContext(AppContext);

  const [currentPageNumber, setCurrentPageNumberReadlist] = useState(1);
  const booksPerPage = 4;
  const totalPages = Math.ceil(savedData.length / booksPerPage);

  const getCurrentPageBooks = () => {
    const startIndex = (currentPageNumber - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return savedData.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPageNumber < totalPages) {
      setCurrentPageNumberReadlist(currentPageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageNumber > 1) {
      setCurrentPageNumberReadlist(currentPageNumber - 1);
    }
  };

  const getSavedData = async () => {
    const JSONSavedData = await AsyncStorage.getItem('savedBook')
    const savedData = JSONSavedData ? JSON.parse(JSONSavedData) : [];
    setSavedData(savedData)
    setLoading(false)
  }


  useEffect(() => {
    getSavedData()
    setCurrentPageNumberReadlist(1)
    dispatch({
      type: 'SET_EXTERNAL_DATA',
      payload: {
          externalData: {
              ...externalData,
              'setCurrentPageNumberReadlist': setCurrentPageNumberReadlist
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
  }, [useIsFocused()])

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

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <SearchBar placeholder="Cari buku atau penulis" route="readlist/"/>
      <ScrollView className="mt-4">
        
        <Text className="text-xl mb-3 mt-3" style={GlobalStyles.text_bold}>Daftar Bacaan</Text>
        <View className="flex flex-col justify-between w-full">
            {
                (!loading) && getCurrentPageBooks().map((book, index) => {
                return (
                  <View className="mb-4" key={index}>
                    <BookReadList {...book.attributes} id={book.id} coverUrl={process.env.EXPO_PUBLIC_BE_URL + book.attributes.coverUrl.data.attributes.url} key={index} />
                  </View>
                );
              })
            }
            {
              savedData.length == 0 && <Text className="text-base mt-2" style={GlobalStyles.text_medium}>Anda belum menyimpan buku apapun.</Text>
            }
        </View>
        <View className="flex-row justify-between mt-4 mb-96">
          <Button title="Sebelumnya" onPress={handlePreviousPage} color="#EFAC00" disabled={currentPageNumber === 1} />
          <Button title="Selanjutnya" onPress={handleNextPage} color="#EFAC00" disabled={(currentPageNumber === totalPages) || (totalPages === 0)} />
        </View>
      </ScrollView>
    </View>
  );
}