import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
};

function formatTemp(value) {
  if (value === undefined || value === null) {
    return '--';
  }

  return `${Math.round(value)}°C`;
}

export default function App() {
  const [query, setQuery] = useState('New York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);

  const title = useMemo(() => {
    if (!weather) {
      return 'Search a city to load weather';
    }

    return `${weather.name}, ${weather.country}`;
  }, [weather]);

  const fetchWeather = async () => {
    if (!query.trim()) {
      setError('Please enter a city name.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`
      );
      const geoJson = await geoResponse.json();

      if (!geoJson?.results?.length) {
        setWeather(null);
        setError('City not found. Try another search.');
        return;
      }

      const city = geoJson.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
      );
      const weatherJson = await weatherResponse.json();

      setWeather({
        name: city.name,
        country: city.country,
        temperature: weatherJson?.current?.temperature_2m,
        apparentTemperature: weatherJson?.current?.apparent_temperature,
        humidity: weatherJson?.current?.relative_humidity_2m,
        windSpeed: weatherJson?.current?.wind_speed_10m,
        weatherCode: weatherJson?.current?.weather_code,
      });
    } catch (requestError) {
      setWeather(null);
      setError('Failed to fetch weather. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Weather App</Text>
        <Text style={styles.subHeader}>{title}</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Enter city (e.g. Seattle)"
            placeholderTextColor="#94a3b8"
            autoCapitalize="words"
            onSubmitEditing={fetchWeather}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.button} onPress={fetchWeather}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#38bdf8" style={styles.loader} />}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {weather && !loading && (
          <View style={styles.card}>
            <Text style={styles.temp}>{formatTemp(weather.temperature)}</Text>
            <Text style={styles.condition}>{weatherCodeMap[weather.weatherCode] || 'Unknown conditions'}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Feels like</Text>
                <Text style={styles.statValue}>{formatTemp(weather.apparentTemperature)}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Humidity</Text>
                <Text style={styles.statValue}>{weather.humidity ?? '--'}%</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Wind</Text>
                <Text style={styles.statValue}>{weather.windSpeed ?? '--'} km/h</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 36,
    gap: 14,
  },
  header: {
    color: '#e2e8f0',
    fontSize: 32,
    fontWeight: '700',
  },
  subHeader: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  loader: {
    marginTop: 12,
  },
  error: {
    color: '#fca5a5',
    marginTop: 8,
  },
  card: {
    marginTop: 10,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderColor: '#334155',
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  temp: {
    color: '#f8fafc',
    fontSize: 54,
    fontWeight: '700',
  },
  condition: {
    color: '#cbd5e1',
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
});
