import ModalBase from "./ModalBase";

export default class extends ModalBase {
    constructor() {
        super("login-modal")
    }
    async render() {
        await super.render()
        const url = window.location.origin + "/pong/dev/login-modal";
        const promise = await fetch(url, {
            method: "GET",
            headers: {
                "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
        });
        if (promise.ok) {
            var modalDiv = document.getElementById("modal")
            modalDiv.innerHTML = await promise.text();
        }
        else
            console.log("error")
    }
}
