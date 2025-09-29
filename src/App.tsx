import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { router } from './routes'
import { Toaster } from './components/ui/toaster'
import { useEffect } from 'react'
import { useAuthStore } from './features/auth/stores/auth.store'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const { isAuthenticated, user } = useAuthStore()
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, user })
  }, [isAuthenticated, user])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App

