from openai import OpenAI
import os

client=OpenAI(
  api_key=os.getenv("GEMINI_API_KEY"),
  base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
 
)

def call_llm(system_promt,messege){
  
}