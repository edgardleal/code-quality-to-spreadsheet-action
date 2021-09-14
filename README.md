<h1 align="center">Code Quality to Spreadsheet Action 👋</h1>
<p>
  <a href="https://github.com/edgardleal/code-quality-to-spreadsheet-action/actions/workflows/validate.yml" target="_blank">
    <img alt="Lint" src="https://github.com/edgardleal/code-quality-to-spreadsheet-action/actions/workflows/validate.yml/badge.svg">
  </a>

  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> A github action to send eslint results to Google Spreadsheet

## References

* https://eslint.org/docs/developer-guide/nodejs-api

## Setup

```sh
yarn install
```

## Usage

## Parameters

### eslint_project_list

> A comma separated list of paths to be scanned

* required = `false`
* default = '.'

### eslint_extensions

> A comma separated list of file extensions to be scanned

* required = `false`
* default = '.js,.ts,.jsx'

### spreadsheet_id

> The id of the spreadsheet to store the result data

* required = `true`

### google_service_account_email

> The email created to access the spreadsheet

* required = `true`

### google_private_key

> The private key that you download from google console

* required = `true`

### project_name

> The name you want to be sent to spreadsheet

* required = `true`

## Run tests

```sh
yarn run test
```

## Author

👤 **Edgard Leal**

* Website: https://github.com/edgardleal
* Github: [@edgardleal](https://github.com/edgardleal)

## Show your support

Give a ⭐️ if this project helped you!

<a href="https://www.buymeacoffee.com/edgardleal" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
