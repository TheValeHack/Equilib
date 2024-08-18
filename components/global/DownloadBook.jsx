import { View, Text, Alert, TouchableOpacity } from "react-native";
import GlobalStyles from "@/styles/GlobalStyles";
import downloadBook from "../../util/downloadBook";
import { useState } from "react";

const DownloadBook = ({ data, isOffline }) => {
    const [loading, setLoading] = useState(false);

    const unduhBuku = async () => {
        if (data) {
            setLoading(true);
            const unduhan = await downloadBook(data);
            setLoading(false);

            Alert.alert(
                unduhan.success ? 'Berhasil' : 'Gagal',
                unduhan.message,
                [{ text: 'OK', style: 'default' }]
            );
        }
    };

    return (
        <View className="bg-[#FBF3DA] px-3 py-3 rounded-xl">
            <View>
                <Text style={GlobalStyles.text_bold} className="text-lg text-primary">{data ? data["title"] : ''}</Text>
                <Text style={GlobalStyles.text_medium} className="text-sm text-primary">{data ? data["author"] : ''}, {data ? data["year"] : ''}</Text>
            </View>
            {
                !isOffline && <TouchableOpacity className="w-100 bg-primary mt-2 rounded-lg py-2 mb-1" onPress={unduhBuku}>
                <Text style={GlobalStyles.text_bold} className="w-100 text-white text-base text-center">
                    {loading ? 'Mengunduh...' : 'Unduh buku'}
                </Text>
            </TouchableOpacity>
            }
        </View>
    );
};

export default DownloadBook;
