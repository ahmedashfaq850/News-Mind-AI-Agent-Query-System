"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, Newspaper, Brain, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import LoadingAnimation from "@/components/loading-animation"

// Mock data for when the API is unavailable
const MOCK_DATA = {
  status_code: 201,
  message: "Query processed successfully and article generated.",
  data: {
    title: "Mock Article: API Connectivity Issues",
    summary: "This is a mock response generated when the backend API is unavailable or returning invalid responses.",
    keywords: ["mock data", "API troubleshooting", "fallback response", "development mode", "testing"],
    article:
      "This is a mock article generated because the backend API at http://127.0.0.1:8000/generate-article is not responding with valid JSON.\n\nPossible reasons for this issue:\n\n1. The backend server might not be running\n2. The API endpoint might be incorrect\n3. The API might be expecting a different request format\n4. There might be CORS or network issues\n\nPlease check your backend server and ensure it's properly configured to return JSON responses.",
    sources: ["Mock Source (2025)"],
  },
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState("")
  const [apiStatus, setApiStatus] = useState<"unknown" | "online" | "offline">("unknown")
  const [useMockApi, setUseMockApi] = useState(false)

  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === "development"

  useEffect(() => {
    // Load mock API preference from localStorage
    if (isDev) {
      const storedMockPref = localStorage.getItem("useMockApi")
      setUseMockApi(storedMockPref === "true")
    }

    // Remove this line:
    // checkApiStatus()
  }, [isDev])

  useEffect(() => {
    // Save mock API preference to localStorage
    if (isDev) {
      localStorage.setItem("useMockApi", useMockApi ? "true" : "false")
    }
  }, [useMockApi, isDev])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLoading) {
        setIsLoading(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isLoading])

  const checkApiStatus = async () => {
    if (useMockApi) {
      setApiStatus("online")
      return
    }

    try {
      // Just check if the endpoint is reachable without sending actual data
      const response = await fetch("http://127.0.0.1:8000/generate-article", {
        method: "HEAD", // Use HEAD request instead of POST
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setApiStatus("online")
      } else {
        setApiStatus("offline")
      }
    } catch (error) {
      console.error("API status check failed:", error)
      setApiStatus("offline")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setIsLoading(true)
    setErrorMessage("")

    // If mock mode is enabled, return mock data
    if (useMockApi) {
      setTimeout(() => {
        localStorage.setItem("articleData", JSON.stringify(MOCK_DATA))
        router.push("/results")
      }, 1500) // Simulate API delay
      return
    }

    try {
      // Make a direct request to the backend API
      const response = await fetch("http://127.0.0.1:8000/generate-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      // Check if the response is JSON
      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        // Handle non-JSON response
        const responseText = await response.text()
        console.error("Non-JSON response:", responseText.substring(0, 1000))
        throw new Error("The API returned a non-JSON response. Please check your backend configuration.")
      }

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(
          responseData.message || responseData.error || `Server responded with status: ${response.status}`,
        )
      }

      localStorage.setItem("articleData", JSON.stringify(responseData))
      router.push("/results")
    } catch (error) {
      console.error("Error fetching data:", error)
      setIsLoading(false)
      setErrorMessage(error instanceof Error ? error.message : "Failed to connect to the API")

      // In development mode, offer to use mock data
      if (isDev) {
        setErrorMessage((prev) => `${prev} You can enable mock mode to test the UI without the backend.`)
      }
    }
  }

  if (isLoading) {
    return <LoadingAnimation />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
            <Brain className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            NewsMind AI
          </h1>
        </div>

        {isDev && (
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch id="mock-mode" checked={useMockApi} onCheckedChange={setUseMockApi} />
              <label
                htmlFor="mock-mode"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Dev Mode
              </label>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                apiStatus === "online"
                  ? "bg-green-100 text-green-800"
                  : apiStatus === "offline"
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-100 text-slate-800"
              }`}
            >
              {apiStatus === "online" ? "API Online" : apiStatus === "offline" ? "API Offline" : "Checking API..."}
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            AI-Powered News Analysis
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 text-transparent bg-clip-text">
            Discover News Insights with AI
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Ask questions about topics that interest you and let our AI agents search, summarize, and analyze recent
            news from trusted sources.
          </p>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-2xl mx-auto relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-20 -z-10"></div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <form onSubmit={handleSubmit} className="w-full">
              <label htmlFor="query" className="block text-sm font-medium text-slate-700 mb-2">
                What news topic would you like to explore?
              </label>
              <div className="relative w-full">
                <Input
                  id="query"
                  type="text"
                  placeholder="Try 'Latest developments in renewable energy' or 'Global economic trends'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full py-6 pl-5 pr-36 text-lg rounded-xl border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-6"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Analyze
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 max-w-2xl w-full">
            <h3 className="font-semibold mb-2">Error Details:</h3>
            <p className="mb-2">{errorMessage}</p>
            <p className="text-sm">Make sure your backend server is running at http://127.0.0.1:8000</p>
            <div className="mt-3 text-sm">
              <p className="font-medium">Troubleshooting steps:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Verify the backend server is running</li>
                <li>Check that the API endpoint is correct</li>
                <li>Ensure the API expects a {"query"} parameter</li>
                <li>Check the backend server logs for errors</li>
                <li>Make sure CORS is enabled on your backend server</li>
                {isDev && !useMockApi && (
                  <li>
                    <button onClick={() => setUseMockApi(true)} className="text-blue-600 hover:underline">
                      Enable mock mode
                    </button>{" "}
                    to test the UI without the backend
                  </li>
                )}
              </ol>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10 text-slate-800">How NewsMind AI Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Newspaper className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800">Smart Search</h3>
              <p className="text-slate-600">
                Our AI agents search through trusted news sources to find relevant information on your topic.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800">AI Analysis</h3>
              <p className="text-slate-600">
                Advanced language models analyze and synthesize information to create comprehensive reports.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800">Follow-up Questions</h3>
              <p className="text-slate-600">
                Ask detailed follow-up questions about the article with our interactive chat interface.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© 2025 NewsMind AI. All rights reserved.</p>
          <p className="mt-2">Powered by multi-agent news analysis system</p>
        </div>
      </footer>
    </div>
  )
}
