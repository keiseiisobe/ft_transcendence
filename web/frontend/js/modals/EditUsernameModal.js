import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'

export default class extends ModalBase {
    constructor() {
        super("edit-username-modal")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Edit username modal rendered")
            return 0 // did render normaly
        } else {
            return res
        }
    }

    init() {
        super.init()
        $("#edit-username-form").on("submit", this.#onSubmit)
        console.log("Edit username modal initialized")
    }

    clean() {
        $("#edit-username-form").off("submit", this.#onSubmit)
        $("#edit-username-form").trigger("reset"); 
        this.#clearValidation()
        console.log("Edit username modal cleaned")
        super.clean()
    }

    #clearValidation = () => {
        $("#edit-username-form").removeClass("was-validated")
        $("#edit-username-form-username").removeClass("is-valid is-invalid")
    }

    #onSubmit = async (e) => {
        e.preventDefault()
        this.#clearValidation()
        if($("#edit-username-form").get(0).checkValidity())
        {
            const url = window.location.origin + "/accounts/edit/username/";
            const formData = new FormData();
            formData.append("username", $("#edit-username-form-username").val());
            try
            {
                const promise = await fetch(url, {
                    method: "POST",
                    headers: { "X-CSRFToken": Cookies.get("csrftoken") },
                    mode: 'same-origin',
                    body: formData
                });
                if (promise.ok) {
                    $("#edit-username-form-username").addClass("is-valid")
                    this.modal.hide()
                    return
                } 
                if (promise.status != 400)
                    throw promise
               
            } catch(error)
            {
                console.error('Error during username update: ', error);
            }
            $("#edit-username-form-username").addClass("is-invalid")
        } else {
            $("#edit-username-form").addClass("was-validated")
        }
    }
}
