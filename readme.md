# Google Apps script - app localization

One of the standards i've come across in app development is i18n localization files for react and vue.

- [vue-i18n](https://kazupon.github.io/vue-i18n/)
- [react-i18n-and-i18next](https://react.i18next.com/)

While these work great and they have their own tools for collaboration, sometimes its nice to just use google drive (with some of their services)

*The goal is to take a i18n json file usable by react or vue and translate it via google translation api.*

- where the solution could also partially be applied to xml files or other data storage formats

## 1. Google translation Api

Now translate.google.com is great, it doesn't have a json api though, at least i've spent a considerable time searching (couple days) and couldn't find one.

If you throw json or xml in there, you get ... interesting results. Not to mention the keys in the object or your xml tags get translated too.

However:

- Google Apps Script has a Language App [https://developers.google.com/apps-script/reference/language/language-app](https://developers.google.com/apps-script/reference/language/language-app).
- It has a way to create a json api [https://developers.google.com/apps-script/guides/web](https://developers.google.com/apps-script/guides/web).

When combining the two above one can create a rudimentary api for translating keywords.
Further using a couple tools we can manage the code in a git repository.


- `webpack` & `webpack-cli` as a build tool
- `clasp` for managing your app scripts from localhost
- `@types/google-apps-script` for autocompletion in vscode

For setup and code see the [./google-script](./google-script) directory and documentation

If you're interested in other ideas with google apps script check out:
- the github topic https://github.com/topics/google-apps-script
- the documentation https://developers.google.com/apps-script/

## 2. After completing step 1 we have an endpoint

  - 2.1 You'll notice a [./env.sample](./env.sample) file in the root.

Like the clasp configuration in part one. Copy and Rename it to `.env` in the same directory.

  - 2.2 It'll have a env variable for the moment `TRANSLATION_URL`.

In the git ignored `.env` file paste the resulting url from the deployed google-script after the `=`.

  - 2.3 In src run `npm i` - if you haven't already
  - 2.4 and run `./src/index.js` using node
  
The script will take `./src/localization-files/default.json` and translate it to indonesian and place it in `./src/localization-files/default.json`

If you want to change the language text is translated into open [code.ts](./google-script/src/code.ts)
- update `LanguageApp.translate(input, 'en', 'id');` replacing `id` with the language key of your choice
- [language keys](https://cloud.google.com/translate/docs/languages)

## 3. Limitations / Considerations

1. Rate Limit

Google apps has a rate limit and a daily limit for number of api calls / Localization app calls, the limit is quite generous but can be hit. I think its somewhere around *10,000* calls.

[https://developers.google.com/apps-script/guides/services/quotas](https://developers.google.com/apps-script/guides/services/quotas)

See implementation of cache which partially addresses this limitation using fingerprinting and a local cache file
- [cache.js](./src/cache.js)

2. Writing the whole script in google apps script

I actually tried this first. When I first had the need for a script like this i was trying to translate an xml document with 15,000 entries to be translated.

You run into the apps script execution time limit (6 min) [https://developers.google.com/apps-script/guides/services/quotas](https://developers.google.com/apps-script/guides/services/quotas)

3. Security

The api endpoint needs to be open for a script to call it.
I've spent a long time looking to google jwt tokens, cloud console etc to figure out if its possible to use a token for authentication. I haven't found a way to connect to the api endpoint securly when the permissions are set to 'only me' aside from the browser. If you know a way please comment or file an issue

An api run as you in google apps script will only have access to the permissions you set it to.
If you're reading google drive documents with it from the `doGet` function... probably not a good idea.
That being said I do trust google drive security more than other applications.

They can't protect you from your own mistakes though.

## 4. Improvements

1. Combining this program with google sheets

- Google apps script has an api to interact with / create etc with google sheets as well
- As a developer you want to avoid small tickets like change `color` to `colour` or vice versa.
- Idea would be to upload local `localization` files and set them up in a way that sync with a google drive spreadsheet
