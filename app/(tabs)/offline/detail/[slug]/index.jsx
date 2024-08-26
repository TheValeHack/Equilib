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

export default function PageScreen () {
    const {slug} = useLocalSearchParams()
    const { dispatch } = useContext(AppContext);
    const { data, detailData, fetchDetailData } = useData(slug);

    useEffect(() => {
        fetchDetailData()
    }, [slug])


  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <View className="flex flex-col items-center justify-center w-full text-center ">
        <Text className="text-lg" style={GlobalStyles.text_bold} >Book</Text>
      </View>
        <View className="flex flex-row w-full ">
        <View className="flex flex-row items-start py-3 pl-3 w-100 rounded-xl">
            <Image source={ gambar } className="w-[25%] h-32 scale-125 mr-3" />
            <View className="w-[70%] pl-3 flex flex-col justify-between h-32">
                <View>
                    <Text style={GlobalStyles.text_bold} className="text-xl ">{detailData?.title}</Text>
                    <Text style={GlobalStyles.text_medium} className="text-sm ">{detailData?.author}, {detailData?.year}</Text>
                </View>
                <View className="flex flex-row items-center w-full ">
                <View className="w-full py-2 mt-2 mb-1 rounded-lg  border-primary border-2 mr-5 " onTouchEndCapture={() => router.push(`/offline/baca/${btoa(detailData?.pdfUrl)}`)}>
                    <Text style={GlobalStyles.text_bold} className="text-base text-center text-primary">Baca </Text>
                </View>
                </View>
            </View>
        </View>
        </View>
        <View className="mt-3">
          <Text className="text-xl" style={GlobalStyles.text_bold}>Synopsis</Text>
          <Text style={GlobalStyles.text_medium} className="mt-3 text-justify text-slate-500">{detailData?.synopsis}</Text>
        </View>
    </View>
  )
}