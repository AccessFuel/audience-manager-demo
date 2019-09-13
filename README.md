# audience-manager-demo
Audience Manager UI canned demo without backend


## Run Locally
This demo doesn't have a backend, however it requires a `loclahost` HTTP server, for browser doesn't allow Ajax requests to `file://`.
To run this demo locally, execute in the root folder:
```bash
python -m SimpleHTTPServer 8000
```

You can the access Audience Manager Demo at http://localhost:8000

## Development
This demo UI is using Compas Authoring Framework for CSS compilations.
To setup compass execute:
```bash
brew install ruby
gem update --system
gem install compass
compass -v
```

To run a service that rebuilds CSS every time a new change is detected in the SCSS source files, run in terminal:
```
compass watch
```

You can now update styles in `/dist/sass/`.

## Committing Code
Before committing changes make sure to compile CSS:
```
sudo compass compile -e production
```
