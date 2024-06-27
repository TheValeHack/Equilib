import { ScrollView, Text, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyle";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import BookReadList from "@/components/global/BookReadList";
import { router } from "expo-router";

export default function HomeScreen() {
  const { data, updateData } = useData();

  return (
    <View onTouchEndCapture={()=>router.push(`detail/${btoa(data.pdfUrl)}`)} >
      <Text className="mb-3 text-xl" style={GlobalStyles.text_bold}>Selamat datang!</Text>
      <SearchBar placeholder="Cari buku atau penulis" route="" />
      
      <ScrollView className="mt-4">
        <BookReadList {...data[0]} coverUrl={gambar} />
        <Text className="mt-3 mb-3 text-xl" style={GlobalStyles.text_bold}>Buku untukmu</Text>
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