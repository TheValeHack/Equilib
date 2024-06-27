import { View, Image, Text } from "react-native";
import GlobalStyles from "@/styles/GlobalStyles";

const BookCard = ({ baseUrl, title, coverUrl, pdfUrl, author, year, synopsis }) => {
    return (
        <View className="flex flex-col w-[48%] items-center mb-3">
            <Image source={ coverUrl } className="w-36 h-56" />
            <Text style={GlobalStyles.text_medium} className="text-sm text-center text-slate-300">{author}, {year}</Text>
            <Text style={GlobalStyles.text_bold} className="text-base text-center">{title}</Text>
        </View>
    );
}

export default BookCard;