/* eslint-disable no-await-in-loop */
// import reactionRoleConfig from '../../../config/reactionRoleConfig.json'
import { readFileSync } from 'fs'
const reactionRoleConfig = JSON.parse(readFileSync('./config/reactionRoleConfig.json'))

export default async client => {
	console.log('The client is ready to start working')

	// Lecture et en place du système de réactions
	// puis ajout des émojis (peut prendre du temps)
	client.reactionRoleMap = new Map()

	// Pour chaque channel
	for (const { channelID, messageArray } of reactionRoleConfig) {
		// Fetch du channel
		const channel = await client.channels.fetch(channelID)
		// Pour chaque message/réactions
		for (const { messageID, emojiRoleMap } of messageArray) {
			// Ajout dans la map pour être utilisé dans les events
			client.reactionRoleMap.set(messageID, emojiRoleMap)
			// Fetch du message
			const message = await channel.messages.fetch(messageID)
			// Ajout des émojis sur le message
			for (const emoji of Object.keys(emojiRoleMap)) await message.react(emoji)
		}
	}

	console.log('Startup finished !')
}
