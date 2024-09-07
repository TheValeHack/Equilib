import * as Speech from 'expo-speech';

class TextToSpeechService {
  static isStoppedForcibly = false;

  static speak(text, options = {}) {
    const { onDone } = options;
    this.isStoppedForcibly = false;

    Speech.speak(text, {
      // language: 'id-ID',
      voice: 'id-id-x-dfz-network',
      onDone: () => {
        if (onDone) onDone();
      },
    });
  }

  static stop() {
    this.isStoppedForcibly = true;
    Speech.stop();
  }

  static async getAvailableVoices() {
    return await Speech.getAvailableVoicesAsync();
  }
}

export default TextToSpeechService;
