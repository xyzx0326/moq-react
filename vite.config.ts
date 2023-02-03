import react from '@vitejs/plugin-react'
import path from 'path'
import {defineConfig} from 'vite'

const htmlPlugin = () => {
    return {
        name: 'html-transform',
        transformIndexHtml(html: any) {
            let match;
            const patternScript = /<script type="module" crossorigin src=.*?><\/script>/g
            const patternLink = /<link .*?>/g
            const script = [];
            while ((match = patternScript.exec(html)) != null) {
                script.push(match[0])
            }
            while ((match = patternLink.exec(html)) != null) {
                script.push(match[0])
            }
            let scriptStr = `<script src="/moq/assets/gif.js"></script>`
            return html.replace(`<!-- script import -->`, scriptStr)
        }
    }
}
// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        base: '/moq/',
        plugins: [react(), htmlPlugin()],
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
