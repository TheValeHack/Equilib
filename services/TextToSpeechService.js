import * as Speech from 'expo-speech';

class TextToSpeechService {
  static speak(text, options = {}) {
    const { onDone } = options;

    Speech.speak(text, {
      language: 'id-ID',
      onDone: () => {
        if (onDone) onDone();
      },
    });
  }
}

export default TextToSpeechService;
