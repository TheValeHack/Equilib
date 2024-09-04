import { ScrollView, Text, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import BookReadList from "@/components/global/BookReadList";
import { useState, useRef, useEffect, useContext } from "react";
import VoiceCommandService from "../../services/VoiceCommandService";
import { AppContext } from "../../context/AppContext";
import getSettings from "../../util/getSettings";
import CommandBox from "../../components/global/CommandBox";
import {useIsFocused} from "@react-navigation/native";
import { usePathname } from "expo-router";

export default function HomeScreen() {
  const currentPage = usePathname();
  const { externalData, settingsData, dispatch } = useContext(AppContext);
  const { data, updateData } = useData();
  const [commands, setCommands] = useState([]);
  const voiceCommandServiceRef = useRef(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    voiceCommandServiceRef.current = VoiceCommandService({}, setCommands);
    voiceCommandServiceRef.current.initialize();

    const fetchSettings = async () => {
      let settingsValue = await getSettings();
      dispatch({
        type: 'SET_SETTINGS',
        payload: {
          settingsData: settingsValue
        }
      })
    };
  
    fetchSettings();

    console.log(data.map(e => {
      return e
    }))

    return () => {
      voiceCommandServiceRef.current.stopListening();
    };
  }, []);

  useEffect(() => {
    voiceCommandServiceRef.current.updateCurrentPage(currentPage)
  }, [currentPage])

  useEffect(() => {
    if (voiceCommandServiceRef.current) {
      voiceCommandServiceRef.current.updateExternalData(externalData);
    }
  }, [externalData]);

  useEffect(() => {
    if (voiceCommandServiceRef.current) {
      if(settingsData != {}){
        voiceCommandServiceRef.current.updateSettingsData(settingsData);
      }
    }
  }, [settingsData]);

  useEffect(() => {
    if(commands.length > 0){
      dispatch({
        type: 'SET_CURRENT_COMMAND',
        payload: {
          currentCommand: commands[commands.length - 1]
        }
      })
    }
  }, [commands])

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <Text className="mb-3 text-xl" style={GlobalStyles.text_bold}>Selamat datang!</Text>
      <SearchBar placeholder="Cari buku atau penulis" route="" />
      
      <ScrollView className="mt-4">
        {
          // (lastReadBook) ? <BookReadList {...lastReadBook} coverUrl={gambar} /> : <></>
        }
        <Text className="mt-3 mb-3 text-xl" style={GlobalStyles.text_bold}>Buku untukmu</Text>
        <View className="flex flex-row flex-wrap justify-between w-full pb-96">
            {
              data.map((book, index) => {
                return (<BookCard {...book.attributes} id={book.id} coverUrl={process.env.EXPO_PUBLIC_BE_URL + book.attributes.coverUrl.data.attributes.url} key={index}/>);
              })
            }
        </View>
      </ScrollView>
    </View>
  );
}