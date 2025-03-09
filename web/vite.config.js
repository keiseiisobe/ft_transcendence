import { resolve } from 'path'

const frontendDir = resolve(__dirname, 'frontend')

export default {
    root: frontendDir,
    base: "/static/",
    resolve: {
        alias: {
            '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
            '~fontawesome': resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free'),
        }
    },
    build: {
        manifest: "manifest.json",
        rollupOptions: {
            input: {
                base: 'frontend/js/base.js',
            }
        }
    }
}
