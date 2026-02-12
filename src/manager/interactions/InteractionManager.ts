import {
    BaseInteraction,
    InteractionReplyOptions, InteractionResponse,
    InteractionUpdateOptions, Message,
} from "discord.js";

import {SendableComponent, SendableComponentBuilder} from "../builder/SendableComponentBuilder";

export class InteractionManager {

    /**
     * InteractionReplyOptions && InteractionUpdateOptions
     * The two have "content", "embeds" & "flags" field, so an internal cast is ok, unless discord/discordjs deprecate it
     */
    private static buildReplyOptions(content: string, component: SendableComponent, ephemeral: boolean): InteractionReplyOptions {
        return this._buildOptions(content, component, ephemeral) as InteractionReplyOptions;
    }

    private static buildUpdateOptions(content: string, component: SendableComponent): InteractionUpdateOptions {
        return this._buildOptions(content, component, false) as InteractionUpdateOptions;
    }

    private static _buildOptions(content: string, component: SendableComponent, ephemeral: boolean): InteractionReplyOptions | InteractionUpdateOptions {
        return SendableComponentBuilder.buildInteraction(content, component, ephemeral);
    }

    static async send(
        interaction: BaseInteraction,
        content: string,
        component: SendableComponent,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        if (!interaction.isRepliable()) return false;

        const options = this.buildReplyOptions(content, component, ephemeral);

        if (!interaction.deferred && !interaction.replied) {
            return await interaction.reply(options);
        } else {
            return await interaction.followUp(options);
        }
    }


    static async reply(
        interaction: BaseInteraction,
        content: string,
        component: SendableComponent,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        return await this.send(interaction, content, component, ephemeral);
    }

    static async followUp(
        interaction: BaseInteraction,
        content: string,
        component: SendableComponent,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        return await this.send(interaction, content, component, ephemeral)
    }

    static async defer(interaction: BaseInteraction): Promise<void> {
        if (!interaction.isRepliable()) return;

        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply();
            }
            return;
        }

        if (
            interaction.isButton() ||
            interaction.isAnySelectMenu() ||
            interaction.isModalSubmit()
        ) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }
        }
    }

    static async update(
        interaction: BaseInteraction,
        content: string,
        component: SendableComponent,
    ): Promise<void> {
        if (!interaction.isRepliable()) return;

        const options = this.buildUpdateOptions(content, component)

        // MessageComponent → update()
        if (interaction.isMessageComponent()) {
            await interaction.update(options);
            return;
        }

        // Slash commands → editReply()
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(options);
        }
    }
}