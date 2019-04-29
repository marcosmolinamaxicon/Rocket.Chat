//  TODO Maxicon
import { Meteor } from 'meteor/meteor';
import { slashCommands } from '../../utils';

function Solic(command, params /* , item*/) {
	console.log('solic', command);
	if (command === 'solic') {
		const msg = {};

		msg.msg = params + '['+item+']'+'(https://sds.maxiconsystems.com.br/pls/maxicon/show_solic_v2?i_nr_solicitacao='+item+')';
		console.log('solic', msg);
		Meteor.call('sendMessage', msg);
	}
}

slashCommands.add('solic', Solic, {
	description: 'Abrir solicitação',
	params: 'room_name',
	clientOnly: true,
});
