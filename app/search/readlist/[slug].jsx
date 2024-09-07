import { ScrollView, Text, View, Button } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import { useLocalSearchParams } from "expo-router";
import BookReadList from "@/components/global/BookReadList";
import {useEffect, useState, useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../../../context/AppContext";

export default function ReadListSearchScreen() {
  const { slug } = useLocalSearchParams();
  const [savedData, setSavedData] = useState([])
  const { dispatch, externalData, booklist } = useContext(AppContext);

  const [currentPageNumber, setCurrentPageNumberSearchReadlist] = useState(1);
  const booksPerPage = 4;
  const totalPages = Math.ceil(savedData.filter(book =>
    book.attributes.title.toLowerCase().includes(slug?.toLowerCase()) || book.attributes.author.toLowerCase().includes(slug?.toLowerCase())
).length / booksPerPage);

  const getCurrentPageBooks = () => {
    const startIndex = (currentPageNumber - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return savedData.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPageNumber < totalPages) {
      setCurrentPageNumberSearchReadlist(currentPageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageNumber > 1) {
      setCurrentPageNumberSearchReadlist(currentPageNumber - 1);
    }
  };

  const getSavedData = async () => {
    const JSONSavedData = await AsyncStorage.getItem('savedBook')
    const savedData = JSONSavedData ? JSON.parse(JSONSavedData) : [];
    const filteredBooks = savedData.filter(book =>
        book.attributes.title.toLowerCase().includes(slug?.toLowerCase()) || book.attributes.author.toLowerCase().includes(slug?.toLowerCase())
    );

    setSavedData(filteredBooks)
  }

  useEffect(() => {
    getSavedData()
    setCurrentPageNumberSearchReadlist(1)
    dispatch({
      type: 'SET_EXTERNAL_DATA',
      payload: {
          externalData: {
              ...externalData,
              'setCurrentPageNumberSearchReadlist': setCurrentPageNumberSearchReadlist
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
  }, [slug])

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
    <View className="bg-white min-h-[100%]">
      <SearchBar placeholder="Cari buku atau penulis" route="readlist/"/>
      
      <ScrollView className="mt-4">
        <Text className="text-xl mb-3 mt-1" style={GlobalStyles.text_bold}>Hasil pencarian untuk: {slug}</Text>
        <View className="flex flex-col w-100 justify-between w-full">
        {
            getCurrentPageBooks().map((book, index) => (
            <View key={index} className="mb-4">
              <BookReadList {...book.attributes} id={book.id} coverUrl={process.env.EXPO_PUBLIC_BE_URL + book.attributes.coverUrl.data.attributes.url} key={index} />
            </View>
          ))
          }
          {
            savedData.length == 0 && <Text className="text-base mt-2" style={GlobalStyles.text_medium}>Tidak ditemukan buku yang sesuai dengan kata kunci "{slug}".</Text>
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