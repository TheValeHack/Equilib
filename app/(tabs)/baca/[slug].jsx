import { ScrollView, Text, View, Image } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import BookReadList from "@/components/global/BookReadList";
import DownloadBook from "../../../components/global/DownloadBook";
import { useLocalSearchParams } from "expo-router";
import Pdf from "react-native-pdf"
import CommandBox from "../../../components/global/CommandBox";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../context/AppContext";

export default function BacaScreen() {
  const { dispatch, externalData } = useContext(AppContext)
  const { slug } = useLocalSearchParams();
  const { data, detailData, fetchDetailData } = useData(slug);

    useEffect(() => {
        fetchDetailData()
    }, [slug])


  return (
    <View className="flex-1 min-h-screen pt-4 pb-24">
        <CommandBox />
        <DownloadBook data={detailData} />
        <View className="mt-4 h-full">
          <Pdf 
              // key={index}
              // scale={pdfZoom}
              page={1}
              // style={styles.pdf}
              style={{flex: 1, width: "100%"}}
              trustAllCerts={false}
              source={{
                  uri: "https://internetmediagroup.bg/wp-content/uploads/2023/03/the-psychology-of-money-by-morgan-housel.pdf",
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