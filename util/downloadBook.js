import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import generateRandomString from './generateRandomString';

export default async function downloadBook(data) {
  try {
    const storageOfflineBooks = await AsyncStorage.getItem('offlineBook');
    let oldOfflineBooks = storageOfflineBooks ? JSON.parse(storageOfflineBooks) : [];

    if (oldOfflineBooks.some(book => book.pdfUrl === data.pdfUrl)) {
      return { success: false, message: 'Buku sudah diunduh' };
    }

    const pdfUrl = 'https://ftp.unpad.ac.id/bse/Kurikulum_2006/11_SMA/kelas_11_sma_biologi_suwarno.pdf';
    const pdfPath = `${FileSystem.documentDirectory}${generateRandomString(24)}.pdf`;
    const { uri } = await FileSystem.downloadAsync(pdfUrl, pdfPath);
    console.log('PDF downloaded to:', uri);

    data['offlineUrl'] = uri;

    const updatedOfflineBooks = [...oldOfflineBooks, data];
    await AsyncStorage.setItem('offlineBook', JSON.stringify(updatedOfflineBooks));

    return { success: true, message: 'Buku berhasil diunduh' };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'Buku gagal diunduh' };
  }
};
