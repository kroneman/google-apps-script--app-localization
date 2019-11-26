# Google Apps script - app localization

One of the standards i've come across in app development is i18n files for react and vue

- [vue-i18n](https://kazupon.github.io/vue-i18n/)
- [react-i18n-and-i18next](https://react.i18next.com/)

While these work great and the react version even has a service offering, sometimes its nice to just use google drive (with some of their services)

## 1. Google translation Api

Now translate.google.com is great, it doesn't have a json api though, at least i've spent a considerable time searching (couple days) and couldn't find one. If you throw json or xml in there, you get ... interesting results. Not to mention the keys in the object or your xml tags get translated too.

However:

- Google Apps script has a language app [https://developers.google.com/apps-script/reference/language/language-app](https://developers.google.com/apps-script/reference/language/language-app)
- it has a way to create a json api. [https://developers.google.com/apps-script/guides/web](https://developers.google.com/apps-script/guides/web)

So if we combine the two we can create a rudimentary api for translating keywords.
Further using a couple tools we can manage the code in a git repository

- `clasp` form managing your apps script
- `webpack` & `webpack-cli` with typescript to write some modern js
- `@types/google-apps-script` autocompletion in vscode
- `gas-webpack-plugin` for helping it work in google apps script context

For setup and code see [./google-script](./google-script) directory and documentation

## 2. After deploying and following the guide from step 1 we should have an api

Here is the first limitation of this project. The api endpoint needs to be open for a script to call it.
I've spent a long time looking to google jwt tokens, cloud console etc to figure out if its possible to use a token for authentication

  - 2.1 You'll notice a [./env.sample](./env.sample) file in the root. Like the clasp configuration in part one. Copy and Rename it to `.env` in the same directory.
  - 2.2 It'll have one env variable for the moment `TRANSLATION_URL`. In the git ignored `.env` file paste the resulting url from the deployed google-script after the `=`.
  - 2.3 In src run `npm i` - only a few packages this time...
  - 2.4 and run `./src/index.js` using node
  
The script will take `./src/localization-files/default.json` and translate it to indonesian and place it in `./src/localization-files/default.json`

## 3. Limitations / Considerations

1. Rate Limit

Google apps has a rate limit and a daily limit for number of api calls / Localization app calls, the limit is quite generous but can be hit. I think its somewhere around *10,000* calls.

[https://developers.google.com/apps-script/guides/services/quotas](https://developers.google.com/apps-script/guides/services/quotas)

2. Writing the whole script in google apps script

I actually tried this first. When I first had the need for a script like this i was trying to translate an xml document with 15,000 entries to be translated.

You run into the apps script execution time limit (6 min) [https://developers.google.com/apps-script/guides/services/quotas](https://developers.google.com/apps-script/guides/services/quotas)

3. Security

An api run as you in google apps script will only have access to the permissions you set it to.
If you're reading google drive documents with it from the `doGet` function... probably not a good idea.
That being said I do trust google drive security more than other applications.

They can't protect you from your own mistakes though.

## 4. Improvements

1. Fingerprinting and saving a local memory file

So when i did this, i ran into the rate limit multiple times
What i ended up doing was using the built in node `crypto` module and hashing the full input

Something like
```js
const fingerPrint = (key, value) => {
  const dataString = `${key}${value}`;
  const hash = crypto.createHmac('sha256', this.fingerPrintKey)
          .update(dataString)
          .digest('hex');
  return hash;
}
```

- Where `dataString` is the combination of key and value.
- I would keep this in memory as the program ran. And save api request results to the object using the hash as the key to store them in
- If a `SIGINT` was detected I would save the object into a `memory.json` file.
- Further when the program started up I would load the memory object and use the cached translation results if the fingerprint matched and was found in memory

2. Combining this program with google sheets

- Google apps script has an api to interact with / create etc with google sheets as well
- As a developer you want to avoid small tickets like change `color` to `colour` or vice versa.

