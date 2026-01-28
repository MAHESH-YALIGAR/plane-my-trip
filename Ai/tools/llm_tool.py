from openai import OpenAI
import os

client=OpenAI(
  api_key=os.getenv("GEMINI_API_KEY"),
  base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
 
)


def call_llm(system_prompt, messages):
    response = client.chat.completions.create(
        model="gemini-3-flash-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            *messages
        ]
    )
    return response.choices[0].message.content.strip()