# 🧠 NewsMind AI

**NewsMind AI** is a multi-agent news analysis system powered by language models and vector databases. Users can ask questions about topics that interest them, and AI agents collaborate to search, summarize, and analyze recent news from trusted sources. Unlike traditional keyword-based search engines, NewsMind AI enables natural, conversational exploration of news with contextual memory for follow-ups.

## Architecture Diagram
<img width="707" alt="Image" src="https://github.com/user-attachments/assets/cf95c386-f68c-4b6b-941a-bd94ff240601" />

## Frontend Architecture Diagram
<img width="905" alt="Image" src="https://github.com/user-attachments/assets/f1604705-34a3-4d49-8425-68a6fe4c6821" />

---

## 🚀 Key Features

| Feature | Description |
|--------|-------------|
| 🤖 **Multi-AI Agent Orchestration** | Specialized agents handle distinct roles — searching news APIs, summarizing content, filtering bias, ranking credibility, and storing results. |
| 🔍 **Real-Time News Retrieval** | Fetches the latest articles and insights using trusted news APIs or web search based on the user's query. |
| 🧠 **Vector-Based Context Memory** | Embeds and stores news results in a vector database (e.g., Pinecone, Weaviate, or ChromaDB), enabling context-aware follow-ups. |
| 💬 **LLM-Powered Follow-Up Chat** | Supports natural follow-up questions with full memory of previous results for coherent, contextual discussions. |
| 🧱 **Agent Collaboration Workflow** | Agents interact using task delegation or message passing (e.g., LangGraph or CrewAI), promoting modular and scalable design. |
| 🧰 **News Summarization & Sentiment Analysis** | Summarizes key points and optionally provides sentiment scores or bias indicators. |
| 🛠️ **Query History & Session Tracking** | Allows users to view past queries and revisit or restart conversations. |

---

## 🛠️ Tech Stack Highlights

| Component | Technologies |
|----------|--------------|
| 🤖 **AI Orchestration** | OpenAI Agent SDK |
| 🧠 **LLM Backend** | OpenAI GPT-4 |
| 💾 **Vector Store** | Qdrant DB |
| 🎨 **Frontend** | Next.js + Tailwind CSS + shadcn/ui |
| ⚙️ **Backend** | FastAPI / Next.js API Routes |
| 🔒 **Authentication** | Null |
| 📊 **Database** | Not implemented yet |
| 📰 **News Sources** | Serper Search API |

---

## 📦 Use Cases

| Use Case | Description |
|----------|-------------|
| 🎯 **Personalized News Intelligence** | AI assistant that learns user interests and provides tailored news insights and analysis. |
| 📊 **Financial & Geopolitical Analysis** | Tracks market trends and political developments with contextual understanding. |
| 📈 **Real-Time Monitoring** | Dynamic dashboard for tracking breaking news across multiple regions or topics. |
| ✍️ **Research Assistant** | Assists journalists and analysts in gathering, comparing, and interpreting news data. |
| 📚 **Educational Platform** | Enables students and educators to explore current affairs through guided AI discussions. |

---

Feel free to contribute, fork the repo, or reach out with ideas!
