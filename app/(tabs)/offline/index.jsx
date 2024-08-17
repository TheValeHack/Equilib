import { ScrollView, Text, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import CommandBox from "../../../components/global/CommandBox";

export default function OfflineScreen() {
  const { data, updateData } = useData();

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <SearchBar placeholder="Cari buku atau penulis" route="offline/" />
      
      <ScrollView className="mt-4">
        <Text className="text-xl mb-3 mt-3" style={GlobalStyles.text_bold}>Buku yang kamu unduh</Text>
        <View className="flex flex-row flex-wrap justify-between w-full pb-96">
            {
              data.map((book, index) => {
                return (<BookCard {...book} coverUrl={gambar} key={index}/>);
              })
            }
        </View>
      </ScrollView>
    </View>
  );
}