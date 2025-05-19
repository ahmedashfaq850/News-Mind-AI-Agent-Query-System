import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    openai_api_key: str
    serper_api_key: str
    port: int
    host: str
    environment: str
    model_name: str

    @classmethod
    def load(cls):
        # Get API keys from environment
        openai_key = os.getenv("OPENAI_API_KEY")
        serper_key = os.getenv("SERPER_API_KEY")

        # Make sure we have the required keys
        if not openai_key:
            raise ValueError("OPENAI_API_KEY is required")
        if not serper_key:
            raise ValueError("SERPER_API_KEY is required")

        return cls(
            openai_api_key=openai_key,
            serper_api_key=serper_key,
            port=int(os.getenv("PORT", "8000")),
            host=os.getenv("HOST", "localhost"),
            environment=os.getenv("ENVIRONMENT", "development"),
            model_name=os.getenv("MODEL_NAME", "gpt-4"),
        )


# Create our config
my_config = Config.load()
