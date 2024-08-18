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

export default function HomeScreen() {
  const { externalData, settingsData, dispatch } = useContext(AppContext);
  const { data, updateData } = useData();
  const [commands, setCommands] = useState([]);
  const voiceCommandServiceRef = useRef(null);

  useEffect(() => {
    voiceCommandServiceRef.current = VoiceCommandService({}, setCommands);
    voiceCommandServiceRef.current.startListening();

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

    return () => {
      voiceCommandServiceRef.current.stopListening();
    };
  }, []);

  useEffect(() => {
    setCurrentPage()
  }, [useIsFocused()])

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

  const setCurrentPage = () => {
    dispatch({
      type: 'SET_EXTERNAL_DATA',
      payload: {
        externalData: {
          'currentPage': null
        }
      }
    })
  }

  return (
    <View className="flex-1 min-h-screen">
      <CommandBox />
      <Text className="mb-3 text-xl" style={GlobalStyles.text_bold}>Selamat datang!</Text>
      <SearchBar placeholder="Cari buku atau penulis" route="" />
      
      <ScrollView className="mt-4">
        <BookReadList {...data[0]} coverUrl={gambar} />
        <Text className="mt-3 mb-3 text-xl" style={GlobalStyles.text_bold}>Buku untukmu</Text>
        <View className="flex flex-row flex-wrap justify-between w-full pb-96">
            {
              data.map((book, index) => {
                return (<BookCard {...book} coverUrl={gambar} key={index}/>);
              })
            }
        </View>
      </ScrollView>
    </View>
  );
}