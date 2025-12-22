import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10KB
      deleteOriginFile: false,
    }),
    // Brotli compression (better compression than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
    // Enable CSS minification
    devSourcemap: false,
  },
  build: {
    // Use esbuild for minification (faster than terser, already included with Vite)
    minify: 'esbuild',
    // esbuild minification options
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none',
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
    // CSS minification
    cssMinify: true,
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and related packages
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separate Framer Motion
          'framer-motion': ['framer-motion'],
          // Separate Lucide icons
          'lucide-icons': ['lucide-react'],
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Disable source maps in production for smaller builds
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Reduce chunk size
    target: 'esnext',
    // Increase chunk size limit for initial chunk
    assetsInlineLimit: 4096,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    // Enable compression in dev mode
    compress: true,
  },
})