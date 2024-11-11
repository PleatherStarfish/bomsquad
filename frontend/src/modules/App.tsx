import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import InfiniteModulesList from "./InfiniteModulesList"; // Adjust this path as necessary
import React from "react";

// Create a new QueryClient instance for managing API calls
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <InfiniteModulesList />
  </QueryClientProvider>
);

export default App;
