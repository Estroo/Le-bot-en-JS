import { GuildChannel, VoiceChannel } from 'discord.js'

export default (client, oldChannel, newChannel) => {
	// Si le channel n'est pas un channel de guild, return
	if (!(oldChannel instanceof GuildChannel) || !(newChannel instanceof GuildChannel)) return

	// Si le channel n'est pas un channel vocal, return
	if (!(oldChannel instanceof VoiceChannel) || !(newChannel instanceof VoiceChannel)) return

	// Si son nom n'a pas changé, return
	if (oldChannel.name === newChannel.name) return

	const { id: voiceChannelID, name: voiceChannelName } = newChannel

	// Acquisition du channel no mic, et return s'il n'y en a pas
	const noMicChannel = client.voiceManager.get(voiceChannelID)
	if (!noMicChannel) return

	// Rename du channel avec no mic + le nouveau nom du vocal
	return noMicChannel.edit({ name: `no mic ${voiceChannelName}` })
}
