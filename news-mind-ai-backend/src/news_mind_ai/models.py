from pydantic import BaseModel
from typing import List


class SourceOutput(BaseModel):
    news_links: List[str]


class ScrapedContentOutput(BaseModel):
    content: str
    sources: List[str]


class SummaryOutput(BaseModel):
    summary: str
    sources: List[str]


class TitleKeywordsOutput(BaseModel):
    title: str
    content: str
    summary: str
    keywords: List[str]
    sources: List[str]


class ArticleOutput(BaseModel):
    title: str
    summary: str
    keywords: List[str]
    article: str
    sources: List[str]
