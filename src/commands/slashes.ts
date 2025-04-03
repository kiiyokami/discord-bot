import { 
  ApplicationCommandOptionType,
  EmbedBuilder,
  type CommandInteraction
} from "discord.js";
import { 
  Discord, 
  Slash, 
  SlashOption,
} from "discordx";
import axios from 'axios';

@Discord()
export class Weather {
  private static readonly COOLDOWN = 5000; // 5 seconds cooldown
  private lastUsed: Map<string, number> = new Map();

  @Slash({ description: "Check the weather in a city", name: 'weather-city' })
  async min(
    @SlashOption({
      description: "City name to check weather",
      name: "input",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    input: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    try {
      // Check cooldown
      const userId = interaction.user.id;
      const now = Date.now();
      const lastUse = this.lastUsed.get(userId) ?? 0;
      
      if (now - lastUse < Weather.COOLDOWN) {
        await interaction.reply({
          content: `Please wait ${Math.ceil((Weather.COOLDOWN - (now - lastUse)) / 1000)} seconds before using this command again.`,
          ephemeral: true
        });
        return;
      }

      // Update last used timestamp
      this.lastUsed.set(userId, now);

      //Fetch weather data
      const result : any = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
        params: {
          key: process.env.WEATHER_API_KEY,
          q: input
        }
      });

      if (result == '') {
        throw new Error('Please enter a valid city.');
      }

      const parsed_data = {
        location: `${result.data.location.name}, ${result.data.location.country}`,
        weather_status:{
          temp: `${result.data.current.temp_c}°C (${result.data.current.temp_f}°F)`,
          condition:{
            text: result.data.current.condition.text,
            img: result.data.current.condition.icon
          }
        }
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Weather for ${parsed_data.location}`)
        .setDescription(`
          ${parsed_data.weather_status.temp} - ${parsed_data.weather_status.condition.text}`)
        .setImage(`https:${parsed_data.weather_status.condition.img}`)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription('Error occured. Please enter a valid city or try again.')
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });
      await interaction.reply({embeds: [embed]});
    }
  }
}
