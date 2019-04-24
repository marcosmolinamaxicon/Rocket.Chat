import { Template } from 'meteor/templating';
import { TabBar, fireGlobalEvent } from '../../../../ui-utils';

Template.header.helpers({
	back() {
		return Template.instance().data.back;
	},
	buttons() {
		return TabBar.getButtons();
	},
});

Template.header.events({
	'click .iframe-toolbar .js-iframe-action'(e) {
		fireGlobalEvent('click-toolbar-button', { id: this.id });
		e.currentTarget.querySelector('button').blur();
		return false;
	},
	//TODO Naxicon 
	'click .rc-header__alterCss'() {
		Meteor.call('saveUserPreferences', {
			viewCssSkype : !Meteor.user().settings.preferences.viewCssSkype,
		});
		location.reload();
	},
});
