import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'

export default class extends ModalBase {
		constructor() {
				super("qrcode-modal")
		}

		async render() {
				var res = await super.render()
				if (res == 0) {
						let qrImage = document.getElementById("qrCodeImage");
						let qrUrl = `/accounts/generate_qr/`;
						qrImage.src = qrUrl;
						console.log("qrcode modal rendered")
						return 0 // did render normaly
				} else {
						return res
				}
		}

		init() {
				super.init()
				$("#qrcode-submit-button").on("click", this.#onSubmitTotp)
				console.log("qrcode modal initialized")
		}

		clean() {
				$("#qrcode-submit-button").off("click", this.#onSubmitTotp)
				$("#qrcode-form").trigger("reset");
				this.#clearValidation()
				console.log("qrcode modal cleaned")
				super.clean()
		}

		#clearValidation = () => {
				$("#qrcode-form").removeClass("was-validated")
				$("#qrcode-form-qrcode").removeClass("is-valid is-invalid")
		}

		#onSubmitTotp = async (e) => {
				e.preventDefault()
				const totpCode = document.querySelector("#qrcode-form-qrcode").value;
				const url = window.location.origin + "/accounts/verify-totp/";
				const formData = new FormData();
				formData.append("totp_code", totpCode);
				try {
					const response = await fetch(url, {
						method: "POST",
						headers: { "X-CSRFToken": Cookies.get("csrftoken") },
						body: formData
					});
					const text = await response.text();
					if (response.ok) {
						console.log("TOTP authentication successful");
						$('#qrcode-modal').one('hidden.bs.modal', () => {
							location.reload();
						});
						this.modal.hide()
						return
					} else {
						console.log("TOTP authentication failed");
						alert("Authentication failed. Please try again");
					}
				} catch (err) {
					console.error(err);
				}
		}
}
