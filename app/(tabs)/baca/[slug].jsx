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
  const { data, updateData } = useData();
  // https://www.planetebook.com/free-ebooks/david-copperfield.pdf


  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <ScrollView className="mt-4">
        <DownloadBook data={data[0]} />
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
      </ScrollView>
    </View>
  );
}