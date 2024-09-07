import { ScrollView, Text, View, Button } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import CommandBox from "../../../components/global/CommandBox";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OfflineScreen() {
  const { data, updateData } = useData();
  const [offlineData, setOfflineData] = useState([])
  const [loading, setLoading] = useState(true);
  const { dispatch, externalData } = useContext(AppContext);

  const [currentPageNumber, setCurrentPageNumberOffline] = useState(1);
  const booksPerPage = 4;
  const totalPages = Math.ceil(offlineData.length / booksPerPage);

  const getCurrentPageBooks = () => {
    const startIndex = (currentPageNumber - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return offlineData.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPageNumber < totalPages) {
      setCurrentPageNumberOffline(currentPageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageNumber > 1) {
      setCurrentPageNumberOffline(currentPageNumber - 1);
    }
  };

  const getOfflineData = async () => {
    const JSONOfflineData = await AsyncStorage.getItem('offlineBook')
    const offlineData = JSONOfflineData ? JSON.parse(JSONOfflineData) : [];
    setOfflineData(offlineData)
    setLoading(false)
  }


  useEffect(() => {
    getOfflineData()
    setCurrentPageNumberOffline(1)
    dispatch({
      type: 'SET_EXTERNAL_DATA',
      payload: {
          externalData: {
              ...externalData,
              'setCurrentPageNumberOffline': setCurrentPageNumberOffline
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
      <SearchBar placeholder="Cari buku atau penulis" route="offline/" />
      
      <ScrollView className="mt-4">
        <Text className="text-xl mb-3 mt-3" style={GlobalStyles.text_bold}>Buku yang kamu unduh</Text>
        <View className="flex flex-row flex-wrap justify-between w-full">
            {
              (!loading) && getCurrentPageBooks().map((book, index) => {
                return (<BookCard {...book.attributes} id={book.id} coverUrl={process.env.EXPO_PUBLIC_BE_URL + book.attributes.coverUrl.data.attributes.url} key={index} isOffline={true}/>);
              })
            }
            {
              offlineData.length == 0 && <Text className="text-base mt-2" style={GlobalStyles.text_medium}>Anda belum mengunduh buku apapun.</Text>
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