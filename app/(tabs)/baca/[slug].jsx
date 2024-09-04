import { ScrollView, Text, View, Image } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import GlobalStyles from "@/styles/GlobalStyles";
import useData from "@/hooks/useData";
import BookCard from "@/components/global/BookCard";
import gambar from '@/assets/images/book_covers/Book-Cover-Crime-and-Punishment.png';
import BookReadList from "@/components/global/BookReadList";
import DownloadBook from "../../../components/global/DownloadBook";
import { useLocalSearchParams } from "expo-router";
import Pdf from "react-native-pdf"
import CommandBox from "../../../components/global/CommandBox";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import downloadTranscript from "../../../util/downloadTranscript";

export default function BacaScreen() {
  const { dispatch, externalData } = useContext(AppContext)
  const { slug } = useLocalSearchParams();
  const [dataBukuBaca, setDataBukuBaca] = useState({});
  const [currentBookData, setCurrentBookData] = useState({});
  const [transcriptLocation, setTranscriptLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const { data, detailData, fetchDetailData } = useData(slug);

  const isFocused = useIsFocused()

    useEffect(() => {
        if(dataBukuBaca?.id != parseInt(slug)){
            setLoading(true)
        }
    }, [isFocused])

    useEffect(() => {
        fetchDetailData()
        console.log(slug)
    }, [slug])

    useEffect(() => {
      console.log(detailData)
      if(detailData && detailData.attributes){
          setDataBukuBaca(detailData)
      }
  }, [detailData])

  useEffect(() => {
    const downloadBookTranscript = async () => {
        const result = await downloadTranscript(dataBukuBaca)
        setTranscriptLocation(result.transcriptLocation)
        console.log(result)
    }
      if(dataBukuBaca.id == parseInt(slug)){
        setCurrentBookData({
            ...dataBukuBaca,
            'setCurrentBookData': setCurrentBookData,
            'currentPage': 1
        })
        downloadBookTranscript()
        setLoading(false)
      }
  }, [dataBukuBaca])

  useEffect(() => {
    setCurrentBookData({
        ...currentBookData,
        'setCurrentBookData': setCurrentBookData,
        'transcriptLocation': transcriptLocation
    })
  }, [transcriptLocation])

  useEffect(() => {
    dispatch({
    type: 'SET_EXTERNAL_DATA',
    payload: {
        externalData: {
            ...externalData,
            'setCurrentBookData': setCurrentBookData,
            'currentBookData': currentBookData
        }
    }
    })
  },[currentBookData])


  if(loading){
    return <></>
  }

  return (
    <View className="flex-1 min-h-screen pt-4 pb-24">
        <CommandBox />
        <DownloadBook data={dataBukuBaca} />
        <View className="mt-4 h-full">
          <Pdf
              // scale={pdfZoom}
              page={externalData['currentBookData']['currentPage'] ? externalData['currentBookData']['currentPage'] : 1 }
              // style={styles.pdf}
              style={{flex: 1, width: "100%"}}
              trustAllCerts={false}
              source={{
                  uri: process.env.EXPO_PUBLIC_BE_URL + dataBukuBaca.attributes.pdfUrl.data.attributes.url,
                  cache: true
              }}
              onLoadComplete={(numberOfPages, filePath) => {
                  //totalPage(numberOfPages)
              }}
              onError={(err)=>{
                  console.log(`err pdf : ${err}`)
              }}
              onPageChanged={(page) => {
                  setCurrentBookData({
                    ...currentBookData,
                    currentPage: page
                  })
              }}
          />
        </View>
    </View>
  );
}