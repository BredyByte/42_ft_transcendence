import { Component } from '../../scripts/Component.js';

class Friends extends Component {
	constructor() {
		console.log('Friends Constructor');
		super('/pages/Friends/friends.html')
	}

	init() {
		this.focusPage();
	}

	focusPage() {
		let navItems = document.querySelectorAll('[id^="navItem"]');
		navItems.forEach(navItem => {
			navItem.style.border = "";
		});
		document.getElementById("navItemFriends").style.border = "2px solid #edeef0";
	}
}

let friendsInstance = null;

export function getFriendsInstance(params) {
	if (!friendsInstance) {
		friendsInstance = new Friends(params);
	}
	return friendsInstance;
}
