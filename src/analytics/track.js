// src/analytics/track.js
import apiClient from '@/api/client'

function getSessionId() {
  let id = localStorage.getItem('sessionId')

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('sessionId', id)
  }

  return id
}

export function trackRoute(to) {
  apiClient.post('/visits/track', {
    path: to.fullPath,
    referrer: document.referrer,
    sessionId: getSessionId(),
    deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent)
      ? 'mobile'
      : 'desktop'
  }).catch(() => {})
}