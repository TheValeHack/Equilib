import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import generateRandomString from './generateRandomString';
import downloadTranscript from './downloadTranscript';

export default async function downloadBook(data) {
  try {
    const storageOfflineBooks = await AsyncStorage.getItem('offlineBook');
    let oldOfflineBooks = storageOfflineBooks ? JSON.parse(storageOfflineBooks) : [];

    if (oldOfflineBooks.some(book => book.id === data.id)) {
      return { success: false, message: 'Buku sudah diunduh' };
    }

    const pdfUrl = process.env.EXPO_PUBLIC_BE_URL + data.attributes.pdfUrl.data.attributes.url;
    const pdfPath = `${FileSystem.documentDirectory}${generateRandomString(24)}.pdf`;
    const { uri } = await FileSystem.downloadAsync(pdfUrl, pdfPath);
    console.log('PDF downloaded to:', uri);

    data.attributes['offlineUrl'] = uri;

    const transncriptUrl = await downloadTranscript(data)

    data.attributes['transcriptLocation'] = transncriptUrl.transcriptLocation

    const updatedOfflineBooks = [...oldOfflineBooks, data];
    await AsyncStorage.setItem('offlineBook', JSON.stringify(updatedOfflineBooks));

    return { success: true, message: 'Buku berhasil diunduh' };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'Buku gagal diunduh' };
  }
};
