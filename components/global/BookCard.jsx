import { View, Text } from "react-native";
import GlobalStyles from "@/styles/GlobalStyles";
import { router } from "expo-router";
import { Image } from "expo-image";

const BookCard = ({ baseUrl, title, coverUrl, pdfUrl, author, year, synopsis, isOffline, id }) => {
    
    return (
        <View onTouchEndCapture={()=> isOffline ? router.push(`offline/detail/${id}`) : router.push(`detail/${id}`)}  className="flex flex-col w-[48%] items-center mb-3">
            <Image 
                source={coverUrl} 
                className="w-36 h-56" 
                contentFit="cover"
                onError={() => console.log("Failed to load image:", coverUrl)} 
            />
            <Text style={GlobalStyles.text_medium} className="text-sm text-center text-slate-300 mt-2">{author}, {year}</Text>
            <Text style={GlobalStyles.text_bold} className="text-base text-center">{title}</Text>
        </View>
    );
}

export default BookCard;