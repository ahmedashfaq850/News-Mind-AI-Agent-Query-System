"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Tag, MessageSquare, Share2, BookmarkPlus, ExternalLink, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

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

export default function ResultsPage() {
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const router = useRouter()
  const [currentTime] = useState(new Date())

  useEffect(() => {
    // Get the data from localStorage
    const storedData = localStorage.getItem("articleData")
    if (storedData) {
      try {
        setArticleData(JSON.parse(storedData))
      } catch (error) {
        console.error("Error parsing article data:", error)
        router.push("/")
      }
    } else {
      // If no data, redirect back to home
      router.push("/")
    }
  }, [router])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            New Search
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-slate-600">
              <BookmarkPlus className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="text-slate-600">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={() => router.push("/follow-up")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask Follow-up Questions
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article metadata */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              >
                {keyword}
              </Badge>
            ))}
          </div>
          <div className="text-sm text-slate-500">
            Generated on{" "}
            {currentTime.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Article content */}
        <Card className="p-8 shadow-xl rounded-2xl bg-white border-slate-200 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6 leading-tight">{title}</h1>

          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-lg font-medium text-slate-800 mb-3 flex items-center">
              <Tag className="h-4 w-4 text-blue-600 mr-2" />
              Summary
            </h2>
            <p className="text-slate-700 leading-relaxed">{summary}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Article</h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h2 className="text-lg font-medium text-slate-800 mb-3">Sources</h2>
            <ul className="space-y-2 text-slate-600">
              {sources.map((source, index) => (
                <li key={index} className="flex items-start">
                  <ExternalLink className="h-4 w-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Have questions about this article?</h3>
              <p className="text-blue-100">Use our AI-powered chat to get deeper insights and analysis.</p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push("/follow-up")}
              className="whitespace-nowrap bg-white text-blue-700 hover:bg-blue-50"
            >
              Ask Follow-up Questions
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-slate-200 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© 2025 NewsMind AI. All rights reserved.</p>
          <p className="mt-2">Powered by multi-agent news analysis system</p>
        </div>
      </footer>
    </div>
  )
}
