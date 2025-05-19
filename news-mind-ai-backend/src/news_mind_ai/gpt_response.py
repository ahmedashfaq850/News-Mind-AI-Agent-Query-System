from openai import OpenAI
from news_mind_ai.config import my_config


async def gpt_response(query: str, context: str) -> str:
    client = OpenAI()
    content = ""
    response = client.responses.create(
        model=my_config.model_name,
        input=[
            {
                "role": "system",
                "content": f"You are a helpful follow up question assistant that can answer questions and help with follow up questions. Use this context to answer the question: {context} and use your intelligence to answer the question: {query}",
            },
            {
                "role": "user",
                "content": f"Answer the question: {query}",
            },
        ],
        stream=True,
    )
    for event in response:
        if event.type == "response.text_delta":
            content += event.delta
        elif event.type == "response.output_text.delta":
            content += event.delta
    return content


# if __name__ == "__main__":
#     gpt_response(
#         "What is the name of Ahmed's Brother",
#         "Ahmed Father name is Ashfaq, Mother name is Sobia and bro name is Anas",
#     )
