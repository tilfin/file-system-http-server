# FileSystem HTTP server

An HTTP server that operates the files under the specified directory.

- `GET /directory` - returns file list of the directory as JSON
- `GET /file` - returns the file data as octet-stream
- `POST /file` - create a file that has data from request body

# Run GUI

```
$ npm run gui
```

# Run CLI

```
$ npm start [port] [path]
```

- port - for HTTP server listening
- path - root directory to mount
