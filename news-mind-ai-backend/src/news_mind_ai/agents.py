from agents import Agent, Runner, trace, handoff
import asyncio
from news_mind_ai.config import my_config
from typing import Dict, Any

from news_mind_ai.tools import search_web, scrape_web
from news_mind_ai.models import (
    ArticleOutput,
    SourceOutput,
    ScrapedContentOutput,
    SummaryOutput,
    TitleKeywordsOutput,
)

# Agent 5: News Article Formatter
news_article_formatter_agent = Agent(
    name="News Article Formatter",
    instructions="""YOu are a creative Article Formatter. Use the best practices to write the article formatted in plain text.
    The article should be in the following format:
    - Title
    - Summary
    - Keywords
    - Article
    - Sources
    """,
    model=my_config.model_name,
    output_type=ArticleOutput,
)

# Agent 4: Article Title and Keywords Generator
article_title_and_keywords_generator_agent = Agent(
    name="Article Title and Keywords Generator",
    # handoff_description="Generates title/keywords and hands off to the News Article Formatter agent with the title, content, and keywords",
    instructions="""You are a creative article title and keywords generator. You will receive a summarized article. Your primary task is to:
    1. Create an engaging and interesting title for the article.
    2. Generate relevant keywords for the article.
    3. Pass through the original summarized article you received as the 'content' field in your output.
    Output these strictly in the TitleKeywordsOutput format (which includes title, content, and keywords). The 'News Article Formatter' agent is configured to receive your output next. Focus on providing accurate and complete data in this structure.""",
    model=my_config.model_name,
    handoffs=[handoff(news_article_formatter_agent)],
    output_type=TitleKeywordsOutput,
)
# Agent 3: Article Summarizer
article_summarizer_agent = Agent(
    name="Article Summarizer",
    # handoff_description="Summarizes the article and hands off to the Article Title and Keywords Generator agent with the summary",
    instructions="""You are a creative story summarizer. You will receive scraped article content. Your primary task is to create an engaging, very detailed summary that captures the essence of the article and answers the user query, using the user query and the article content for context. Output this summary strictly in the SummaryOutput format. The 'Article Title and Keywords Generator' agent is configured to receive your output next. Focus on providing accurate and complete data in the specified output format.""",
    model=my_config.model_name,
    handoffs=[handoff(article_title_and_keywords_generator_agent)],
    output_type=SummaryOutput,
)

# Agent 2: Source Scrapper - Hands off to ArticleSummarizer
source_scrapper_agent = Agent(
    name="Source Scrapper",
    handoff_description="Scrapes sources and hands off to the Article Summarizer agent with the content",
    instructions="""You are a creative Web Crawl source scrapper. You will receive a list of sources.
    Your primary task is to:
    1. For each URL, use the scrape_web tool to get its content.
    2. Combine all scraped content into a single string and passed it to the Article Summarizer agent.""",
    model=my_config.model_name,
    handoffs=[handoff(article_summarizer_agent)],
    output_type=ScrapedContentOutput,
    tools=[scrape_web],
)


# Agent 1: Research Analyst - Hands off to Source Scrapper
research_analyst_agent = Agent(
    name="Research Analyst",
    handoff_description="Finds relevant sources and hands off to the Source Scrapper agent with the sources list",
    instructions="""You are a Research Analyst. Your primary task is to:
    1. Take the user's query and use the search_web tool to find relevant and credible online source URLs.
    2. After the search_web tool provides a list of URLs and passed it to the source scrapper agent.""",
    model=my_config.model_name,
    handoffs=[handoff(source_scrapper_agent)],
    output_type=SourceOutput,
    tools=[search_web],
)

# Main Orchestrator Agent - Manages the pipeline
main_orchestrator_agent = Agent(
    name="News Mind AI Main Orchestrator",
    instructions="""You are the main orchestrator for a news mind ai pipeline.
    Your task is to take the user's query and initiate the process by handing it off to the Research Analyst agent then research agent will handoff the query to source scrapper agent and then source scrapper agent will handoff the query to article summarizer agent and then article summarizer agent will handoff the query to article title and keywords generator agent and then article title and keywords generator agent will handoff the query to article formatter agent.
    The sequence will be: Research Analyst -> Source Scrapper -> Analyst Report -> Generate Title and Keywords -> Format News Article .""",
    model=my_config.model_name,
    handoffs=[handoff(research_analyst_agent)],
)


async def run_agent_pipeline(query: str) -> Dict[str, Any]:
    # Create a trace to capture the process
    with trace("News Mind AI Pipeline") as pipeline_trace:
        print(f"Starting news mind ai pipeline with query: {query}")

        # Run the main orchestrator agent, which will initiate the handoff chain
        result = await Runner.run(
            main_orchestrator_agent, query, max_turns=80
        )  # max_turns might need adjustment

        return result.final_output


if __name__ == "__main__":
    result = asyncio.run(run_agent_pipeline("trump and Saudi Arabia latest news"))
    print("\nFinal Output:")
    print(result)
