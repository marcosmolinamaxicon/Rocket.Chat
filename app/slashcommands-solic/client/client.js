//  TODO Maxicon
import { Meteor } from 'meteor/meteor';
import { slashCommands } from '../../utils';

function Solic(command, params, item) {
	console.log('solic', command);
	console.log('params', params);
	if (command === 'solic') {
		const url = `https://sds.maxiconsystems.com.br/pls/maxicon/show_solic_v2?i_nr_solicitacao=${ params }`;
		const msg = item;
		msg.msg = `${ url }`;
		Meteor.call('sendMessage', msg);
	}
}

slashCommands.add('solic', Solic, {
	description: 'Abrir solicitação',
	params: 'room_name',
	clientOnly: true,
});
