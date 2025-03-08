import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'

export default class extends ModalBase {
    constructor() {
        super("signup-modal")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Signup modal rendered")
            return 0 // did render normaly
        } else {
            return res
        }
    }

    init() {
        super.init()
        $("#signup-form").on("submit", this.#onSubmit)
        console.log("Signup modal initialized")
    }

    clean() {
        $("#signup-form").off("submit", this.#onSubmit)
        $("#signup-form").trigger("reset"); 
        this.#clearValidation()
        console.log("Signup modal cleaned")
        super.clean()
    }

    #clearValidation = () => {
        $("#signup-form").removeClass("was-validated")
        $("#signup-form-avatar").removeClass("is-valid is-invalid")
        $("#signup-form-username").removeClass("is-valid is-invalid")
        $("#signup-form-password").removeClass("is-valid is-invalid")
    }

    #onSubmit = async (e) => {
        e.preventDefault()
        this.#clearValidation()
        if($("#signup-form").get(0).checkValidity())
        {
            const url = window.location.origin + "/accounts/signup/";
            const formData = new FormData();
            formData.append("avatar", $("#signup-form-avatar").prop('files')[0]);
            formData.append("username", $("#signup-form-username").val());
            formData.append("password1", $("#signup-form-password").val());
            formData.append("password2", $("#signup-form-password").val());
            try
            {
                const promise = await fetch(url, {
                    method: "POST",
                    headers: {"X-CSRFToken": Cookies.get("csrftoken")},
                    mode: 'same-origin',
                    body: formData
                });
                if (promise.ok) {
                    $("#signup-form-avatar").addClass("is-valid")
                    $("#signup-form-username").addClass("is-valid")
                    $("#signup-form-password").addClass("is-valid")
                    this.modal.hide()
                    return
                } 
                if (promise.status != 400)
                    throw promise.status
               
            } catch(error)
            {
                console.error('Error during login: ', error);
            }
            $("#signup-form-avatar").addClass("is-valid")
            $("#signup-form-username").addClass("is-invalid")
            $("#signup-form-password").addClass("is-invalid")
        } else {
            $("#signup-form").addClass("was-validated")
        }
    }
}
