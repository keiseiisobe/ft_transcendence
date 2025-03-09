import * as bootstrap from "bootstrap";

export default class {
    constructor(id) {
        this.modalId = id
        this.onHide = null
    }

    async render() {
        console.log("modal base rendered")
        return 0 // did render normaly
    }

    applyRendered() {
        console.log("modal base rendered applied")
    }

    init() {
        this.modal = new bootstrap.Modal(document.getElementById(this.modalId))
        this.modal.show()
        this.onHideListener = () => {
            this.onHide()
        }
        document.getElementById(this.modalId).addEventListener("hide.bs.modal", this.onHideListener);
        console.log("modal base initialized")
    }
    
    hide() {
        const modalElement = document.getElementById(this.modalId);
        modalElement.removeEventListener("hide.bs.modal", this.onHideListener);
        this.modal.hide();
        modalElement.addEventListener("hide.bs.modal", this.onHideListener);
    }

    clean() {
        document.getElementById(this.modalId).removeEventListener("hide.bs.modal", this.onHideListener);
        this.modal.hide()
    }
}
