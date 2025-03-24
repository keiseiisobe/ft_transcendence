import ModalBase from "./ModalBase";

export default class extends ModalBase {
    constructor() {
        super("login-modal")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Login modal rendered")
            return 0 // did render normaly
        } else {
            return res
        }
    }

    init() {
        super.init()
        $("#login-form").on("submit", this.#onSubmit)
        console.log("Login modal initialized")
    }

    clean() {
        $("#login-form").off("submit", this.#onSubmit)
        $("#login-form").trigger("reset"); 
        this.#clearValidation()
        console.log("Login modal cleaned")
        super.clean()
    }

    #clearValidation = () => {
        $("#login-form").removeClass("was-validated")
        $("#login-form-avatar").removeClass("is-valid is-invalid")
        $("#login-form-username").removeClass("is-valid is-invalid")
        $("#login-form-password").removeClass("is-valid is-invalid")
    }

    #onSubmit = async (e) => {
        e.preventDefault()
        this.#clearValidation()
        if($("#login-form").get(0).checkValidity())
        {
            try
            {
                await window.loginUser(
                    document.getElementById("login-form-username").value,
                    document.getElementById("login-form-password").value
                )
                $("#login-form-username").addClass("is-valid")
                $("#login-form-password").addClass("is-valid")
                this.modal.hide()

            } catch(error)
            {
                console.error('Error during login: ', error);
                $("#login-form-username").addClass("is-invalid")
                $("#login-form-password").addClass("is-invalid")
            }
        } else {
            $("#login-form").addClass("was-validated")
        }
    }
}
