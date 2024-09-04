import { useLocalSearchParams } from "expo-router"
import { Text, View } from "react-native"
import gambar from "@/assets/images/book_covers/Book-Cover-A-Christmas-Carol.png"
import { Image } from "expo-image"
import  GlobalStyles  from '@/styles/GlobalStyles';
import useData  from '@/hooks/useData';
import {useContext, useEffect, useState} from "react";
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CommandBox from "../../../../../components/global/CommandBox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AppContext} from "../../../../../context/AppContext";
import { useIsFocused } from "@react-navigation/native";

export default function PageScreen () {
    const {slug} = useLocalSearchParams()
    const { dispatch } = useContext(AppContext);
    const [dataBukuOffline, setDataBukuOffline] = useState({})
    const [loading, setLoading] = useState(true)
    const isFocused = useIsFocused()

    const getOfflineBookData = async () => {
      const JSONOfflineData = await AsyncStorage.getItem('offlineBook')
      const offlineData = JSONOfflineData ? JSON.parse(JSONOfflineData) : [];
      const currentOffineBook = offlineData.find((item) => item.id == parseInt(slug))
      setDataBukuOffline(currentOffineBook)
    }
    
    useEffect(() => {
        setLoading(true)
        getOfflineBookData()
        setLoading(false)

        console.log(dataBukuOffline?.id)
    }, [isFocused])

  if(loading){
    return <></>
  }

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <View className="flex flex-col items-center justify-center w-full text-center ">
        <Text className="text-lg" style={GlobalStyles.text_bold} >Book</Text>
      </View>
        <View className="flex flex-row w-full mt-6">
        <View className="flex flex-row items-start py-3 pl-3 w-100 rounded-xl">
            <Image source={ process.env.EXPO_PUBLIC_BE_URL + dataBukuOffline?.attributes?.coverUrl?.data?.attributes?.url } className="w-[25%] h-32 scale-125 mr-3" />
            <View className="w-[70%] pl-3 flex flex-col justify-between h-32">
                <View>
                    <Text style={GlobalStyles.text_bold} className="text-xl ">{dataBukuOffline?.attributes?.title}</Text>
                    <Text style={GlobalStyles.text_medium} className="text-sm ">{dataBukuOffline?.attributes?.author}, {dataBukuOffline?.attributes?.year}</Text>
                </View>
                <View className="flex flex-row items-center w-full ">
                  <View className="w-[70%] py-2 mt-2 mb-1 rounded-lg  border-primary border-2 mr-5 " onTouchEndCapture={() => router.push(`/offline/baca/${dataBukuOffline?.id}`)}>
                      <Text style={GlobalStyles.text_bold} className="text-base text-center text-primary">Baca</Text>
                  </View>
                </View>
            </View>
        </View>
        </View>
        <View className="mt-3">
          <Text className="text-xl" style={GlobalStyles.text_bold}>Synopsis</Text>
          <Text style={GlobalStyles.text_medium} className="mt-3 text-justify text-slate-500">{dataBukuOffline?.attributes?.synopsis}</Text>
        </View>
    </View>
  )
}