import { ScrollView, Text, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import BookReadList from "@/components/global/BookReadList";

export default function ReadListScreen() {
  const { data, updateData } = useData();

  return (
    <View>
      <SearchBar placeholder="Cari buku atau penulis" route="readlist/"/>
      <ScrollView className="mt-4">
        
        <Text className="text-xl mb-3 mt-3" style={GlobalStyles.text_bold}>Daftar Bacaan</Text>
        <View className="flex flex-col justify-between w-full pb-96">
            {
              data.map((book, index) => {
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