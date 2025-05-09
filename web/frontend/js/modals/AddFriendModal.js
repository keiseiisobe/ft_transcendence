import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'

export default class extends ModalBase {
    constructor() {
        super("add-friend-modal")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Add friend modal rendered")
            return 0 // did render normaly
        } else {
            return res
        }
    }

    init() {
        super.init()
        $("#add-friend-form").on("submit", this.#onSubmit)
        console.log("Add friend modal initialized")
    }

    clean() {
        $("#add-friend-form").off("submit", this.#onSubmit)
        $("#add-friend-form").trigger("reset"); 
        this.#clearValidation()
        console.log("Add friend modal cleaned")
        super.clean()
    }

    #clearValidation = () => {
        $("#add-friend-form").removeClass("was-validated")
        $("#add-friend-form-username").removeClass("is-valid is-invalid")
    }

    #onSubmit = async (e) => {
        e.preventDefault()
        this.#clearValidation()
        if($("#add-friend-form").get(0).checkValidity())
        {
            const url = window.location.origin + "/accounts/friend/add/";
            const formData = new FormData();
            formData.append("friendname", $("#add-friend-form-username").val());
            try
            {
                const promise = await fetch(url, {
                    method: "POST",
                    headers: { "X-CSRFToken": Cookies.get("csrftoken") },
                    mode: 'same-origin',
                    body: formData
                });
                if (promise.ok) {
                    $("#add-friend-form-username").addClass("is-valid")
                    this.modal.hide()
                    return
                } 
                if (promise.status != 400)
                    throw promise
               
            } catch(error)
            {
                console.error('Error during add friend: ', error);
            }
            $("#add-friend-form-username").addClass("is-invalid")
        } else {
            $("#add-friend-form").addClass("was-validated")
        }
    }
}
