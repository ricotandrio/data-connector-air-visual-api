/**
 * https://developers.google.com/looker-studio/connector/build
 *
 * This line initializes a Community Connector object using the DataStudioApp service in Google Apps Script.
 */
const communityConnector = DataStudioApp.createCommunityConnector();

/**
 * This variable takes all environment values that have been set with custom function getEnv().
 */
const env = getEnv();

/**
 * https://developers.google.com/looker-studio/connector/semantics
 * 
 * This is the schema that we will use for our data later, based on Google Script documentation.
 * It recommends using semantic types for defining data. For more about these semantic types,
 * you can refer to the documentation.
 */
const Schema = [
  {
    name: 'error_msg',
    label: 'Status Error',
    dataType: 'STRING',
    semanticType: {
      conceptType: 'METRIC'
    }
  },
  { 
    name: 'city', 
    label: 'City', 
    dataType: 'STRING', 
    semanticType: { 
      conceptType: 'DIMENSION' 
    } 
  },
  { 
    name: 'state', 
    label: 'State', 
    dataType: 'STRING', 
    semanticType: { 
      conceptType: 'DIMENSION' 
    } 
  },
  { 
    name: 'country', 
    label: 'Country', 
    dataType: 'STRING', 
    semanticType: { 
      conceptType: 'DIMENSION' 
    } 
  },
  { 
    name: 'location_latitude', 
    label: 'Location Latitude', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC' 
    } 
  },
  { 
    name: 'location_longitude', 
    label: 'Location Longitude', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC' 
    } 
  },
  { 
    name: 'pollution_ts', 
    label: 'Pollution Timestamp', 
    dataType: 'DATE', 
    semanticType: { 
      conceptType: 'DIMENSION' 
    } 
  },
  { 
    name: 'pollution_aqius', 
    label: 'Pollution AQI (US)', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC' 
    } 
  },
  { 
    name: 'pollution_mainus', 
    label: 'Pollution Main (US)', 
    dataType: 'STRING', 
    semanticType: { 
      conceptType: 'DIMENSION' 
    } 
  },
  { 
    name: 'pollution_aqicn', 
    label: 'Pollution AQI (CN)', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC' 
    } 
  },
  { 
    name: 'pollution_maincn', 
    label: 'Pollution Main (CN)', 
    dataType: 'STRING', 
    semanticType: { 
      conceptType: 'DIMENSION' 
    } 
  },
  { 
    name: 'weather_ts', 
    label: 'Weather Timestamp', 
    dataType: 'STRING', 
    semanticType: { 
      conceptType: 'DIMENSION' 
    } 
  },
  { 
    name: 'weather_tp', 
    label: 'Weather Temperature', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC' 
    } 
  },
  { 
    name: 'weather_pr', 
    label: 'Weather Pressure', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC' 
    } 
  },
  { 
    name: 'weather_hu', 
    label: 'Weather Humidity', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC'
     }
  },
  { 
    name: 'weather_ws', label: 
    'Weather Wind Speed', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC' 
    } 
  },
  { 
    name: 'weather_wd', label: 
    'Weather Wind Direction', 
    dataType: 'NUMBER', 
    semanticType: { 
      conceptType: 'METRIC' 
    } 
  },
  { 
    name: 'weather_ic', 
    label: 'Weather Icon', 
    dataType: 'STRING', 
    semanticType: { 
      conceptType: 'DIMENSION' 
    } 
  }
];

/**
 * Nothing special about this variable, it's just a dictionary that I use to map
 * which city will be chosen when a user selects a state on the Looker dashboard.
 */
var cityStateByCountry = {
  "Aceh": "Banda Aceh",
  "Bali": "Denpasar",
  "Banten": "Serang",
  "Bengkulu": "Bengkulu",
  "Central Java": "Semarang",
  "Central Kalimantan": "Palangkaraya",
  "Central Sulawesi": "Kasiguncu",
  "East Java": "Surabaya",
  "East Kalimantan": "City of Balikpapan",
  "East Nusa Tenggara": "East Nusa Tenggara",
  "Jakarta": "Jakarta",
  "Jambi": "Jambi",
  "Lampung": "Bandar Lampung",
  "Maluku": "Ambon",
  "North Kalimantan": "Salinbatu",
  "North Sulawesi": "Manado",
  "Papua": "Jayapura",
  "Riau": "Pekanbaru",
  "Riau Islands": "Tanjung Pinang",
  "South Kalimantan": "Banjarmasin",
  "South Sulawesi": "Makassar",
  "South Sumatra": "Palembang",
  "Southeast Sulawesi": "Palu",
  "West Java": "Bandung",
  "West Kalimantan": "Pontianak",
  "West Nusa Tenggara": "Mataram",
  "West Papua": "Manokwari",
  "West Sulawesi": "Mamuju",
  "West Sumatra": "Padang",
  "Yogyakarta": "Yogyakarta"
}

/**
 * https://developers.google.com/looker-studio/connector/reference
 */
function getSchema(request) {
  return { schema: Schema };
}

/**
 * This custom function is used to get all environment variable values.
 */
function getEnv() {
  setApiKey();
  const scriptProperties = PropertiesService.getScriptProperties();
  const API_KEY = scriptProperties.getProperty('API_KEY');
  const COUNTRY_NAME = scriptProperties.getProperty('COUNTRY_NAME');

  if (!API_KEY || !COUNTRY_NAME) {
    throw new Error('API key or country name is not set. Please set these values using setApiKey function.');
  }

  return { API_KEY, COUNTRY_NAME };
}

/**
 * https://developers.google.com/looker-studio/connector/reference
 *
 * Returns the user configurable options for the connector.
 */
async function getConfig(request) {

  const config = communityConnector.getConfig();
  
  config.newInfo()
    .setId('instructions')
    .setText('Select the state and city:');

  var stateSelection = config.newSelectSingle()
    .setId('state')
    .setName('State')
    .setHelpText('Select state')
    .setAllowOverride(true);

  for (const [state, city] of Object.entries(cityStateByCountry)) {
    stateSelection.addOption(config.newOptionBuilder().setLabel(state).setValue(state));
  }

  return config.build();
}

/**
 * https://developers.google.com/looker-studio/connector/reference
 *
 * Returns the tabular data for the given request by fetching data from Air Visual API.
 */
async function getData (request) {
  const state = request.configParams.state;
  const city = cityStateByCountry[state];

  console.log(city);

  if(city === '') {
    return {
      schema: [{ name: 'error_msg', label: 'Error', dataType: 'STRING' }],
      rows: [{ values: ['city is not found for the given state'] }]
    }
  }
  
  const url = `http://api.airvisual.com/v2/city?city=${city}&state=${state}&country=${env.COUNTRY_NAME}&key=${env.API_KEY}`;

  const responseRaw = UrlFetchApp.fetch(url);
  const responseContent = responseRaw.getContentText();
  const responseJson = JSON.parse(responseContent);

  const dataSchema = [];
  
  var rows = [];
  request.fields.forEach(function (field) {
    for (var i = 0; i < Schema.length; i++) {
      if (Schema[i].name === field.name) {
        dataSchema.push(Schema[i]);
        break;
      }
    }
  });
  
  const data = [responseJson.data];

  console.log(dataSchema);
  
  var rows = [];
  data.forEach(function (item) {
    var row = [];
    request.fields.forEach(function (field) {
      switch (field.name) {
        case 'error_msg':
          row.push('success')
          break;
        case 'city':
          row.push(item.city);
          break;
        case 'state':
          row.push(item.state);
          break;
        case 'country':
          row.push(item.country);
          break;
        case 'location_latitude':
          row.push(item.location.coordinates[0]);
          break;
        case 'location_longitude':
          row.push(item.location.coordinates[1]);
          break;
        case 'pollution_ts':
          row.push(item.current.pollution.ts);
          break;
        case 'pollution_aqius':
          row.push(item.current.pollution.aqius);
          break;
        case 'pollution_mainus':
          row.push(item.current.pollution.mainus);
          break;
        case 'pollution_aqicn':
          row.push(item.current.pollution.aqicn);
          break;
        case 'pollution_maincn':
          row.push(item.current.pollution.maincn);
          break;
        case 'weather_ts':
          row.push(item.current.weather.ts);
          break;
        case 'weather_tp':
          row.push(item.current.weather.tp);
          break;
        case 'weather_pr':
          row.push(item.current.weather.pr);
          break;
        case 'weather_hu':
          row.push(item.current.weather.hu);
          break;
        case 'weather_ws':
          row.push(item.current.weather.ws);
          break;
        case 'weather_wd':
          row.push(item.current.weather.wd);
          break;
        case 'weather_ic':
          row.push(item.current.weather.ic);
          break;
        default:
          row.push('');
      }
    });
    rows.push({values: row});
  });

  console.log(rows);
  return {
    schema: dataSchema,
    rows: rows
  };
}

/**
 * https://developers.google.com/looker-studio/connector/reference
 *
 * Returns the connector's authentication method.
 */
const getAuthType = () => {
  return { type: 'NONE' };
}

/**
 * https://developers.google.com/looker-studio/connector/reference
 *
 * Returns the user configurable options for the connector.Checks if the user is an admin of the connector.
 */
const isAdminUser = () => {
  return true;
}

