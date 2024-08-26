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
import CommandBox from "../../../../components/global/CommandBox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AppContext} from "../../../../context/AppContext";

export default function PageScreen () {
    const {slug} = useLocalSearchParams()
    const { dispatch, externalData } = useContext(AppContext);
    const { data, detailData, fetchDetailData } = useData(slug);
    const [isSave, setIsSave] = useState(false)

    useEffect(() => {
        fetchDetailData()
        isBookSaved()
    }, [slug])

    useEffect(() => {
        saveBook()
    }, [isSave])

    const isBookSaved = async () => {
        const JSONSavedBook = await AsyncStorage.getItem('savedBook')
        const savedBook = JSONSavedBook ? JSON.parse(JSONSavedBook) : []

        const isSaved = savedBook.some((item) => btoa(item.pdfUrl) === slug)

        setIsSave(isSaved)

        dispatch({
            type: 'SET_EXTERNAL_DATA',
            payload: {
                externalData: {
                    ...externalData,
                    'isSave': isSaved,
                    'setIsSave': setIsSave,
                }
            }
        })
    }

    const saveBook = async () => {

        const JSONSavedBook = await AsyncStorage.getItem('savedBook')
        const savedBook = JSONSavedBook ? JSON.parse(JSONSavedBook) : []

        if (!isSave) {
            const newSavedBook = savedBook.filter((item) => item.pdfUrl !== detailData.pdfUrl)
            await AsyncStorage.setItem('savedBook', JSON.stringify(newSavedBook))
        } else {
            await AsyncStorage.setItem('savedBook', JSON.stringify([...savedBook, detailData]))
        }

    }

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
                <View className="w-[70%] py-2 mt-2 mb-1 rounded-lg  border-primary border-2 mr-5 " onTouchEndCapture={() => router.push(`/baca/${btoa(detailData?.pdfUrl)}`)}>
                    <Text style={GlobalStyles.text_bold} className="text-base text-center text-primary">Baca </Text>
                </View>
                    {isSave ?
                <Ionicons size={36}  onPress={()=> setIsSave((prev)=> !prev)} className="pt-10 text-primary fill-primary" style={{color: 'rgb(239 172 0)'}} name={'bookmark'} />
                        :
                <Ionicons size={36} onPress={()=> setIsSave((prev)=> !prev)} className="pt-10 text-primary fill-primary" style={{color: 'rgb(239 172 0)'}} name={'bookmark-outline'} />
                    }
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