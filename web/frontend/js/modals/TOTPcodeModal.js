import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'

export default class extends ModalBase {
		/** @type {string} */
		#username
		constructor(username) {
				super("totp-code-modal")
				this.#username = username
		}

		async render() {
				var res = await super.render()
				if (res == 0) {
						console.log("TOTPcode modal rendered")
						return 0 // did render normaly
				} else {
						return res
				}
		}

		init() {
				super.init()
				$("#totp-submit-button").on("click", this.#onSubmitTotp)
				$("#totp-code-modal").on("hide.bs.modal", this.#onHideModal)
				console.log("TOTPcode modal initialized")
		}

		clean() {
				$("#totp-submit-button").off("click", this.#onSubmitTotp)
				$("#totp-form").trigger("reset");
				$("#totp-code-modal").off("hide.bs.modal", this.#onHideModal)
				this.#clearValidation()
				console.log("TOTPcode modal cleaned")
				super.clean()
		}

		#clearValidation = () => {
				$("#totp-form").removeClass("was-validated")
				$("#totp-form-qrcode").removeClass("is-valid is-invalid")
		}

		#onSubmitTotp = async (e) => {
				e.preventDefault()
				const totpCode = document.querySelector("#totp-form-qrcode").value;
				const url = window.location.origin + "/accounts/verify-totp-code/";
				const formData = new FormData();
				formData.append("totp_code", totpCode);
				formData.append("username", this.#username);
				try {
					const response = await fetch(url, {
						method: "POST",
						headers: { "X-CSRFToken": Cookies.get("csrftoken") },
						body: formData
					});
					const text = await response.text();
					if (response.ok) {
						console.log("TOTP authentication successful");
						this.modal.hide()
						window.updateNavbarAfterLogin(this.#username)
						window.location.reload();
						return
					} else {
						console.log("TOTP authentication failed");
						alert("Authentication failed. Please try again");
					}
				} catch (err) {
					console.error(err);
				}
		}

		#onHideModal = () => {
			console.log("TOTP modal closed without successful login")
	}
}
