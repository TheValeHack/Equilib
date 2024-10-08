import { View, Text } from "react-native";
import GlobalStyles from "@/styles/GlobalStyles";
import {router} from "expo-router";
import { Image } from "expo-image";

const BookReadList = ({ baseUrl, title, coverUrl, pdfUrl, author, year, synopsis, id }) => {
    return (
        <View className="flex flex-row w-100 items-start pl-3 py-3 bg-[#FBF3DA] rounded-xl">
            <Image 
                source={ coverUrl } 
                className="w-[25%] h-32"
                onError={() => console.log("Failed to load image:", coverUrl)}  />
            <View className="w-[70%] pl-3 flex flex-col justify-between h-32">
                <View>
                    <Text style={GlobalStyles.text_bold} className="text-lg text-primary">({id}) {title}</Text>
                    <Text style={GlobalStyles.text_medium} className="text-sm text-primary">{author}, {year}</Text>
                </View>
                <View onTouchEndCapture={()=> router.push(`/baca/${id}`)} className="w-100 bg-primary mt-2 rounded-lg py-2  mb-1">
                    <Text style={GlobalStyles.text_bold} className="w-100 text-white text-base text-center">Lanjutkan Membaca</Text>
                </View>
            </View>
        </View>
    );
}

export default BookReadList;