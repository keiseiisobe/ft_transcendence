export default class {
    constructor(modal = null) {
        this.modal = modal
    }

    async render() {
        $("#content").html("PongView")
        if (this.modal)
            await this.modal.render()
    }

    async init() {
        if (this.modal) {
            await this.modal.init()
            this.modal.onHide = () => {
                this.modal.clean()
                history.pushState(null, null, "/pong")
            }
        }
    }

    clean() {
        if (this.modal) {
            this.modal.hide()
            this.modal.clean()
        }
    }
}
