import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig} from 'vite'

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        base: '/moq/',
        plugins: [react()],
        resolve: {
            alias: {
                tslib: 'tslib',
                nanoid: 'nanoid',
                '@': path.resolve(__dirname, './src'),
                '@/assets': path.resolve(__dirname, 'src/assets'),
                '@/components': path.resolve(__dirname, 'src/components'),
                '@/config': path.resolve(__dirname, 'src/config'),
                '@/stores': path.resolve(__dirname, 'src/stores'),
                '@/hooks': path.resolve(__dirname, 'src/hooks'),
                '@/pages': path.resolve(__dirname, 'src/pages'),
                '@/utils': path.resolve(__dirname, 'src/utils'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    charset: false
                }
            },
        },
        server: {
            host: '0.0.0.0',
            fs: {
                // 可以为项目根目录的上一级提供服务
                allow: ['..']
            }
        }
    }
})
