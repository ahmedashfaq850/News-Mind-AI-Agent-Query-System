"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Tag, Brain, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { AvatarFallback } from "@/components/ui/avatar"

interface ArticleData {
  status_code: number
  message: string
  data: {
    title: string
    summary: string
    keywords: string[]
    article: string
    sources: string[]
  }
}

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  isTyping?: boolean
}

export default function FollowUpPage() {
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [useMockApi, setUseMockApi] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === "development"

  useEffect(() => {
    // Load mock API preference from localStorage
    if (isDev) {
      const storedMockPref = localStorage.getItem("useMockApi")
      setUseMockApi(storedMockPref === "true")
    }

    // Get the article data from localStorage
    const storedData = localStorage.getItem("articleData")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setArticleData(parsedData)

        // Add initial bot message
        setMessages([
          {
            id: "welcome",
            content: `I've analyzed the article "${parsedData.data.title}". What would you like to know about it?`,
            sender: "bot",
            timestamp: new Date(),
          },
        ])
      } catch (error) {
        console.error("Error parsing article data:", error)
        router.push("/")
      }
    } else {
      // If no data, redirect back to home
      router.push("/")
    }

    // Cleanup function to abort any ongoing requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [router, isDev])

  // Function to check if we should show the scroll button
  const checkScrollPosition = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setShowScrollButton(!isNearBottom)
    setIsAutoScrollEnabled(isNearBottom)
  }, [])

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.addEventListener("scroll", checkScrollPosition)
    return () => {
      container.removeEventListener("scroll", checkScrollPosition)
    }
  }, [checkScrollPosition])

  // Improved scroll to bottom function
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      if (!isAutoScrollEnabled && behavior === "auto") return

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior,
          block: "end",
        })
        setShowScrollButton(false)
      }, 100) // Small delay to ensure content is rendered
    },
    [isAutoScrollEnabled],
  )

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom("smooth")
  }, [messages, scrollToBottom])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim() || isLoading || !articleData) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])

    // Enable auto-scroll when user sends a message
    setIsAutoScrollEnabled(true)

    // Clear input and set loading state
    setInputMessage("")
    setIsLoading(true)

    // Create a temporary typing indicator message
    const typingIndicatorId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: typingIndicatorId,
        content: "",
        sender: "bot",
        timestamp: new Date(),
        isTyping: true,
      },
    ])

    try {
      if (useMockApi) {
        // Simulate streaming response with mock data
        await simulateStreamingResponse(typingIndicatorId, inputMessage)
      } else {
        // Create an AbortController to be able to cancel the request if needed
        abortControllerRef.current = new AbortController()
        const signal = abortControllerRef.current.signal

        // Make the API call with streaming response
        await handleStreamingApiCall(typingIndicatorId, inputMessage, signal)
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => msg.id !== typingIndicatorId))

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: "Sorry, I encountered an error processing your question. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // Function to handle streaming API call
  const handleStreamingApiCall = async (messageId: string, query: string, signal: AbortSignal) => {
    try {
      // Fix the URL (remove double slash)
      const response = await fetch("http://127.0.0.1:8000/follow-up-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          context: articleData?.data.article || "",
        }),
        signal, // Pass the abort signal to allow cancellation
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      // Process the streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Decode the chunk and append to accumulated content
        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk

        // Update the message with the accumulated content so far
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: accumulatedContent,
                  isTyping: false,
                }
              : msg,
          ),
        )

        // Scroll to bottom with each chunk if auto-scroll is enabled
        if (isAutoScrollEnabled) {
          scrollToBottom()
        }
      }

      // Ensure we mark the message as not typing when done
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                isTyping: false,
              }
            : msg,
        ),
      )

      // Final scroll to bottom when complete
      scrollToBottom("smooth")
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted")
      } else {
        throw error
      }
    }
  }

  // Function to simulate streaming response for mock mode
  const simulateStreamingResponse = async (messageId: string, question: string) => {
    if (!articleData) return

    const { title, summary, keywords, article } = articleData.data
    const lowerQuestion = question.toLowerCase()

    // Prepare the response based on the question
    let fullResponse = ""
    if (lowerQuestion.includes("summary") || lowerQuestion.includes("summarize")) {
      fullResponse = `Here's a summary of the article: ${summary}`
    } else if (lowerQuestion.includes("keyword") || lowerQuestion.includes("topic")) {
      fullResponse = `The main keywords in this article are: ${keywords.join(", ")}.`
    } else if (lowerQuestion.includes("title") || lowerQuestion.includes("headline")) {
      fullResponse = `The title of the article is "${title}".`
    } else if (lowerQuestion.includes("source") || lowerQuestion.includes("reference")) {
      fullResponse = `This article cites the following sources: ${articleData.data.sources.join(", ")}.`
    } else {
      // Default response that references the article content
      const paragraphs = article.split("\n\n")
      const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)]
      fullResponse = `Based on the article, I can tell you that ${randomParagraph.substring(
        0,
        200,
      )}... Would you like to know more about a specific aspect?`
    }

    // Simulate streaming by adding characters one by one
    let currentResponse = ""
    for (let i = 0; i < fullResponse.length; i++) {
      // Add the next character
      currentResponse += fullResponse[i]

      // Update the message with the current partial response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: currentResponse,
                isTyping: i < fullResponse.length - 1, // Only typing until the last character
              }
            : msg,
        ),
      )

      // Scroll to bottom periodically during typing if auto-scroll is enabled
      if (isAutoScrollEnabled && i % 20 === 0) {
        scrollToBottom()
      }

      // Add a small delay to simulate typing
      await new Promise((resolve) => setTimeout(resolve, 15))
    }

    // Final scroll to bottom when complete
    scrollToBottom("smooth")
  }

  const handleCancelResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Remove any typing indicators
    setMessages((prev) => prev.filter((msg) => !msg.isTyping))
    setIsLoading(false)
  }

  if (!articleData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-slate-200 rounded mb-4"></div>
          <div className="h-4 w-40 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  const { title, summary, keywords, article, sources } = articleData.data

  // Format article paragraphs
  const paragraphs = article.split("\n\n")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push("/results")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Article
          </Button>
          <div className="flex items-center gap-1.5">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1.5 rounded-md">
              <Brain className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              AI Assistant
            </h1>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2">
            New Search
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Article and chat container - using grid for equal height columns */}
        <div className="w-full grid grid-cols-2 h-[calc(100vh-64px)]">
          {/* Article panel (left side) */}
          <div className="p-4 overflow-auto border-r border-slate-200 bg-white/50">
            <Card className="p-5 shadow-md rounded-xl bg-white border-slate-200">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Tag className="h-4 w-4 text-blue-600 mr-2" />
                  Article Reference
                </h2>
              </div>

              <h1 className="text-xl font-bold text-slate-800 mb-3">{title}</h1>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Summary</h3>
                <p className="text-slate-600 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                  {summary}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-3 w-3 text-slate-600" />
                  <h3 className="text-sm font-medium text-slate-700">Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Article</h3>
                <div className="space-y-3 text-slate-700 text-sm">
                  {paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Sources</h3>
                <ul className="list-disc list-inside text-slate-600 text-sm">
                  {sources.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Chat panel (right side) - using flex column for proper layout */}
          <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
            {/* Chat header */}
            <div className="p-4 border-b border-slate-200 bg-white/70 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1.5 rounded-md">
                  <Brain className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-medium text-slate-800">Ask follow-up questions</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">Ask any questions about the article to get deeper insights</p>
            </div>

            {/* Messages - using flex-1 to take remaining space */}
            <div
              className="flex-1 overflow-auto px-4 relative"
              ref={messagesContainerRef}
              onScroll={checkScrollPosition}
            >
              <div className="space-y-6 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex items-start gap-3 max-w-[85%] group">
                      {message.sender === "bot" && (
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                            <Brain className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-2xl p-4 shadow-sm ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex items-center gap-1 py-2 px-1 min-w-[60px]">
                            <span className="typing-dot"></span>
                            <span className="typing-dot animation-delay-200"></span>
                            <span className="typing-dot animation-delay-400"></span>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )}
                        <div className="mt-1 text-right">
                          <span
                            className={`text-xs ${
                              message.sender === "user" ? "text-blue-100" : "text-slate-400"
                            } opacity-0 group-hover:opacity-100 transition-opacity`}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      {message.sender === "user" && (
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-slate-200 text-slate-600">You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <button
                  onClick={() => {
                    setIsAutoScrollEnabled(true)
                    scrollToBottom("smooth")
                  }}
                  className="absolute bottom-4 right-4 bg-slate-800 text-white rounded-full p-2 shadow-lg hover:bg-slate-700 transition-colors"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Input area - fixed at bottom */}
            <div className="p-4 border-t border-slate-200 bg-white/70 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask a question about the article..."
                    className="pr-24 py-6 bg-white border-slate-300 focus:border-blue-400 shadow-sm rounded-xl"
                    disabled={isLoading}
                  />
                  {isLoading ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelResponse}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  )}
                </div>
              </form>
              <div className="mt-2 text-center">
                <span className="text-xs text-slate-500 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                  Powered by AI - Ask any question about the article
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add CSS for typing animation */}
      <style jsx global>{`
        .typing-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #64748b;
          margin-right: 4px;
          animation: typing-dot 1.4s infinite ease-in-out both;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        @keyframes typing-dot {
          0%, 80%, 100% { 
            transform: scale(0.6);
            opacity: 0.6;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
