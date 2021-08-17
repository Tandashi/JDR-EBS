# Just Dance Requests - Extension Backend Service
This is the Extension Backend Service for the Just Dance Requests Twitch Extension.
It handels all the configuration of the extension and provides the data such as songdata and assets.

## Building the EBS
To build the ebs you need the following:
- NodeJS v11+ (Tested with 16.6.2)
- Yarn (Tested with 3.0.1)

```bash
# Install Dependencies
yarn install

# Start the EBS
yarn start

# Start the Songdata Importer
yarn start-importer
```