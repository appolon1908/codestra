import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProviderProps {
  children: React.ReactNode;
}

const QueryProvider = ({ children }: ProviderProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;
