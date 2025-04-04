import axios from 'axios';
import { SimpleCommandOptionType } from 'discordx';

interface WeatherResponse {
    location: string;
    weather_status: {
      temp: string;
      condition: {
        text: string;
        img: string;
      };
    };
  }

export async function getWeatherNow(city: string): Promise<WeatherResponse> {
   
    const weatherApiKey = process.env.WEATHER_API_KEY

    //Fetch weather data
    const result : any = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
        params: {
        key: weatherApiKey,
        q: city
        }
    });

    //parse data
    return {
        location: `${result.data.location.name}, ${result.data.location.country}`,
        weather_status:{
            temp: `${result.data.current.temp_c}°C (${result.data.current.temp_f}°F)`,
            condition:{
            text: result.data.current.condition.text,
            img: result.data.current.condition.icon
            }
        }
    }


}