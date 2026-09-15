import { useEffect, useState } from 'react'
import { Box, Heading, Text, Badge } from '@chakra-ui/react'
import type { SaleStatusResponse } from '@flashsale/api-types'

export function App() {
  const [sale, setSale] = useState<SaleStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sale/status')
      .then((res) => res.json() as Promise<SaleStatusResponse>)
      .then(setSale)
      .catch(() => setError('Could not reach the sale service'))
  }, [])

  return (
    <Box p={8}>
      <Heading size="lg" mb={4}>
        Flash Sale
      </Heading>
      {error && <Text color="red.400">{error}</Text>}
      {sale && (
        <Text fontSize="xl">
          Status: <Badge colorScheme={sale.status === 'active' ? 'green' : 'gray'}>{sale.status}</Badge>{' '}
          — {sale.stockRemaining} left
        </Text>
      )}
    </Box>
  )
}
