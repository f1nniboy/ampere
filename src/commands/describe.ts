import { SlashCommandBuilder } from "discord.js";

import { Command, CommandInteraction, CommandResponse } from "../command/command.js";
import { Conversation } from "../conversation/conversation.js";
import { runDescribeAction } from "../util/describe.js";
import { DatabaseInfo } from "../db/managers/user.js";
import { Response } from "../command/response.js";
import { Bot } from "../bot/bot.js";

export default class ResetCommand extends Command {
    constructor(bot: Bot) {
        super(bot,
            new SlashCommandBuilder()
                .setName("describe")
                .setDescription("Describe an image using AI")
				.addAttachmentOption(builder => builder
					.setName("image")
					.setDescription("Which image to describe")
					.setRequired(true)
				)
		, {
			cooldown: {
                Free: 3 * 60 * 1000,
                Voter: 1.75 * 60 * 1000,
                GuildPremium: 50 * 1000,
                UserPremium: 25 * 1000
            }
		});
    }

    public async run(interaction: CommandInteraction, db: DatabaseInfo): CommandResponse {
		/* Get the user's conversation. */
		const conversation: Conversation = await this.bot.conversation.create(interaction.user);

		/* If the conversation is currently busy, don't reset it. */
		if (conversation.generating) return new Response()
			.addEmbed(builder => builder
				.setDescription("You have a request running in your conversation, *wait for it to finish* 😔")
				.setColor("Red")
			)
			.setEphemeral(true);

		await runDescribeAction(conversation, db, interaction);
    }
}