import { useLocalSearchParams } from "expo-router"
import { Text, View } from "react-native"
import gambar from "@/assets/images/book_covers/Book-Cover-A-Christmas-Carol.png"
import { Image } from "expo-image"
import  GlobalStyles  from '@/styles/GlobalStyle';
import useData  from '@/hooks/useData';
import { useEffect } from "react";
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Ionicons } from "@expo/vector-icons";


export default function PageScreen () {
    const {slug} = useLocalSearchParams()
    const { data } = useData();


  return (
    <View>
      <View className="flex flex-col items-center justify-center w-full text-center ">
        <Text className="text-lg" style={GlobalStyles.text_bold} >Book</Text>
      </View>
        <View className="flex flex-row w-full ">
        <View className="flex flex-row items-start py-3 pl-3 w-100 rounded-xl">
            <Image source={ gambar } className="w-[25%] h-32 scale-125 mr-3" />
            <View className="w-[70%] pl-3 flex flex-col justify-between h-32">
                <View>
                    <Text style={GlobalStyles.text_bold} className="text-xl ">{data[6]?.title}</Text>
                    <Text style={GlobalStyles.text_medium} className="text-sm ">{data[6]?.author}</Text>
                </View>
                <View className="flex flex-row items-center w-full ">
                <View className="w-[70%] py-2 mt-2 mb-1 rounded-lg  border-primary border-2 mr-5 ">
                    <Text style={GlobalStyles.text_bold} className="text-base text-center text-primary">Baca </Text>
                </View>
                <Ionicons size={36} className="pt-10 text-primary fill-primary" style={{color: 'rgb(239 172 0)'}} name={'bookmark-outline'} />
                </View>
            </View>
        </View>
        </View>
        <View className="mt-3">
          <Text className="text-xl" style={GlobalStyles.text_bold}>Synopsis</Text>
          <Text style={GlobalStyles.text_medium} className="mt-3 text-justify text-slate-500">{data[5].synopsis}</Text>
        </View>
    </View>
  )
}