import { Component } from '../../scripts/Component.js';
import { navigateTo } from '../../scripts/Router.js';
import { getCSRFToken } from '../../scripts/utils/csrf.js';
import customAlert from '../../scripts/utils/customAlert.js';
import { onlineSocket } from '../../scripts/utils/OnlineWebsocket.js';
import { staticComponentsRenderer } from '../../scripts/utils/StaticComponentsRenderer.js';


export class Login extends Component {
	constructor() {
		console.log('Login Constructor');
		super('/pages/Login/login.html');
	}

	async init() {
		this.initLoginForm();
		this.intraLogin();
	}

	destroy() {
		console.log("Login Custom destroy");
		this.removeAllEventListeners();
	}

	async initLoginForm() {
		const loginForm = document.getElementById('login_form');
		this.addEventListener(loginForm, 'submit', async function (event) {
			event.preventDefault();
			let formIsValid = true;

			// Validate the form
			if (!this.checkValidity()) {
				formIsValid = false;
			}

			if (formIsValid) {
				const formData = new FormData(event.target);
				const jsonData = {};

				formData.forEach((value, key) => {
					jsonData[key] = value;
				});

				const csrftoken = getCSRFToken('csrftoken');

				try {
					const response = await fetch("/api/login/", {
						method: "POST",
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
							'X-CSRFToken': csrftoken
						},
						body: JSON.stringify(jsonData)
					});

					if (!response.ok) {
						const errData = await response.json();
						throw new Error(errData.error || `Response status: ${response.status}`);
					}

					const data = await response.json();

					if (data.has_2fa === true) {
						const TwoFactorCodeModalInstance = staticComponentsRenderer.getComponentInstance('Get2faCode');
						await TwoFactorCodeModalInstance.initTwoFactorAuth(jsonData);
					}

					onlineSocket.initWebSocket(jsonData["username"]);
					customAlert('success', 'Login successful', 3000);
					navigateTo("/play");

				} catch (error) {
					customAlert('danger', `Error: ${error.message}`, '');
					console.log(error);
				}
			}

			this.classList.add('was-validated');
		});
	}


	intraLogin() {
		const intraLogin = document.getElementById('intra_login');

		this.addEventListener(intraLogin, 'click', () => {
			window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-781a91f2e625f3dc4397483cfabd527da78d78a6d43f5be15bfac2ea1d8fe8c6&redirect_uri=https%3A%2F%2Flocalhost%3A8080%2Fauth&response_type=code";
		})
	}
}
