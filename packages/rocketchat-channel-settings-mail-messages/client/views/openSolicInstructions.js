import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { RocketChat, handleError } from 'meteor/rocketchat:lib';
import { ChatRoom } from 'meteor/rocketchat:ui';
import { t, isEmail } from 'meteor/rocketchat:utils';
import toastr from 'toastr';
import resetSelection from '../resetSelection';

const filterNames = (old) => {
	const reg = new RegExp(`^${ RocketChat.settings.get('UTF8_Names_Validation') }$`);
	return [...old.replace(' ', '').toLocaleLowerCase()].filter((f) => reg.test(f)).join('');
};

Template.openSolicInstructions.helpers({
	name() {
		return Meteor.user().name;
	},
	email() {
		const { emails } = Meteor.user();
		return emails && emails[0] && emails[0].address;
	},
	roomName() {
		const room = ChatRoom.findOne(Session.get('openedRoom'));
		return room && RocketChat.roomTypes.getRoomName(room.t, room);
	},
	erroredEmails() {
		const instance = Template.instance();
		return instance && instance.erroredEmails.get().join(', ');
	},
	selectedProblema() {
		return Template.instance().selectedProblema.get();
	},
	selectedSolucao() {
		return Template.instance().selectedSolucao.get();
	},
	config() {
		const filter = Template.instance().userFilter;
		return {
			filter: filter.get(),
			noMatchTemplate: 'userSearchEmpty',
			modifier(text) {
				const f = filter.get();
				return `@${ f.length === 0 ? text : text.replace(new RegExp(filter.get()), function(part) {
					return `<strong>${ part }</strong>`;
				}) }`;
			},
		};
	},
	autocomplete(key) {
		const instance = Template.instance();
		const param = instance.ac[key];
		return typeof param === 'function' ? param.apply(instance.ac) : param;
	},
	items() {
		return Template.instance().ac.filteredList();
	},
	errorMessage() {
		return Template.instance().errorMessage.get();
	},
});

Template.openSolicInstructions.events({
	'click .js-cancel, click .mail-messages__instructions--selected'(e, t) {
		console.log('click .js-cancel');
		t.reset(true);
	},
	'click .js-cancel, click .mail-messages__instructionsSolucao--selected'(e, t) {
		console.log('click .js-cancel');
		t.reset(true);
	},
	'click .js-send'(e, instance) {
		const { selectedProblema, selectedSolucao, selectedRange } = instance;
		console.log(selectedRange);
		const subject = instance.$('[name="subject"]').val();
		if (!selectedProblema.get().length) {
			instance.errorMessage.set(t('Mail_Message_No_messages_selected_select_all'));
			return false;
		}
		if (!selectedSolucao.get().length) {
			instance.errorMessage.set(t('Mail_Message_No_messages_selected_select_all'));
			return false;
		}

		const data = {
			rid: Session.get('openedRoom'),
			userId: Meteor.user()._id,
			assunto:  subject,
			messagesProblema : selectedProblema.get(),
			messagesSolucao : selectedSolucao.get(),
			language: localStorage.getItem('userLanguage'),
		};

		Meteor.call('openSolic', data, function(err, result) {
			if (err != null) {
				return handleError(err);
			}
			toastr.success(t('Você sera redirecionado '));
			window.open("http://192.168.181.123:4200/#/solic/"+result,'_blank');

			//instance.reset(true);
		});
	},
	'click .rc-input--usernames .rc-tags__tag'({ target }, t) {
		const { username } = Blaze.getData(target);
		t.selectedUsers.set(t.selectedUsers.get().filter((user) => user.username !== username));
	},
	'click .rc-input--emails .rc-tags__tag'({ target }, t) {
		const { text } = Blaze.getData(target);
		t.selectedEmails.set(t.selectedEmails.get().filter((email) => email.text !== text));
	},
	'click .rc-popup-list__item'(e, t) {
		t.ac.onItemClick(this, e);
	},
	'input [name="users"]'(e, t) {
		const input = e.target;
		const position = input.selectionEnd || input.selectionStart;
		const { length } = input.value;
		const modified = filterNames(input.value);
		input.value = modified;
		document.activeElement === input && e && /input/i.test(e.type) && (input.selectionEnd = position + input.value.length - length);

		t.userFilter.set(modified);
	},
	'keydown [name="emails"]'(e, t) {
		const input = e.target;
		if ([9, 13, 188].includes(e.keyCode) && isEmail(input.value)) {
			e.preventDefault();
			const emails = t.selectedEmails;
			const emailsArr = emails.get();
			emailsArr.push({ text: input.value });
			input.value = '';
			return emails.set(emailsArr);
		}

		if ([8, 46].includes(e.keyCode) && input.value === '') {
			const emails = t.selectedEmails;
			const emailsArr = emails.get();
			emailsArr.pop();
			return emails.set(emailsArr);
		}
	},
	'keydown [name="users"]'(e, t) {
		if ([8, 46].includes(e.keyCode) && e.target.value === '') {
			const users = t.selectedUsers;
			const usersArr = users.get();
			usersArr.pop();
			return users.set(usersArr);
		}

		t.ac.onKeyDown(e);
	},
	'keyup [name="users"]'(e, t) {
		t.ac.onKeyUp(e);
	},
	'focus [name="users"]'(e, t) {
		t.ac.onFocus(e);
	},
	'blur [name="users"]'(e, t) {
		t.ac.onBlur(e);
	},
});

Template.openSolicInstructions.onRendered(function() {
	const { selectedProblema } = this;
	const { selectedSolucao } = this;

	$('.messages-box .message').on('dblclick', function() {
		console.log('duplo click');
		const { id } = this;
		const messagesProblema = selectedProblema.get();
		if ($(this)[0].style.background === 'green') {
			$(this)[0].style.background = 'white';
			selectedProblema.set(messagesProblema.filter((message) => message !== id));
		} else {
			$(this)[0].style.background = 'green';
			selectedProblema.set(messagesProblema.concat(id));
		}
	});

	$('.messages-box .message').on('click', function() {
		console.log('click');
		const { id } = this;
		const messages = selectedSolucao.get();
		if ($(this).hasClass('selected')) {
			selectedSolucao.set(messages.filter((message) => message !== id));
		} else {
			selectedSolucao.set(messages.concat(id));
		}
	});
});

Template.openSolicInstructions.onCreated(function() {
	console.log('create');
	resetSelection(true);

	this.selectedEmails = new ReactiveVar([]);
	this.selectedProblema = new ReactiveVar([]);
	this.selectedSolucao = new ReactiveVar([]);
	this.errorMessage = new ReactiveVar('');
	this.selectedUsers = new ReactiveVar([]);
	this.userFilter = new ReactiveVar('');




	this.reset = (bool) => {
		console.log('reset');
		this.selectedUsers.set([]);
		this.selectedEmails.set([]);
		this.selectedProblema.set([]);
		this.selectedSolucao.set([]);
		this.errorMessage.set('');
		resetSelection(bool);
	};
});

Template.openSolicInstructions.onDestroyed(function() {
	Template.instance().reset(false);
});
