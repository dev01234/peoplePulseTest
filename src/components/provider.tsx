'use client'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

export default function Providers({children}:{children: React.ReactNode}){
    return (
        <QueryClientProvider client={queryClient}>
        <ThemeProvider
          enableSystem
          attribute='class'
          defaultTheme='system'
          disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
        </QueryClientProvider>
    )
}   