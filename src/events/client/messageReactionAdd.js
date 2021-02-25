const { convertDate } = require('../../util/util')

module.exports = async (client, messageReaction, user) => {
	const { message, emoji } = messageReaction

	if (message.partial) await message.fetch()
	if (messageReaction.partial) await messageReaction.fetch()

	if (
		user.bot ||
		!message.guild ||
		!message.guild.available ||
		message.guild.id !== client.config.guildID
	)
		return

	// Partie système de réaction/role
	if (client.reactionRoleMap.has(message.id)) {
		const emojiRoleMap = client.reactionRoleMap.get(message.id)
		const roleID = emojiRoleMap[emoji.id || emoji.name]
		const guildMember = await message.guild.members.fetch(user)

		return guildMember.roles.add(roleID)
	}

	switch (emoji.name) {
		// Si c'est un signalement (report)
		case '🚨': {
			if (message.author.bot || !message.guild) return

			// On ne peut pas report un message posté pour soit-même
			if (message.author === user) return messageReaction.users.remove(user)

			const reportChannel = message.guild.channels.cache.get(client.config.reportChannelID)
			if (!reportChannel) return

			const fetchedMessages = await reportChannel.messages.fetch()

			// Recherche si un report a déjà été posté
			const logReport = fetchedMessages
				.filter(msg => msg.embeds)
				.find(msg => msg.embeds[0].fields.find(field => field.value.includes(message.id)))

			// Si un report a déjà été posté
			if (logReport) {
				const logReportEmbed = logReport.embeds[0]

				// On return si l'utilisateur a déjà report ce message
				if (logReportEmbed.fields.some(field => field.value.includes(user.id))) return

				const editLogReport = {
					author: logReportEmbed.author,
					description: logReportEmbed.description,
					fields: [logReportEmbed.fields],
					footer: logReportEmbed.footer,
				}

				// On ajoute un field en fonction
				// du nombre de report qu'il y a déjà
				switch (logReportEmbed.fields.length - 3) {
					case 1:
						editLogReport.color = 'ff8200'
						editLogReport.fields.push({
							name: '2nd signalement',
							value: `Signalement de ${user} le ${convertDate(new Date())}`,
							inline: false,
						})
						break
					case 2:
						editLogReport.color = 'ff6600'
						editLogReport.fields.push({
							name: '3ème signalement',
							value: `Signalement de ${user} le ${convertDate(new Date())}`,
							inline: false,
						})
						break
					case 3:
						editLogReport.color = 'ff3200'
						editLogReport.fields.push({
							name: '4ème signalement',
							value: `Signalement de ${user} le ${convertDate(new Date())}`,
							inline: false,
						})
						client.cache.deleteMessagesID.add(messageReaction.message.id)
						messageReaction.message.delete()
						break
					default:
						break
				}

				// Edit de l'embed
				return logReport.edit({ embed: editLogReport })
			}

			// Si il n'a pas de report déjà posté
			const sendLogReport = {
				author: {
					name: 'Nouveau signalement',
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				description: `**Contenu du message**\n${message.content}`,
				fields: [
					{
						name: 'Auteur',
						value: message.author,
						inline: true,
					},
					{
						name: 'Channel',
						value: message.channel,
						inline: true,
					},
					{
						name: 'Message',
						value: `[Posté le ${convertDate(message.createdAt)}](${message.url})`,
						inline: true,
					},
				],
			}

			switch (messageReaction.count) {
				case 1:
					sendLogReport.color = 'ffae00'
					sendLogReport.fields.push({
						name: '1er signalement',
						value: `Signalement de ${user} le ${convertDate(new Date())}`,
						inline: false,
					})
					break
				case 2:
					sendLogReport.color = 'ff8200'
					sendLogReport.fields.push(
						{
							name: '1er signalement',
							value: '?',
							inline: false,
						},
						{
							name: '2nd signalement',
							value: `Signalement de ${user} le ${convertDate(new Date())}`,
							inline: false,
						},
					)
					break
				case 3:
					sendLogReport.color = 'ff6600'
					sendLogReport.fields.push(
						{
							name: '1er signalement',
							value: '?',
							inline: false,
						},
						{
							name: '2nd signalement',
							value: '?',
							inline: false,
						},
						{
							name: '3ème signalement',
							value: `Signalement de ${user} le ${convertDate(new Date())}`,
							inline: false,
						},
					)
					break
				case 4:
					sendLogReport.color = 'ff3200'
					sendLogReport.fields.push(
						{
							name: '1er signalement',
							value: '?',
							inline: false,
						},
						{
							name: '2nd signalement',
							value: '?',
							inline: false,
						},
						{
							name: '3ème signalement',
							value: '?',
							inline: false,
						},
						{
							name: '4ème signalement',
							value: `Signalement de ${user} le ${convertDate(new Date())}`,
							inline: false,
						},
					)
					client.cache.deleteMessagesID.add(messageReaction.message.id)
					messageReaction.message.delete()
					break
				default:
					break
			}

			// Envoie de l'embed
			return reportChannel.send({ embed: sendLogReport })
		}

		default:
			break
	}
}
