
> transcriptr@0.1.0 lint
> eslint .


/Users/aramb-dev/Github/transcriptr/src/components/transcription/TranscriptionProcessing.tsx
  19:3  error  'getProgressColor' is defined but never used  @typescript-eslint/no-unused-vars

/Users/aramb-dev/Github/transcriptr/src/components/transcription/TranscriptionResult.tsx
  272:6   warning  React Hook useEffect has a missing dependency: 'pdfTitle'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  562:56  error    Unexpected any. Specify a different type                                                                     @typescript-eslint/no-explicit-any

/Users/aramb-dev/Github/transcriptr/src/components/ui/animated-list.tsx
  6:24  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/Users/aramb-dev/Github/transcriptr/src/components/ui/button.tsx
  59:18  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/Users/aramb-dev/Github/transcriptr/src/components/ui/scroll-reveal-section.tsx
   1:17  error  'forwardRef' is defined but never used    @typescript-eslint/no-unused-vars
   2:18  error  'useInView' is defined but never used     @typescript-eslint/no-unused-vars
  10:14  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/Users/aramb-dev/Github/transcriptr/src/components/ui/sequential-reveal-list.tsx
  10:23  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  11:18  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/Users/aramb-dev/Github/transcriptr/src/hooks/useScrollAnimation.tsx
  1:10  error  'useEffect' is defined but never used  @typescript-eslint/no-unused-vars
  1:29  error  'useState' is defined but never used   @typescript-eslint/no-unused-vars

/Users/aramb-dev/Github/transcriptr/src/hooks/useSessionPersistence.ts
  9:10  error  'TranscriptionStatus' is defined but never used  @typescript-eslint/no-unused-vars

/Users/aramb-dev/Github/transcriptr/src/hooks/useTranscriptionPolling.ts
   1:10  error    'useState' is defined but never used                                                                             @typescript-eslint/no-unused-vars
   6:23  error    Unexpected any. Specify a different type                                                                         @typescript-eslint/no-explicit-any
  46:6   warning  React Hook useEffect has a missing dependency: 'startPolling'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/aramb-dev/Github/transcriptr/src/lib/animations.ts
  1:25  error  'Target' is defined but never used               @typescript-eslint/no-unused-vars
  1:33  error  'TargetAndTransition' is defined but never used  @typescript-eslint/no-unused-vars

/Users/aramb-dev/Github/transcriptr/src/lib/firebase-proxy.ts
  39:9  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/Users/aramb-dev/Github/transcriptr/src/lib/firebase-utils.ts
  67:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/Users/aramb-dev/Github/transcriptr/src/lib/pdf-generation.ts
    8:9   error  Unexpected any. Specify a different type                      @typescript-eslint/no-explicit-any
   16:7   error  'generatePdfWithPrinterz' is assigned a value but never used  @typescript-eslint/no-unused-vars
   18:9   error  Unexpected any. Specify a different type                      @typescript-eslint/no-explicit-any
   52:16  error  'e' is defined but never used                                 @typescript-eslint/no-unused-vars
  169:41  error  Unexpected any. Specify a different type                      @typescript-eslint/no-explicit-any

/Users/aramb-dev/Github/transcriptr/src/lib/replicate-client.ts
   24:16  error  Unexpected any. Specify a different type                                                                             @typescript-eslint/no-explicit-any
   26:12  error  Unexpected any. Specify a different type                                                                             @typescript-eslint/no-explicit-any
   44:7   error  'maxRetries' is never reassigned. Use 'const' instead                                                                prefer-const
   79:9   error  Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free  @typescript-eslint/ban-ts-comment
   92:20  error  'e' is defined but never used                                                                                        @typescript-eslint/no-unused-vars
  127:27  error  Unexpected any. Specify a different type                                                                             @typescript-eslint/no-explicit-any
  163:21  error  Unexpected any. Specify a different type                                                                             @typescript-eslint/no-explicit-any

✖ 32 problems (29 errors, 3 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.

