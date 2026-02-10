import {
    ActionRowBuilder,
    EmbedBuilder,
    InteractionReplyOptions,
    InteractionUpdateOptions, MessageCreateOptions,
    MessageFlags,
    MessageActionRowComponentBuilder
} from "discord.js";

//Any interface/type with those fields
type MessageFields = {
    content?: string | null | undefined;
    embeds?: any;
    components?: any;
};

export type SendableComponent = EmbedBuilder | ActionRowBuilder<MessageActionRowComponentBuilder>;

export class SendableComponentBuilder {

    private static build<T extends MessageFields>(
        base: T,
        content?: string,
        components?: SendableComponent | SendableComponent[]
    ): T {
        if (content) {
            base.content = content;
        }

        const comps = Array.isArray(components) ? components : [components].filter(Boolean);

        for (const comp of comps) {
            if (comp instanceof EmbedBuilder) {
                base.embeds = base.embeds || [];
                base.embeds!.push(comp);
            }
            if (comp instanceof ActionRowBuilder) {
                base.components = base.components || [];
                base.components!.push(comp);
            }
        }

        return base
    }

    static buildInteraction (content: string): InteractionReplyOptions | InteractionUpdateOptions;
    static buildInteraction (component: SendableComponent | SendableComponent[]): InteractionReplyOptions | InteractionUpdateOptions;
    static buildInteraction (content?: string | null, component?: SendableComponent | SendableComponent[] | null, ephemeral?: boolean): InteractionReplyOptions | InteractionUpdateOptions;

    static buildInteraction(
        contentOrComponent?: string | null | SendableComponent | SendableComponent[],
        component?: SendableComponent | SendableComponent[] | null,
        ephemeral: boolean = false
    ): InteractionReplyOptions | InteractionUpdateOptions {
        let base: InteractionReplyOptions | InteractionUpdateOptions = {}

        // Case 1
        if (typeof contentOrComponent === 'string' && component === undefined) {
            base = this.build(base, contentOrComponent);
        }

        // Case 2
        if (typeof contentOrComponent == "string" && component) {
            base = this.build(base, contentOrComponent, component);
        }

        // Cas 3: content and component not null
        if (contentOrComponent && typeof contentOrComponent === 'string' && component) {
            base = this.build(base, contentOrComponent, component)
        }

        if (ephemeral) {
            base.flags = [MessageFlags.Ephemeral]
        }

        return base;
    }


    static buildMessage(content: string): MessageCreateOptions;
    static buildMessage(component: SendableComponent | SendableComponent[]): MessageCreateOptions;
    static buildMessage(content: string, component: SendableComponent | SendableComponent[]): MessageCreateOptions;

    static buildMessage(
        contentOrComponent?: string | null | SendableComponent | SendableComponent[],
        component?: SendableComponent | SendableComponent[],
    ): MessageCreateOptions {
        let base: MessageCreateOptions = {}

        // Case 1
        if (typeof contentOrComponent === 'string' && !component) {
            return this.build(base, contentOrComponent)
        }

        // Case 2
        if (typeof contentOrComponent == "string" && component) {
            return this.build(base, contentOrComponent, component);
        }

        // Cas 3: content and component not null
        if (contentOrComponent && typeof contentOrComponent === 'string' && component) {
            return this.build(base, contentOrComponent, component)
        }

        throw new Error("At least content or component need to be defined to build a message");
    }

}