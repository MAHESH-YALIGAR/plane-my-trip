


"""
⚡ FAST Guide Agent - With Image + Voice Support
"""

import os
import time
import base64
from dotenv import load_dotenv
from openai import OpenAI

from agents.guaide import guide_agent
from agents.voice_features import VoiceManager

# Load env
load_dotenv()

# Gemini OpenAI-compatible client
client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

voice = VoiceManager()


def encode_image(image_path: str) -> str:
    """Convert image to base64"""
    with open(image_path, "rb") as img:
        return base64.b64encode(img.read()).decode("utf-8")


def get_user_input(use_voice=False):
    if use_voice:
        return voice.listen()
    return input("👉 You: ").strip()


def get_image_input(use_voice=False):
    if use_voice:
        print("🎤 Say the image filename (e.g., taj_mahal.jpg)")
        filename = voice.listen()
        if filename and os.path.exists(filename):
            return filename
        print("❌ Image not found")
        return None
    else:
        path = input("📸 Image path (or press Enter to skip): ").strip()
        if path and os.path.exists(path):
            return path
        return None


def main():
    print("🧭 Guide Agent - ⚡ FAST MODE\n")

    use_voice = input("Use voice input/output? (y/n): ").lower() == "y"
    ask_for_image = input("Start with image upload? (y/n): ").lower() == "y"

    print("\n💡 Type 'exit' or 'quit' to end.\n")

    image_base64 = None

    if ask_for_image:
        image_path = get_image_input(use_voice)
        if image_path:
            image_base64 = encode_image(image_path)

    while True:
        try:
            user_input = get_user_input(use_voice)

            if not user_input:
                print("⚠️ Please try again.\n")
                continue

            if user_input.lower() in ("exit", "quit"):
                print("👋 Session ended!")
                break

            print("⌛ Processing...", end="", flush=True)
            start = time.time()

            # IMAGE + TEXT
            if image_base64:
                response = guide_agent.run_with_image(
                    client=client,
                    user_text=user_input,
                    image_base64=image_base64
                )
            else:
                response = guide_agent.run(
                    client=client,
                    user_input=user_input
                )

            elapsed = time.time() - start
            print(f"\r🧭 Guide: {response}")
            print(f"⏱️ ({elapsed:.1f}s)\n")

            if use_voice:
             voice.speak(response)
            time.sleep(0.3)

        except KeyboardInterrupt:
            print("\n👋 Interrupted by user")
            break
        except Exception as e:
            print(f"❌ Error: {e}\n")


if __name__ == "__main__":
    main()
