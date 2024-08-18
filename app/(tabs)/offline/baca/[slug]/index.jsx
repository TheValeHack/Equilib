import { ScrollView, Text, View, Image } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import BookReadList from "@/components/global/BookReadList";
import DownloadBook from "../../../../../components/global/DownloadBook";
import { useLocalSearchParams } from "expo-router";
import Pdf from "react-native-pdf"
import CommandBox from "../../../../../components/global/CommandBox";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

export default function BacaScreen() {
  const { slug } = useLocalSearchParams();
  const { data, updateData } = useData();
  const [bookData, setBookData] = useState({})
  const [loading, setLoading] = useState(true)
  // https://www.planetebook.com/free-ebooks/david-copperfield.pdf
  const setCurrentPage = () => {
    dispatch({
      type: 'SET_EXTERNAL_DATA',
      payload: {
        externalData: {
          'currentPage': `baca/${slug}`
        }
      }
    })
  }

  useEffect(() => {
    setCurrentPage()
    const fetchSettings = async () => {
      const storageOfflineBooks = await AsyncStorage.getItem('offlineBook');
      if(storageOfflineBooks){
        const offlineBooks = JSON.parse(storageOfflineBooks)
        const currentBook = offlineBooks.find((item) => btoa(item.pdfUrl) === slug)
        if(currentBook){
          setBookData(currentBook)
        } else {
          router.push('/offline')
        }
      } else {
        router.push('/offline')
      }
      setLoading(false)
    };
  
    fetchSettings();
  }, [])

  if(loading){
    return <></>
  }
  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <ScrollView className="mt-4">
        <DownloadBook data={bookData} isOffline={true} />
        <Text className="text-xl mb-3 mt-3" style={GlobalStyles.text_bold}>Buku untukmu</Text>
        <View className="w-full h-full">
        <Pdf 
          // key={index}
          // scale={pdfZoom}
          page={1}
          // style={styles.pdf}
          style={{flex: 1, backgroundColor: "#000000", width: "100%", height: 2000}}
          trustAllCerts={false}
          source={{
              uri: bookData["offlineUrl"],
              cache: true
          }}
          onLoadComplete={(numberOfPages, filePath) => {
              //totalPage(numberOfPages)
          }}
          onError={(err)=>{
              console.log(`err pdf : ${err}`)
          }}
          // onPageChanged={(page) => {
          //     currentPage(page)
          //     dispatch({
          //         type: 'SCROLL_PAGE',
          //         payload: {
          //             number: page
          //         }
          //     })
          // }}
      />
        </View>
      </ScrollView>
    </View>
  );
}