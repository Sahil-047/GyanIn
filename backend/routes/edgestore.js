const express = require('express');
const { initEdgeStore } = require('@edgestore/server');
let createEdgeStoreExpressHandler;
try {
    // Try different possible import paths for the Express adapter
    const adapterModule = require('@edgestore/server/adapters/express');
    createEdgeStoreExpressHandler = adapterModule.createEdgeStoreExpressHandler || adapterModule.default || adapterModule;
} catch (error) {
    try {
        // Try alternative path
        const altAdapter = require('@edgestore/server/dist/adapters/express');
        createEdgeStoreExpressHandler = altAdapter.createEdgeStoreExpressHandler || altAdapter.default || altAdapter;
    } catch (altError) {
        createEdgeStoreExpressHandler = null;
    }
}
const { z } = require('zod');

const router = express.Router();

// Initialize Edge Store with access keys if available
const accessKey = process.env.EDGE_STORE_ACCESS_KEY;
const secretKey = process.env.EDGE_STORE_SECRET_KEY;

const es = initEdgeStore.create({
    ...(accessKey && secretKey ? {
        accessKey,
        secretKey,
    } : {}),
});

// Define Edge Store router with buckets for Courses and Teachers
const edgeStoreRouter = es.router({
    Courses: es
        .imageBucket({
            maxSize: 1024 * 1024 * 5, // 5MB
            accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        })
        .input(
            z.object({
                type: z.enum(['course']),
            })
        ),
    Teachers: es
        .imageBucket({
            maxSize: 1024 * 1024 * 5, // 5MB
            accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        })
        .input(
            z.object({
                type: z.enum(['teacher']),
            })
        ),
});

// If the official Express adapter is available, mount it to provide the SDK endpoints
if (createEdgeStoreExpressHandler) {
    const handler = createEdgeStoreExpressHandler({
        router: edgeStoreRouter,
        createContext: (req, res) => ({}),
    });
    module.exports = handler;
} else {
    const express = require('express');
    const fallback = express.Router();
    fallback.all('*', (req, res) => {
        return res.status(501).json({
            error: 'Edge Store Express adapter not found',
            message: 'Please install @edgestore/server and ensure adapters/express is available. Try: npm install @edgestore/server',
        });
    });
    module.exports = fallback;
}

