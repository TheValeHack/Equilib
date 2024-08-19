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

export default function BacaScreen() {
  const { slug } = useLocalSearchParams();
  const { data, detailData, fetchDetailData } = useData(slug);
  const [bookData, setBookData] = useState({})
  const [loading, setLoading] = useState(true)
  // https://www.planetebook.com/free-ebooks/david-copperfield.pdf

  useEffect(() => {
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

  useEffect(() => {
    fetchDetailData()
}, [slug])

  if(loading){
    return <></>
  }
  return (
    <View className="flex-1 min-h-screen pt-4 pb-24">
        <CommandBox />
        <DownloadBook data={detailData} isOffline={true}/>
        <View className="mt-4 h-full">
          <Pdf 
              // key={index}
              // scale={pdfZoom}
              page={1}
              // style={styles.pdf}
              style={{flex: 1, width: "100%"}}
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
    </View>
  );
}