import * as bootstrap from "bootstrap";

export default class {
    constructor(id) {
        this.modalId = id
        this.onHide = null
    }

    async render() {
    }

    async init() {
        this.modal = new bootstrap.Modal(document.getElementById(this.modalId))
        this.modal.show()
        this.handleHide = () => {
            if (this.onHide) {
                this.onHide();
            }
        };
        document.getElementById(this.modalId).addEventListener("hide.bs.modal", this.handleHide);
    }
    
    hide() {
        const modalElement = document.getElementById(this.modalId);
        modalElement.removeEventListener("hide.bs.modal", this.handleHide);
        this.modal.hide();
        modalElement.addEventListener("hide.bs.modal", this.handleHide);
    }

    clean() {
        document.getElementById(this.modalId).removeEventListener("hide.bs.modal", this.handleHide);
    }
}
