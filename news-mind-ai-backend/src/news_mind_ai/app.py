from fastapi import FastAPI, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any, Dict, List
import uvicorn
from news_mind_ai.agents import run_agent_pipeline
from news_mind_ai.models import ArticleOutput
from news_mind_ai.gpt_response import gpt_response

app = FastAPI(
    title="News Mind AI",
    description="API for processing queries and generating news articles using an agent pipeline.",
    version="0.1.0",
)
# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


class QueryModel(BaseModel):
    query: str


class SuccessResponse(BaseModel):
    status_code: int = status.HTTP_201_CREATED
    message: str
    data: Dict[str, Any]


class FollowUpQuestionsResponse(BaseModel):
    status_code: int = status.HTTP_201_CREATED
    message: str
    data: Dict[str, Any]


class FollowUpQuestionsModel(BaseModel):
    query: str
    context: str


class ErrorResponse(BaseModel):
    status_code: int
    message: str
    detail: Any = None


@app.post(
    "/generate-article",
    response_model=SuccessResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": ErrorResponse,
            "description": "Bad request e.g. if the query is empty",
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": ErrorResponse,
            "description": "Internal server error",
        },
    },
)
async def generate_article(request: QueryModel):
    if not request.query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )
    try:
        pipeline_result = await run_agent_pipeline(request.query)
        return SuccessResponse(
            message="Query processed successfully and article generated.",
            data=pipeline_result.model_dump(),
        )
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )


@app.post(
    "/follow-up-questions",
    status_code=status.HTTP_201_CREATED,
    response_model=FollowUpQuestionsResponse,
)
async def follow_up_questions(request: FollowUpQuestionsModel):
    if not request.query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )
    if not request.context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Context cannot be empty",
        )
    # Get streaming response from GPT
    generator = await gpt_response(request.query, request.context)
    return StreamingResponse(generator, media_type="text/event-stream")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
