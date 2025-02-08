import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.js',
            name: 'threeD',
            fileName: (format) => `threeD.${format}.js`
        }
    }
});

