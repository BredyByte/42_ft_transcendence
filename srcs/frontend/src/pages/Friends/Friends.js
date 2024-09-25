import { Component } from '../../scripts/Component.js';
import { Navbar } from '../../components/Navbar/Navbar.js';
import { languageSelector } from '../../components/LanguageSelector/languageSelector.js';
import { FriendsLoader } from './FriendsLoader.js';
import { FriendsRenderer } from './FriendsRenderer.js';
import { UISetup } from './UISetup.js';


export class Friends extends Component {
	constructor(params = {}) {
		super('/pages/Friends/friends.html', params)

		this.filter = this.params.filter || 'all';

		this.friendsRenderer = new FriendsRenderer(this);
        this.friendsLoader = new FriendsLoader(this);
        this.uiSetup = new UISetup(this);
	}

	destroy() {

		this.removeAllEventListeners();
		this.uiSetup.removeOnlineUpdateListeners();
		this.uiSetup.removeSearchFormEvents();
	}

	async init() {
		await Navbar.focus();
		await this.friendsLoader.loadFriendsData();
		this.uiSetup.setupSearchInputEvent();
		this.uiSetup.setupSearchForm();
		this.uiSetup.setupFilterButtons();
		this.uiSetup.setupFriendButtons();
		setTimeout(() => languageSelector.updateLanguage(), 0);
	}
}
