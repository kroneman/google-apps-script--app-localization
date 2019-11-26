/**
 * This file gets run in the context of google apps script
 * LanguageApp and ContentService among others are globals in that context
 */

/**
 * Using get requests to translate
 */
declare let global: any 
global.doGet = (e: any) => {
  const { parameters } = e;
  const input = parameters.text;
  const output = LanguageApp.translate(input, 'en', 'id');
  const json = JSON.stringify({
    input,
    output
  })
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
};

// since doGet is run on a request permissions should be tested via this function in the online editor
global.testPermissions = () => {
  const output = LanguageApp.translate('hello world', 'en', 'id');
  const json = JSON.stringify({
    text: output
  });
  const jsonString = ContentService.createTextOutput(json)
          .setMimeType(ContentService.MimeType.JSON);
  return jsonString;
}