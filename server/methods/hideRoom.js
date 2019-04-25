import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RocketChat } from 'meteor/rocketchat:lib';

Meteor.methods({
	//	TODO maxicon
	hideRooms(rids) {
		for (let i = 0; i < rids.length; i++) {
			check(rids[i], String);

			if (!Meteor.userId()) {
				throw new Meteor.Error('error-invalid-user', 'Invalid user', {
					method: 'hideRoom',
				});
			}
			RocketChat.models.Subscriptions.hideByRoomIdAndUserId(rids[i], Meteor.userId());

		}
		return;
	},
	hideRoom(rid) {
		check(rid, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'hideRoom',
			});
		}

		return RocketChat.models.Subscriptions.hideByRoomIdAndUserId(rid, Meteor.userId());
	},
});
