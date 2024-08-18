import * as Speech from 'expo-speech';

class TextToSpeechService {
  static speak(text, options = {}) {
    const { onDone } = options;

    Speech.speak(text, {
      // language: 'id-ID',
      voice: 'id-id-x-dfz-network',
      onDone: () => {
        if (onDone) onDone();
      },
    });
  }

  static async getAvailableVoices() {
    return await Speech.getAvailableVoicesAsync();
  }
}

export default TextToSpeechService;
