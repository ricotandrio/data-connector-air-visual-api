function setApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('API_KEY', 'YOUR_API_KEY_AT_HERE');
  scriptProperties.setProperty('COUNTRY_NAME', 'Indonesia');
}

