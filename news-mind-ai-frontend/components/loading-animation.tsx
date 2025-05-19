import { Brain, Sparkles } from "lucide-react"

export default function LoadingAnimation() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-75 animate-pulse"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center animate-pulse">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          Processing your query
        </h2>

        <div className="max-w-md mx-auto mb-6 bg-white p-4 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <p className="text-slate-800 font-medium">AI Agents Working</p>
          </div>
          <p className="text-slate-600 text-sm">
            Our AI agents are searching, summarizing, and analyzing recent news from trusted sources...
          </p>
        </div>

        <div className="flex justify-center space-x-2">
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "450ms" }}></div>
        </div>

        <p className="text-sm text-slate-500 max-w-md mx-auto mt-6">
          If this takes too long, the backend server might not be running.
          <br />
          Press ESC to cancel and try again.
        </p>
      </div>
    </div>
  )
}
