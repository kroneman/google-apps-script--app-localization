# Google Apps script - app localization

One of the standards i've come across in app development is i18n files for react and vue

- [vue-i18n](https://kazupon.github.io/vue-i18n/)
- [react-i18n-and-i18next](https://react.i18next.com/)

While these work great and the react version even has a service offering, sometimes its nice to just use google drive (with some of their services)

## 1. Google translation Api

Now translate.google.com is great, it doesn't have a json api though, at least i've spent a considerable time searching (couple days) and couldn't find one. If you throw json or xml in there, you get ... interesting results. Not to mention the keys in the object or your xml tags get translated too.

Google Apps script however has a language app [https://developers.google.com/apps-script/reference/language/language-app](https://developers.google.com/apps-script/reference/language/language-app)

And it has methods to create a json api. [https://developers.google.com/apps-script/guides/web](https://developers.google.com/apps-script/guides/web)

So if we combine the two we can create a rudimentary api for translating keywords.

Further using a couple tools we can manage the code in a git repository

- `clasp` form managing your apps script
- `webpack` & `webpack-cli` with typescript to write some modern js
- `@types/google-apps-script` autocompletion in vscode
- `gas-webpack-plugin` for helping it work in google apps script context

For further reading see [./google-script](./google-script) directory and documentation