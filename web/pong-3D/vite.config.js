export default {
    base: "/static/",
    build: {
        manifest: "manifest.json",
        rollupOptions: {
            input: {
                pongGame: 'src/pongGame.js'
            }
        }
    }
}
