import AudioWave from "./AudioWave"
import { Text, View } from "react-native"
import GlobalStyles from "@/styles/GlobalStyles";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import commandsData from "../../data/commands.json"

const CommandBox = () => {
    const {currentCommand, settingsData} = useContext(AppContext)
    const [show, setShow] = useState(false)
    const displayCommand = (command) => {
        let commandText = command
        if(command == '' || commandsData.keyword.includes(command.replace("-", " "))){
            commandText = 'Ucapkan perintah anda!'
        }
        return commandText
    }

    useEffect(() => {
        if(settingsData["kotak_perintah"]){
            if(settingsData["kotak_perintah"]["status"] != show){
                setShow(settingsData["kotak_perintah"]["status"])
            }
        }
    }, [settingsData])

    if(!show){
        return <></>
    }

    return (
        <View className="absolute bg-slate-100 h-[180] left-0 right-0 bottom-[70] z-50 rounded-t-2xl px-5 py-8">
          <AudioWave />
          <Text className="mt-7 text-lg text-center" style={GlobalStyles.text_bold}>{displayCommand(currentCommand)}</Text>
      </View>
    )
}

export default CommandBox