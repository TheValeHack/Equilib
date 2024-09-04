import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import generateRandomString from './generateRandomString';

export default async function downloadTranscript(data) {
  try {
    const storageTranscriptedBooks = await AsyncStorage.getItem('transcriptedBook');
    let oldTranscriptedBooks = storageTranscriptedBooks ? JSON.parse(storageTranscriptedBooks) : [];

    if (oldTranscriptedBooks.some(book => book.id === data.id)) {
      const currentBook = oldTranscriptedBooks.find(book => book.id == data.id)
      return { success: false, message: 'Transcript buku sudah disimpan', transcriptLocation: currentBook.attributes.savedTranscript };
    }

    const transcriptUrl = process.env.EXPO_PUBLIC_BE_URL + data.attributes.transcriptUrl.data.attributes.url;
    const transcriptPath = `${FileSystem.documentDirectory}${generateRandomString(24)}.json`;
    const { uri } = await FileSystem.downloadAsync(transcriptUrl, transcriptPath);
    console.log('Transcript saved to:', uri);

    data.attributes['savedTranscript'] = uri;

    const updatedTranscriptedBooks = [...oldTranscriptedBooks, data];
    await AsyncStorage.setItem('transcriptedBook', JSON.stringify(updatedTranscriptedBooks));

    return { success: true, message: 'Transcript buku berhasil disimpan', transcriptLocation: uri };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'Transcript buku gagal disimpan', transcriptLocation: '' };
  }
};
