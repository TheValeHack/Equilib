import React, { useEffect, useState , useContext} from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext'
import GlobalStyles from "@/styles/GlobalStyles";
import steps from "./../../data/steps.json"

const PanduanAlert = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const { dispatch, changePanduanNumber, externalData } = useContext(AppContext)

  const handleClose = () => {
    setCurrentStep(0)
    onClose() 
  }
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  useEffect(() => {
    if(changePanduanNumber.length > 0){
      if(changePanduanNumber.startsWith('next')){
        if(currentStep < steps.length - 1){
          handleNext()
        } else {
          handleClose()
        }
      } else if(changePanduanNumber.startsWith('previous')){
        if(currentStep > 0){
          handlePrevious()
        } else {
          handleClose()
        }
      }  else {
        handleClose()
      }
    }
  }, [changePanduanNumber])

  useEffect(() => {
    dispatch({
        type: 'SET_EXTERNAL_DATA',
        payload: {
            externalData: {
                ...externalData,
                'currentPanduan': currentStep
            }
        }
      })
  }, [currentStep])

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{backgroundColor: 'rgba(0,0,0,0.5)'}} className='flex-1 justify-center items-center'>
        <View className='w-[80%] bg-white px-5 py-8 rounded-2xl items-center'>
        <FontAwesome5
              className='opacity-0'
              style={{}}
              color={'#EFAC00'}
              size={80}
              name={steps[currentStep]["icon"]}
            />
          <Text style={GlobalStyles.text_bold} className='text-lg text-justify mb-5 mt-7'>{steps[currentStep]["step"]}</Text>
          <View className='flex-row justify-between w-[100%]'>
            {currentStep > 0 && (
              <TouchableOpacity className='px-5 py-3 text-lg text-center items-center text-white rounded-xl w-fit bg-primary' onPress={handlePrevious}>
                <Text style={GlobalStyles.text_bold} className='text-white text-sm'>Sebelumnya</Text>
              </TouchableOpacity>
            )}
            {currentStep == 0 && (
              <TouchableOpacity className='px-5 py-3 text-lg text-center items-center text-white rounded-xl w-fit bg-white border-2 border-primary' onPress={handleClose}>
                <Text style={GlobalStyles.text_bold} className='text-primary text-sm'>Lewati</Text>
              </TouchableOpacity>
            )}
            {currentStep < steps.length - 1 ? (
              <TouchableOpacity className='px-5 py-3 text-lg  text-center items-center text-white rounded-xl w-fit bg-primary' onPress={handleNext}>
                <Text style={GlobalStyles.text_bold} className='text-white text-sm'>Selanjutnya</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className='px-5 py-3 text-lg text-center items-center text-white rounded-xl w-fit bg-primary' onPress={handleClose}>
                <Text style={GlobalStyles.text_bold} className='text-white text-sm'>Tutup</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}


export default PanduanAlert