import ViewBase from "./ViewBase"

export default class extends ViewBase {
    constructor() {
        super("/pong/mypage", "/pong/ssr/mypage")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Mypage view rendered")
            if (this.modal)
                return await this.modal.render(false)
            return 0 // did render normaly
        } else {
            return res
        }
    }

    async init() {
        await super.init()
        console.log("Mypage view initialized")
        if (this.modal)
            await this.modal.init()
    }

    clean() {
        super.clean()
        console.log("Mypage view cleaned")
    }
}
