const fs = require('fs')

module.exports = {
	events: client => {
		const eventsDir = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'))
		eventsDir.forEach(eventFile => {
			const event = require(`../events/${eventFile}`)
			const eventName = eventFile.split('.')[0]
			client.on(eventName, event.bind(null, client))
		})
	},

	commands: client => {
		const commandsDir = fs.readdirSync('./src/commands')
		commandsDir.forEach(commandCategory => {
			const commands = fs
				.readdirSync(`./src/commands/${commandCategory}`)
				.filter(file => file.endsWith('.js'))
			commands.forEach(commandFile => {
				const command = require(`../commands/${commandCategory}/${commandFile}`)
				if (command.isEnabled) client.commands.set(command.name, command)
			})
		})
	},
}