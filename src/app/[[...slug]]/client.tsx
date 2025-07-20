'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { BrowserRouter as Router } from 'react-router-dom'

const App = dynamic(() => import('../../App'), { ssr: false })

export function ClientOnly() {
  return (
    <Router>
      <App />
    </Router>
  )
}