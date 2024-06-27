import { View, Image, Text } from "react-native";
import GlobalStyles from "@/styles/GlobalStyles";

const DownloadBook = ({ title, author, year }) => {
    return (
        <View className="bg-[#FBF3DA] px-3 py-3 rounded-xl">
                <View>
                    <Text style={GlobalStyles.text_bold} className="text-lg text-primary">{title}</Text>
                    <Text style={GlobalStyles.text_medium} className="text-sm text-primary">{author}, {year}</Text>
                </View>
                <View className="w-100 bg-primary mt-2 rounded-lg py-2  mb-1">
                    <Text style={GlobalStyles.text_bold} className="w-100 text-white text-base text-center">Unduh Buku</Text>
                </View>
            </View>
    )
}

export default DownloadBook;