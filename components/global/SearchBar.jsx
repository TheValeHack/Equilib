import React, { useState } from "react";
import { TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import GlobalStyles from "@/styles/GlobalStyles"; // Pastikan ini mengambil gaya yang diperlukan dari GlobalStyle
import { useRouter } from "expo-router";

const SearchBar = ({ placeholder, route }) => {
    const [text, setText] = useState('');
    const router = useRouter();

    const searchData = () => {
            router.push(`/search/${route}${text}`);
    }

    return (
        <View className="w-100 bg-slate-100 rounded-lg px-2 flex-row items-center h-11">
            <View onTouchEnd={() => searchData()}><Ionicons name={'search'} color={"#C8C8C8"} size={20}/></View>
            <TextInput
                style={[GlobalStyles.text_medium, { flex: 1, marginLeft: 8 }]} // Menyesuaikan gaya untuk TextInput
                className="px-2 text-base" // Menyertakan className untuk kelas-kelas Tailwind
                placeholder={placeholder}
                placeholderTextColor={"#C8C8C8"}
                defaultValue={text}
                onChange={e => setText(e.nativeEvent.text)}
                onSubmitEditing={() => searchData()}
            />
        </View>
    );
}

export default SearchBar;
