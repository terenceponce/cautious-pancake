import { useEffect, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { PurchaseResponse, SaleStatusResponse } from '@flashsale/api-types'

const OUTCOME_MESSAGE: Record<string, string> = {
  success: 'You secured one!',
  already_purchased: 'You already got one.',
  sold_out: 'Sold out — nothing left.',
  sale_not_active: 'The sale is not running right now.',
}

export function App() {
  const [sale, setSale] = useState<SaleStatusResponse | null>(null)
  const [userId, setUserId] = useState('')
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () =>
      fetch('/api/sale/status')
        .then((res) => res.json() as Promise<SaleStatusResponse>)
        .then(setSale)
        .catch(() => setError('Could not reach the sale service'))
    void refresh()
    const timer = setInterval(refresh, 5000)
    return () => clearInterval(timer)
  }, [])

  async function buy() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim() }),
      })
      setOutcome(((await res.json()) as PurchaseResponse).outcome)
    } catch {
      setError('Could not reach the sale service')
    } finally {
      setBusy(false)
    }
  }

  const active = sale?.status === 'active'
  const soldOut = active && sale.stockRemaining === 0
  const bought = outcome === 'success' || outcome === 'already_purchased'

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Flash Sale</Heading>

        {sale && (
          <Text fontSize="xl">
            <Badge colorScheme={active ? 'green' : 'gray'}>{sale.status}</Badge>{' '}
            {active && `${sale.stockRemaining} left`}
          </Text>
        )}

        <Input
          placeholder="your@email.com"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          isDisabled={bought}
        />

        <Button
          colorScheme="green"
          size="lg"
          isDisabled={!userId.trim() || busy || bought || !active || soldOut}
          isLoading={busy}
          onClick={() => void buy()}
        >
          {soldOut ? 'Sold out' : !active ? sale && sale.status === 'upcoming' ? 'Starts soon' : 'Sale ended' : 'Buy Now'}
        </Button>

        {outcome && (
          <Alert status={outcome === 'success' ? 'success' : 'info'}>
            <AlertIcon />
            {OUTCOME_MESSAGE[outcome]}
          </Alert>
        )}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
      </VStack>
    </Container>
  )
}
