import { useEffect, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Container,
  Flex,
  Heading,
  HStack,
  Progress,
  Text,
} from '@chakra-ui/react'
import type { PurchaseResponse, SaleStatusResponse } from '@flashsale/api-types'
import { useSession } from './session'
import { LoginModal } from './LoginModal'

const OUTCOME_MESSAGE: Record<string, string> = {
  success: 'You secured one!',
  already_purchased: 'You already got one.',
  sold_out: 'Sold out — nothing left.',
  sale_not_active: 'The sale is not running right now.',
}

function Countdown({ target, label }: { target: string; label: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const secondsLeft = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000))
  if (secondsLeft === 0) return null
  const h = Math.floor(secondsLeft / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  const s = secondsLeft % 60
  const text = h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(s).padStart(2, '0')}`
  return (
    <Text fontSize="sm" color="gray.500">
      {label} in {text}
    </Text>
  )
}

export function App() {
  const [sale, setSale] = useState<SaleStatusResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const { user, signIn, signOut } = useSession()

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

  async function attemptPurchase(email: string): Promise<void> {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: email }),
      })
      setOutcome(((await res.json()) as PurchaseResponse).outcome)
    } catch {
      setError('Could not reach the sale service')
    } finally {
      setBusy(false)
    }
  }

  function buy(): void {
    if (!user) {
      setLoginOpen(true)
      return
    }
    void attemptPurchase(user)
  }

  // The purchase outcome belongs to the session user; a fresh session starts clean.
  function handleSignOut(): void {
    signOut()
    setOutcome(null)
    setError(null)
  }

  const active = sale?.status === 'active'
  const soldOut = active && sale.stockRemaining === 0
  const bought = outcome === 'success' || outcome === 'already_purchased'

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottomWidth="1px" px={6} py={3}>
        <Container maxW="4xl">
          <Flex justify="space-between" align="center">
            <Heading size="md">⚡ FlashSale</Heading>
            {user ? (
              <HStack spacing={3}>
                <Text fontSize="sm" color="gray.600">
                  {user}
                </Text>
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </HStack>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setLoginOpen(true)}>
                Sign in
              </Button>
            )}
          </Flex>
        </Container>
      </Box>

      <Container maxW="4xl" py={10}>
        <Card overflow="hidden">
          <Box h="220px" bgGradient="linear(to-br, purple.500, pink.500)" display="flex" alignItems="center" justifyContent="center">
            <Text fontSize="96px">🎧</Text>
          </Box>
          <CardBody>
            <Flex justify="space-between" align="flex-start" mb={4}>
              <Box>
                <Heading size="lg" mb={1}>
                  Nova One — Limited Edition
                </Heading>
                <Text fontSize="2xl" fontWeight="bold">
                  $149
                </Text>
              </Box>
              <Box textAlign="right">
                <Badge colorScheme={active ? 'green' : 'gray'} fontSize="md" px={2} py={1}>
                  {sale?.status ?? '…'}
                </Badge>
                <Box mt={2}>
                  {sale?.status === 'upcoming' && <Countdown target={sale.startsAt} label="Starts" />}
                  {sale?.status === 'active' && <Countdown target={sale.endsAt} label="Ends" />}
                </Box>
              </Box>
            </Flex>

            {sale && active && (
              <Box mb={4}>
                <Progress
                  value={(sale.stockRemaining / sale.stockTotal) * 100}
                  size="sm"
                  colorScheme={sale.stockRemaining / sale.stockTotal < 0.2 ? 'red' : 'green'}
                  mb={1}
                />
                <Text fontSize="sm" color="gray.500">
                  {sale.stockRemaining} of {sale.stockTotal} left
                </Text>
              </Box>
            )}

            {outcome && (
              <Alert status={outcome === 'success' ? 'success' : 'info'} mb={error ? 3 : 0}>
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
          </CardBody>
          <CardFooter pt={0}>
            <Button
              colorScheme="green"
              size="lg"
              width="100%"
              isDisabled={busy || bought || !active || soldOut}
              isLoading={busy}
              onClick={buy}
            >
              {bought ? 'Secured ✓' : soldOut ? 'Sold out' : !active ? 'Sale not running' : 'Buy Now'}
            </Button>
          </CardFooter>
        </Card>
      </Container>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={(email) => {
          setLoginOpen(false)
          signIn(email)
          void attemptPurchase(email)
        }}
      />
    </Box>
  )
}
