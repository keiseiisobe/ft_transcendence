import ModalBase from "./ModalBase";
import Cookies from 'js-cookie'
import QRcodeModal from "./QRcodeModal";

export default class extends ModalBase {
		constructor() {
				super("edit-totp-modal")
		}

		async render() {
				var res = await super.render()
				if (res == 0) {
						console.log("Edit totp modal rendered")
						return 0 // did render normaly
				} else {
						return res
				}
		}

		init() {
				super.init()
				$("#enable-totp-button").on("click", this.#onEnableTotp)
				$("#disable-totp-button").on("click", this.#onDisableTotp)
				console.log("Edit totp modal initialized")
		}

		clean() {
				$("#enable-totp-button").off("click", this.#onEnableTotp)
				$("#disable-totp-button").off("click", this.#onDisableTotp)
				$("#edit-totp-form").trigger("reset");
				this.#clearValidation()
				console.log("Edit totp modal cleaned")
				super.clean()
		}

		#clearValidation = () => {
				$("#edit-totp-form").removeClass("was-validated")
				$("#edit-totp-form-totp").removeClass("is-valid is-invalid")
		}

		#onEnableTotp = async (e) => {
				e.preventDefault()
				this.#clearValidation()
				$("#edit-totp-form-totp").addClass("is-valid")
				this.modal.hide()
				$('#edit-totp-modal').one('hidden.bs.modal', () => {
						const modal = new QRcodeModal();
						modal.onHide = () => {
							console.log("qrcode modal hide");
						};
						modal.render().then((res) => {
								if (res === 0) {
										modal.applyRendered();
										modal.init();
										$('#qrcode-modal').one('hidden.bs.modal', () => {
											modal.clean();
										});
								}
						});
				});
		}

		#onDisableTotp = async (e) => {
				e.preventDefault()
				this.#clearValidation()
				if($("#edit-totp-form").get(0).checkValidity())
				{
						const url = window.location.origin + "/accounts/edit/totp-off/";
						try
						{
								const promise = await fetch(url, {
										method: "POST",
										headers: { "X-CSRFToken": Cookies.get("csrftoken") },
										mode: 'same-origin',
								});
								if (promise.ok) {
										$("#edit-totp-form-totp").addClass("is-valid")
										$('#edit-totp-modal').one('hidden.bs.modal', () => {
											location.reload();
										});
										this.modal.hide()
										return
								}
								if (promise.status != 400)
										throw promise

						} catch(error)
						{
								console.error('Error during totp update: ', error);
						}
						$("#edit-totp-form-totp").addClass("is-invalid")
				} else {
						$("#edit-totp-form").addClass("was-validated")
				}
		}
}
