export class ChatRenderer {
    constructor(chatModal) {
        this.chatModal = chatModal;
    }

	renderChatElements(chats) {
        const container = document.getElementById('chat_element_container');

		if (container) {
			container.innerHTML = '';

			chats.forEach(chat => {
				const chatElement = this.createChatElement(chat);

				if (chatElement) {
					container.appendChild(chatElement);
				}
			});
		} else {
			console.warn("chat_element_container not found.")
		}
    }

	createChatElement(chat) {
		try {
			const chatHtml = `
				<div class="chat-element col-6 col-md-4 col-lg-2 d-flex flex-column align-items-center mb-4">
					<button class="open_chat_btn btn rounded-circle bg-dark d-flex justify-content-center align-items-center position-relative"
							style="width: 102px; height: 102px;"
							data-bs-target="#messages_modal"
							data-bs-toggle="modal"
							data-chatroom_name="${chat.chatroom_name}">
						<img src="${chat.other_user_avatar_url || '/assets/images/default_avatar.jpg'}"
							 style="width: 100px; height: 100px;"
							 class="rounded-circle"
							 alt="Circle Image">
						<div class="status-dot position-absolute translate-middle border border-3 border-dark ${chat.other_user_online_status ? 'green' : 'gray'}-dot p-2"
						data-online-username="${chat.other_user_username}"
						style="top:90%; left:85%;">
						</div>
					</button>
					<p class="text-light mt-2">${chat.other_user_username}</p>
				</div>
			`;

			const template = document.createElement('template');
			template.innerHTML = chatHtml.trim();

			return template.content.firstChild;
		} catch (error) {
			console.error('Error creating chat element:', error);
			return null;
		}
	}

	renderChatMessages(messages, currentUser, isPublicChat) {
		if (messages) {
			const container = document.getElementById('chat_messages');

			if (container) {
				container.innerHTML = '';

				messages.forEach(message => {
					this.addMessageElement(message, currentUser, isPublicChat);
				});

				this.chatModal.chatRenderer.scrollToBottom(200);
			} else {
				console.warn('chat_messages not found.')
			}
		}
	}

	addMessageElement(message, currentUser, isPublicChat) {
		const messageHtml = message.author.username === currentUser ?
			this.createCurrentUserMessageContent(message.body) :
			this.createOtherUserMessageContent(message, isPublicChat);

		const template = document.createElement('template');
		template.innerHTML = messageHtml.trim();
		const messageElement = template.content.firstChild;

		const chatMessages = document.getElementById('chat_messages');

		if (chatMessages) {
			chatMessages.appendChild(messageElement);
		} else {
			console.warn('chat_messages not found.')
		}
	}

	createCurrentUserMessageContent(body) {
		return `
		<li class="fade-in-up d-flex mb-2 justify-content-end">
			<div class="my-message text-break rounded-top-3 p-3" style="max-width: 75%;">
				<span>${body}</span>
			</div>
			<div class="d-flex align-items-end">
				<svg height="13" width="8">
					<path fill="#bbf7d0" d="M6.3,10.4C1.5,8.7,0.9,5.5,0,0.2L0,13l5.2,0C7,13,9.6,11.5,6.3,10.4z"/>
				</svg>
			</div>
		</li>
		`;
	}

	createOtherUserMessageContent(message, isPublicChat) {
		if (isPublicChat) {
			const userBtn = `
			<a class="btn p-0 position-relative" href="/profile/${message.author.username}" >
				<div class="status-dot position-absolute translate-middle border border-3 border-dark ${message.author.is_online ? 'green' : 'gray'}-dot" data-online-username="${message.author.username}" style="top:90%; left:90%;"></div>
				<img
					class="rounded-circle"
					style="width: 32px; height: 32px;"
					src="${message.author.avatar || '/assets/images/default_avatar.jpg'}"
				>
			</a>`;
			return `
			<li class="fade-in-up d-flex mb-2 flex-column justify-start">
				<div class="d-flex align-items-end">
					<div class="me-2">
						${userBtn}
					</div>
					<div class="d-flex align-items-end">
						<svg height="13" width="8">
							<path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z"></path>
						</svg>
					</div>
					<div class="other-message text-break bg-white rounded-top-3 p-3" style="max-width: 75%;">
						<span>${message.body}</span>
					</div>
				</div>
				<div class="text-muted small py-1 mt-2">
					<span class="text-white">${message.author.username}</span>
				</div>
			</li>
			`;
		} else {
			return `
			<li class="fade-in-up d-flex mb-2 flex-column justify-start">
				<div class="d-flex align-items-end">
					<svg height="13" width="8">
						<path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z"></path>
					</svg>
					<div class="other-message bg-white rounded-top-3 p-3" style="max-width: 75%;">
						<span>${message.body}</span>
					</div>
				</div>
			</li>
			`;
		}
	}

	renderChatHeader(isPublicChat, data) {
		const container = document.getElementById('chat_header_content');

		if (container) {
			container.innerHTML = '';

			const headerHtml = isPublicChat ?
				this.createPublicChatHeaderContent() :
				this.createPrivateChatHeaderContent(data);

			const template = document.createElement('template');
			template.innerHTML = headerHtml.trim();
			const headerElement = template.content.firstChild;

			container.appendChild(headerElement);
		} else {
			console.warn('chat_header_content not found.');
		}
	}

	createPublicChatHeaderContent() {
		return `
		<div class="d-flex align-items-center">
			<span class="pr-1 position-absolute top-50 start-50" style="transform: translate(-50%, -50%); color: #34d399">Public chat</span>
		</div>
		`;
	}

	createPrivateChatHeaderContent(data) {
		const blockStatus = data.block_status;
		const isBlocker = blockStatus === "blocker";
		const action = isBlocker ? 'unblock' : 'block';
		const buttonText = isBlocker ? 'Unblock' : 'Block';

		return `
		<div class="d-flex align-items-center">
			<div class="d-flex align-items-end me-2 dropup">
				<button
					type="button"
					class="btn p-0"
					data-bs-toggle="dropdown"
				>
					<div class="status-dot position-absolute translate-middle border border-3 border-dark ${data.other_user.is_online ? 'green' : 'gray'}-dot" data-online-username="${data.other_user.username}" style="top:90%; left:90%;"></div>
					<img
						class="rounded-circle"
						src="${data.other_user.avatar || '/assets/images/default_avatar.jpg'}"
						style="width: 42px; height: 42px;"
					>
				</button>
				<ul class="dropdown-menu dropdown-menu-dark">
					<li><a href="/profile/${data.other_user.username}" class="dropdown-item">Profile</a></li>
					<li><hr class="dropdown-divider"></li>
					<li><a class="dropdown-item" href="#">Invite to Play</a></li>
					<li>
						<button class="dropdown-item block-unblock-btn"
							data-block-action="${action}"
							data-block-username="${data.other_user.username}">
							${buttonText}
						</button>
                	</li>
				</ul>
			</div>
			<span class="text-light">${data.other_user.username}</span>
		</div>
		`;
	}

	renderMessageInputContainer(blockStatus, otherUser) {
        const messageInputContainer = document.getElementById('message_input_container');
        if (messageInputContainer) {
            this.removeBlockStatusMessage();

            const blockMessage = this.createInputBlockMessage(blockStatus, otherUser);

            if (blockMessage) {
                messageInputContainer.insertAdjacentHTML('afterbegin', blockMessage);
                this.toggleInputState(true);
            } else {
                this.toggleInputState(false);
            }
        }
    }

	createInputBlockMessage(blockStatus, username) {
		if (blockStatus === "blocker") {
			 return `
			 	<div class="text-light block-status-message mb-2">
					You have blocked this user.
					<a id="unblock_btn" class="unblock-btn" data-block-action="unblock" data-block-username="${username}">Unblock</a>.
				</div>
			`;
		} else if (blockStatus === "blocked") {
			return `
				<div class="text-light block-status-message mb-2">
					You are blocked by this user.
				</div>`;
		}
		else {
			return null;
		}
	}

	removeBlockStatusMessage() {
		const messageInputContainer = document.getElementById('message_input_container');
		if (messageInputContainer) {
			const blockStatusMessage = messageInputContainer.querySelector('.block-status-message');
			if (blockStatusMessage) {
				blockStatusMessage.remove();
			}
		}
	}

	toggleInputState(disable) {
		const chatMessageInput = document.getElementById('chat_message_input');
		const chatMessageSubmit = document.getElementById('chat_message_submit');

		if (chatMessageInput && chatMessageSubmit) {
			chatMessageInput.disabled = disable;
			chatMessageSubmit.disabled = disable;
		}
	}

    scrollToBottom(time=0) {
        setTimeout(() => {
            const container = document.getElementById("chat_messages_container");
            if (container) {
                container.scrollTop = container.scrollHeight;
            } else {
				console.warn('chat_messages_container not found.')
			}
        }, time);
    }
}
