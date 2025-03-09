import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'
import IndexView from '../views/IndexView'
import LoginModal from './LoginModal'

export default class extends ModalBase {
    constructor() {
        super("edit-password-modal")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Edit password modal rendered")
            return 0 // did render normaly
        } else {
            return res
        }
    }

    init() {
        super.init()
        $("#edit-password-form").on("submit", this.#onSubmit)
        console.log("Edit password modal initialized")
    }

    clean() {
        $("#edit-password-form").off("submit", this.#onSubmit)
        $("#edit-password-form").trigger("reset"); 
        this.#clearValidation()
        console.log("Edit password modal cleaned")
        super.clean()
    }

    #clearValidation = () => {
        $("#edit-password-form").removeClass("was-validated")
        $("#edit-password-form-password").removeClass("is-valid is-invalid")
    }

    #onSubmit = async (e) => {
        e.preventDefault()
        this.#clearValidation()
        if($("#edit-password-form").get(0).checkValidity())
        {
            const url = window.location.origin + "/accounts/edit/password/";
            const formData = new FormData();
            formData.append("password", $("#edit-password-form-password").val());
            try
            {
                const promise = await fetch(url, {
                    method: "POST",
                    headers: { "X-CSRFToken": Cookies.get("csrftoken") },
                    mode: 'same-origin',
                    body: formData
                });
                if (promise.ok) {
                    $("#edit-password-form-password").addClass("is-valid")
                    $("#navbar-btns").html(`
                        <a class="nav-item btn btn-dark" href="/pong/login">Login</a>
                        <a class="nav-item btn btn-dark" href="/pong/signup">Signup</a>
                    `)
                    if (await window.switchToView(new IndexView(), new LoginModal()) == 0)
                        window.pushState("/pong/login")
                    return
                } 
                if (promise.status != 400)
                    throw promise
               
            } catch(error)
            {
                console.error('Error during password update: ', error);
            }
            $("#edit-password-form-password").addClass("is-invalid")
        } else {
            $("#edit-password-form").addClass("was-validated")
        }
    }
}
