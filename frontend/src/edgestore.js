import { createEdgeStoreProvider } from '@edgestore/react'

// Configure Edge Store - uses relative URL which goes through Vite proxy to backend
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: '/api/edgestore',
})


