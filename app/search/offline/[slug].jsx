import { ScrollView, Text, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function SearchScreen() {
  const { slug } = useLocalSearchParams();
  const { data, updateData } = useData();
  const [offlineData, setOfflineData] = useState([])

  const getOfflineData = async () => {
    const JSONOfflineData = await AsyncStorage.getItem('offlineBook')
    const offlineData = JSONOfflineData ? JSON.parse(JSONOfflineData) : [];
    const filteredBooks = offlineData.filter(book =>
        book.title.toLowerCase().includes(slug?.toLowerCase()) || book.author.toLowerCase().includes(slug?.toLowerCase())
    );

    setOfflineData(filteredBooks)
}

  useEffect(() => {
      getOfflineData()
  }, [slug])

  return (
    <View className="bg-white min-h-[100%]">
      <SearchBar placeholder="Cari buku atau penulis"  route="offline/"/>
      
      <ScrollView className="mt-4">
        <Text className="text-xl mb-3 mt-1" style={GlobalStyles.text_bold}>Hasil pencarian untuk: {slug}</Text>
        <View className="flex flex-row flex-wrap justify-between w-full pb-96">
        {
            offlineData.map((book, index) => (
            <BookCard {...book} coverUrl={gambar} key={index} />
          ))
          }
        </View>
      </ScrollView>
    </View>
  );
}