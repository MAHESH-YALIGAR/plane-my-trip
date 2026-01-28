


import speech_recognition as sr
import pyttsx3

class VoiceManager:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.tts = pyttsx3.init()
        self.tts.setProperty("rate", 145)

    def listen(self, timeout=4):
        try:
            with sr.Microphone() as source:
                print("🎤 Listening...")
                self.recognizer.adjust_for_ambient_noise(source, 1)
                audio = self.recognizer.listen(source, timeout=timeout)
                text = self.recognizer.recognize_google(audio)
                print("👉 You:", text)
                return text
        except Exception:
            return None

    def speak(self, text):
        if not text:
            return

        # 🔥 FIX: chunk long responses
        sentences = text.split(". ")
        for sentence in sentences:
            self.tts.say(sentence)
            self.tts.runAndWait()
