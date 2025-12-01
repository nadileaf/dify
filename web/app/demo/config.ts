export function getChatbotToken(): string {
  if (typeof window === 'undefined')
    return 'igJgPiPgHAEX6uP4'

  const hostname = window.location.hostname
  return hostname === 'agent.mesoor.com' ? 'j49YiDg8s3qQvo94' : 'igJgPiPgHAEX6uP4'
}

export function getDefaultCustomParams(): Array<{ key: string; value: string }> {
  return [
    { key: 'resumeid', value: '247996' },
    { key: 'jobid', value: '' },
    { key: 'projectid', value: '' },
  ]
}

export const DEMO_CONFIG = {
  getChatbotToken,
  getDefaultCustomParams,
}
