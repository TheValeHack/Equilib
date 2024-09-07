import { ScrollView, Text, View, Button } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/AppContext";

export default function SearchScreen() {
  const { slug } = useLocalSearchParams();
  const [offlineData, setOfflineData] = useState([])
  const { dispatch, externalData, booklist } = useContext(AppContext);

  const [currentPageNumber, setCurrentPageNumberSearchOffline] = useState(1);
  const booksPerPage = 4;
  const totalPages = Math.ceil(offlineData.filter(book =>
    book.attributes.title.toLowerCase().includes(slug?.toLowerCase()) || book.attributes.author.toLowerCase().includes(slug?.toLowerCase())
).length / booksPerPage);

  const getCurrentPageBooks = () => {
    const startIndex = (currentPageNumber - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return offlineData.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPageNumber < totalPages) {
      setCurrentPageNumberSearchOffline(currentPageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageNumber > 1) {
      setCurrentPageNumberSearchOffline(currentPageNumber - 1);
    }
  };

  const getOfflineData = async () => {
    const JSONOfflineData = await AsyncStorage.getItem('offlineBook')
    const offlineData = JSONOfflineData ? JSON.parse(JSONOfflineData) : [];
    const filteredBooks = offlineData.filter(book =>
        book.attributes.title.toLowerCase().includes(slug?.toLowerCase()) || book.attributes.author.toLowerCase().includes(slug?.toLowerCase())
    );

    setOfflineData(filteredBooks)
  }

  useEffect(() => {
    getOfflineData()
    setCurrentPageNumberSearchOffline(1)
    console.log(totalPages)
    dispatch({
      type: 'SET_EXTERNAL_DATA',
      payload: {
          externalData: {
              ...externalData,
              'setCurrentPageNumberSearchOffline': setCurrentPageNumberSearchOffline
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
      <SearchBar placeholder="Cari buku atau penulis"  route="offline/"/>
      
      <ScrollView className="mt-4">
        <Text className="text-xl mb-3 mt-1" style={GlobalStyles.text_bold}>Hasil pencarian untuk: {slug}</Text>
        <View className="flex flex-row flex-wrap justify-between w-full">
        {
            getCurrentPageBooks().map((book, index) => (
            <BookCard {...book.attributes} id={book.id} coverUrl={process.env.EXPO_PUBLIC_BE_URL + book.attributes.coverUrl.data.attributes.url} key={index} />
          ))
          }
          {
            offlineData.length == 0 && <Text className="text-base mt-2" style={GlobalStyles.text_medium}>Tidak ditemukan buku yang sesuai dengan kata kunci "{slug}".</Text>
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