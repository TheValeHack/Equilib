import { ScrollView, Text, View } from "react-native";
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

  const getOfflineData = async () => {
    const JSONOfflineData = await AsyncStorage.getItem('offlineBook')
    const offlineData = JSONOfflineData ? JSON.parse(JSONOfflineData) : [];
    setOfflineData(offlineData)
    setLoading(false)
  }

  const setCurrentPage = () => {
      dispatch({
          type: 'SET_EXTERNAL_DATA',
          payload: {
            externalData: {
                ...externalData,
                'currentPage': 'offline'
                }
          }
      })
  }


  useEffect(() => {
    getOfflineData()
    setCurrentPage()
  }, [useIsFocused()])

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <SearchBar placeholder="Cari buku atau penulis" route="offline/" />
      
      <ScrollView className="mt-4">
        <Text className="text-xl mb-3 mt-3" style={GlobalStyles.text_bold}>Buku yang kamu unduh</Text>
        <View className="flex flex-row flex-wrap justify-between w-full pb-96">
            {
              (!loading) && offlineData.map((book, index) => {
                return (<BookCard {...book} coverUrl={gambar} key={index} isOffline={true}/>);
              })
            }
        </View>
      </ScrollView>
    </View>
  );
}