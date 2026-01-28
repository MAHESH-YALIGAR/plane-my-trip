


from PIL import Image

class Agent:
    def __init__(self, name: str, system_prompt: str):
        self.name = name
        self.system_prompt = system_prompt

    def _build_messages(self, user_input, history=None):
        if history is None:
            history = []

        return [
            {"role": "system", "content": self.system_prompt},
            *history,
            {"role": "user", "content": user_input},
        ]

    def run(self, client, user_input, history=None):
        messages = self._build_messages(user_input, history)

        response = client.chat.completions.create(
            model="gemini-3-flash-preview",
            messages=messages,
        )

        return response.choices[0].message.content.strip()

    def run_with_image(self, client, user_input, image_path, history=None):
        if history is None:
            history = []

        image = Image.open(image_path)

        messages = [
            {"role": "system", "content": self.system_prompt},
            *history,
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_input},
                    {"type": "image", "image": image},
                ],
            },
        ]

        response = client.chat.completions.create(
            model="gemini-3-flash-preview",
            messages=messages,
        )

        return response.choices[0].message.content.strip()
