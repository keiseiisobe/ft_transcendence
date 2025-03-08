import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'

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
            const url = window.location.origin + "/accounts/login/";
            const formData = new FormData();
            formData.append("username", document.getElementById("login-form-username").value);
            formData.append("password", document.getElementById("login-form-password").value);
            try
            {
                const promise = await fetch(url, {
                    method: "POST",
                    headers: {"X-CSRFToken": Cookies.get("csrftoken")},
                    mode: 'same-origin',
                    body: formData
                });
                if (promise.ok) {
                    $("#login-form-username").addClass("is-valid")
                    $("#login-form-password").addClass("is-valid")
                    $("#navbar-btns").html(`
                        <a class="nav-item btn btn-dark" href="/pong/mypage">My Page</a>
                        <a class="nav-item btn btn-dark" href="/accounts/logout/">Logout</a>
                    `)
                    this.modal.hide()
                    return
                }
                else if (promise.status != 400)
                    throw promise.status

            } catch(error)
            {
                console.error('Error during login: ', error);
            }
            $("#login-form-username").addClass("is-invalid")
            $("#login-form-password").addClass("is-invalid")
        } else {
            $("#login-form").addClass("was-validated")
        }
    }
}
