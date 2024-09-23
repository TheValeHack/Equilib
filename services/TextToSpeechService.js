import * as Speech from 'expo-speech';

class TextToSpeechService {
  static isStoppedForcibly = false;
  static voices = ['id-id-x-idc-network', 'id-id-x-ide-local']
  static voiceIndex = 0
  static rate = 1.0

  static speak(text, options = {}) {
    const { onDone } = options;
    this.isStoppedForcibly = false;

    Speech.speak(text, {
      // language: 'id-ID',
      voice: this.voices[this.voiceIndex],
      rate: this.rate,
      onDone: () => {
        if (onDone) onDone();
      },
    });
  }

  static stop() {
    this.isStoppedForcibly = true;
    Speech.stop();
  }

  static setRate(newRate) {
    this.rate = newRate;
  }

  static changeVoice(index){
    this.voiceIndex = index
  }

  static async getAvailableVoices() {
    let availableVoices = await Speech.getAvailableVoicesAsync();
    return availableVoices
  }
}

export default TextToSpeechService;
