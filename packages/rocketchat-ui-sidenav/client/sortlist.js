import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { popover } from 'meteor/rocketchat:ui-utils';
import { getUserPreference } from 'meteor/rocketchat:utils';
import { settings } from 'meteor/rocketchat:settings';

const checked = function(prop, field) {
	const userId = Meteor.userId();
	if (prop === 'sidebarShowFavorites') {
		return getUserPreference(userId, 'sidebarShowFavorites');
	}
	//	TODO Maxicon
	if (prop === 'sidebarGroupByRole') {
		return RocketChat.getUserPreference(userId, 'sidebarGroupByRole');
	}
	if (prop === 'sidebarGroupByType') {
		return getUserPreference(userId, 'sidebarGroupByType');
	}
	if (prop === 'sidebarShowUnread') {
		return getUserPreference(userId, 'sidebarShowUnread');
	}
	if (prop === 'sidebarSortby') {
		return (getUserPreference(userId, 'sidebarSortby') || 'alphabetical') === field;
	}
};

Template.sortlist.helpers({
	favorite() {
		return settings.get('Favorite_Rooms');
	},
	checked,
	bold(...props) {
		return checked(...props) ? 'rc-popover__item--bold' : '';
	},
});

Template.sortlist.events({
	'change input'({ currentTarget }) {
		console.log('change input');
		const name = currentTarget.getAttribute('name');
		let value = currentTarget.getAttribute('type') === 'checkbox' ? currentTarget.checked : currentTarget.value;

		// TODO change mergeChannels to GroupByType
		if (name === 'mergeChannels') {
			value = !value;
		}
		Meteor.call('saveUserPreferences', {
			[name] : value,
		});
		// TODO Maxicon
		if (name !== 'sidebarGroupByRole' && value) {
			Meteor.call('saveUserPreferences', {
				sidebarGroupByRole : false,
			});
		}
		if (name === 'sidebarGroupByRole' && value) {
			Meteor.call('saveUserPreferences', {
				sidebarGroupByType : false,
				sidebarShowFavorites: false,
				sidebarShowUnread: false,
			});
		}
		popover.close();
	},
});
