import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'

export default class extends ModalBase {
    constructor() {
        super("edit-avatar-modal")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Edit avatar modal rendered")
            return 0 // did render normaly
        } else {
            return res
        }
    }

    init() {
        super.init()
        $("#edit-avatar-form").on("submit", this.#onSubmit)
        console.log("Edit avatar modal initialized")
    }

    clean() {
        $("#edit-avatar-form").off("submit", this.#onSubmit)
        $("#edit-avatar-form").trigger("reset"); 
        this.#clearValidation()
        console.log("Edit avatar modal cleaned")
        super.clean()
    }

    #clearValidation = () => {
        $("#edit-avatar-form").removeClass("was-validated")
        $("#edit-avatar-form-avatar").removeClass("is-valid is-invalid")
    }

    #onSubmit = async (e) => {
        e.preventDefault()
        this.#clearValidation()
        if($("#edit-avatar-form").get(0).checkValidity())
        {
            const url = window.location.origin + "/accounts/edit/avatar/";
            const formData = new FormData();
            formData.append("avatar", $("#edit-avatar-form-avatar").prop('files')[0]);
            try
            {
                const promise = await fetch(url, {
                    method: "POST",
                    headers: { "X-CSRFToken": Cookies.get("csrftoken") },
                    mode: 'same-origin',
                    body: formData
                });
                if (promise.ok) {
                    $("#edit-avatar-form-avatar").addClass("is-valid")
                    this.modal.hide()
                    return
                } 
                if (promise.status != 400)
                    throw promise
               
            } catch(error)
            {
                console.error('Error during avatar update: ', error);
            }
            $("#edit-avatar-form-avatar").addClass("is-invalid")
        } else {
            $("#edit-avatar-form").addClass("was-validated")
        }
    }
}
