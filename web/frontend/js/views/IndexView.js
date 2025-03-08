import ViewBase from "./ViewBase"

export default class extends ViewBase {
    constructor() {
        super("/pong", "/pong/ssr/index")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Index view rendered")
            if (this.modal)
                return await this.modal.render(false)
            return 0 // did render normaly
        } else {
            return res
        }
    }

    async init() {
        await super.init()
        console.log("Index view initialized")
        if (this.modal)
            await this.modal.init()
    }

    clean() {
        super.clean()
        console.log("Index view cleaned")
    }
}
