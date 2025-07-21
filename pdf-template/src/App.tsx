import { onRender } from "@printerz-app/template-sdk";
import { useEffect, useState } from "react";

type Transcription = {
  title?: string;
  content: string;
};

function TranscriptionApp() {
  const [variables, setVariables] = useState<Partial<Transcription>>({});

  const { register, unregister } = onRender<Transcription>((printVariables) => {
    setVariables(printVariables);
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
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return today.toLocaleDateString("en-US", options);
  })();

  // Check if content contains Arabic text (RTL)
  const containsArabic = variables.content
    ? /[\u0600-\u06FF]/.test(variables.content)
    : false;

  return (
    <div className="m-0 flex h-full w-full bg-white p-0 font-sans">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-8 shadow-sm md:p-12 lg:p-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b-2 border-blue-500 pb-6 sm:flex-row sm:items-center">
          <span className="text-2xl leading-tight font-bold text-blue-800 sm:text-3xl lg:text-4xl">
            {variables.title || "Transcription"}
          </span>
          <span className="text-sm whitespace-nowrap text-gray-500 lg:text-base">
            {formattedDate}
          </span>
        </div>
        <div
          className={`flex-1 px-1 py-2 text-base leading-relaxed whitespace-pre-wrap sm:text-lg ${containsArabic ? "rtl" : ""} mb-8`}
          dir={containsArabic ? "rtl" : "ltr"}
        >
          {variables.content || ""}
        </div>
        <div className="mt-auto border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          <a
            href="https://transcriptr.aramb.dev"
            className="transition-colors hover:text-blue-600"
          >
            Generated with Transcriptr (https://transcriptr.aramb.dev)
          </a>
        </div>
      </div>
    </div>
  );
}

export default TranscriptionApp;
