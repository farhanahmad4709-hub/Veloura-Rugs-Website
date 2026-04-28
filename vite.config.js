import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Set base to './' for relative paths, which is best for GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        contact: resolve(__dirname, 'contact.html'),
        login: resolve(__dirname, 'login.html'),
        product: resolve(__dirname, 'product.html'),
        shop: resolve(__dirname, 'shop.html'),
        signup: resolve(__dirname, 'signup.html'),
        wishlist: resolve(__dirname, 'wishlist.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true
  }
})
