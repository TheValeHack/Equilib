import { ScrollView, Text, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyle";
import useData from "@/hooks/useData";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import { useLocalSearchParams } from "expo-router";
import BookReadList from "@/components/global/BookReadList";

export default function ReadListSearchScreen() {
  const { slug } = useLocalSearchParams();
  const { data, updateData } = useData();

  const filteredBooks = data.filter(book =>
    book.title.toLowerCase().includes(slug?.toLowerCase()) || book.author.toLowerCase().includes(slug?.toLowerCase())
  );

  return (
    <View className="bg-white min-h-[100%]">
      <SearchBar placeholder="Cari buku atau penulis" route="readlist/"/>
      
      <ScrollView className="mt-4">
        <Text className="text-xl mb-3 mt-1" style={GlobalStyles.text_bold}>Hasil pencarian untuk: {slug}</Text>
        <View className="flex flex-col w-100 justify-between w-full pb-96">
        {
            filteredBooks.map((book, index) => (
            <View key={index} className="mb-4">
              <BookReadList {...book} coverUrl={gambar} key={index} />
            </View>
          ))
          }
        </View>
      </ScrollView>
    </View>
  );
}