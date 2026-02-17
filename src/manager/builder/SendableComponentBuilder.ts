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

/** @internal */
export class SendableComponentBuilder {

    static isSendableComponent(thing: any): boolean {
        return thing instanceof EmbedBuilder || thing instanceof ActionRowBuilder;
    }

    private static build<T extends MessageFields>(
        base: T,
        content?: string | null,
        components?: SendableComponent | SendableComponent[] | null | undefined
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

    static buildInteraction(content: string | null, component: SendableComponent, ephemeral: boolean): InteractionReplyOptions | InteractionUpdateOptions {
        let base: InteractionReplyOptions | InteractionUpdateOptions = {}

        this.build(base, content, component);

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
        if (typeof contentOrComponent !== 'string' && !component) {
            return this.build(base, null, contentOrComponent);
        }

        // Case 3
        if (typeof contentOrComponent == 'string' && component) {
            return this.build(base, contentOrComponent, component);
        }

        throw new Error("At least content or component need to be defined to build a message");
    }

}