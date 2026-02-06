import {GuildChannelManager} from "./GuildChannelManager";
import {ForumChannelManager} from "./ForumChannelManager";
import {NewsChannelManager} from "./NewsChannelManager";
import {StageChannelManager} from "./StageChannelManager";
import {GuildTextChannelManager} from "./GuildTextChannelManager";
import {ThreadChannelManager} from "./ThreadChannelManager";
import {GuildVoiceChannelManager} from "./GuildVoiceChannelManager";

export class GuildChannelList {
    public static readonly forum= ForumChannelManager;
    public static readonly any= GuildChannelManager;
    public static readonly news= NewsChannelManager;
    public static readonly stage= StageChannelManager;
    public static readonly text= GuildTextChannelManager;
    public static readonly thread= ThreadChannelManager;
    public static readonly voice= GuildVoiceChannelManager;
}