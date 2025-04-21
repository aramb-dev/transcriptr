import { onRender } from "@printerz-app/template-sdk"
import { useEffect, useState } from "react"

type Transcription = {
  title?: string
  content: string
}

function TranscriptionApp() {
  const [variables, setVariables] = useState<Partial<Transcription>>({})

  const { register, unregister } = onRender<Transcription>((printVariables) => {
    setVariables(printVariables)
  });

  useEffect(() => {
    register();

    return () => {
      unregister();
    };
  }, [register, unregister]);

  // Format current date with the same options as in the HTML version
  const formattedDate = (() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return today.toLocaleDateString('en-US', options);
  })();

  // Check if content contains Arabic text (RTL)
  const containsArabic = variables.content ? /[\u0600-\u06FF]/.test(variables.content) : false;

  return (
    <div className="w-full h-full m-0 p-0 font-sans flex bg-white">
      <div className="p-8 md:p-12 lg:p-16 h-full w-full flex flex-col max-w-6xl mx-auto shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b-2 border-blue-500 gap-4">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 leading-tight">
            {variables.title || "Transcription"}
          </span>
          <span className="text-sm lg:text-base text-gray-500 whitespace-nowrap">{formattedDate}</span>
        </div>
        <div
          className={`flex-1 leading-relaxed whitespace-pre-wrap text-base sm:text-lg px-1 py-2 ${containsArabic ? 'rtl' : ''} mb-8`}
          dir={containsArabic ? "rtl" : "ltr"}
        >
          {variables.content || ''}
        </div>
        <div className="mt-auto pt-6 border-t border-gray-200 text-sm text-gray-500 text-center">
          <a href="https://transcriptr.aramb.dev" className="hover:text-blue-600 transition-colors">
            Generated with Transcriptr (https://transcriptr.aramb.dev)
          </a>
        </div>
      </div>
    </div>
  )
}

export default TranscriptionApp
