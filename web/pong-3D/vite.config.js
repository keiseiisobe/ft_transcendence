import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
    if (command === 'build') {
        return {
            build: {
                lib: {
                    entry: 'src/pongGame.js',
                    name: 'pongGame',
                    fileName: (format) => `pongGame-${format}.js`
                },
            }
        }
    }
    else {
        return {}
    }
})
