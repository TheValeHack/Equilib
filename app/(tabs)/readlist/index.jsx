import { ScrollView, Text, View } from "react-native";
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
  const { dispatch, externalData } = useContext(AppContext);

  const getSavedData = async () => {
    const JSONSavedData = await AsyncStorage.getItem('savedBook')
    const savedData = JSONSavedData ? JSON.parse(JSONSavedData) : [];
    setSavedData(savedData)
    setLoading(false)
  }

  const setCurrentPage = () => {
      dispatch({
          type: 'SET_EXTERNAL_DATA',
          payload: {
                externalData: {
                    ...externalData,
                    'currentPage': 'readlist'
                    }
          }
      })
  }


  useEffect(() => {
    getSavedData()
    setCurrentPage()
  }, [useIsFocused()])

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <SearchBar placeholder="Cari buku atau penulis" route="readlist/"/>
      <ScrollView className="mt-4">
        
        <Text className="text-xl mb-3 mt-3" style={GlobalStyles.text_bold}>Daftar Bacaan</Text>
        <View className="flex flex-col justify-between w-full pb-96">
            {
                (!loading) && savedData.map((book, index) => {
                return (
                  <View className="mb-4" key={index}>
                    <BookReadList {...book} coverUrl={gambar} key={index} />
                  </View>
                );
              })
            }
        </View>
      </ScrollView>
    </View>
  );
}