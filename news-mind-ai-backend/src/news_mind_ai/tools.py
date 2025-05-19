from agents import function_tool
from typing import Dict, List, Any, List, Optional
from news_mind_ai.config import my_config
from langchain_text_splitters import RecursiveCharacterTextSplitter
import requests
import json
import asyncio
from crawl4ai import *


@function_tool
def search_web(query: str) -> List[str]:
    news_links = []
    url = "https://google.serper.dev/news"
    payload = json.dumps({"q": query})
    headers = {
        "X-API-KEY": my_config.serper_api_key,
        "Content-Type": "application/json",
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    data = response.json()
    # want to destructure the news array
    news = data.get("news", [])
    for single_news in news:
        if single_news.get("link"):
            news_links.append(single_news.get("link"))

    return news_links[:1]


@function_tool
async def scrape_web(links: List[str]) -> str:
    content = ""
    for link in links:
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(link)
            content += result.markdown

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000, chunk_overlap=200  # Adjust based on your limits
    )
    return splitter.split_text(content)
