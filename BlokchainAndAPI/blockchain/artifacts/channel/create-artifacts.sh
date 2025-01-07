# ? Maybe Delete Later 


# chmod -R 0755 ./crypto-config
# # # Delete Existing artifacts 
# rm -rf ./crypto-config 
# rm genesis.block mychannel.tx
# rm -rf ../../channel-artifacts/*


# # Generate Crypto artifacts for organizations 
# cryptogen generate --config=./crypto-config.yaml --output=./crypto-config/



# ----------------------
# Channel Creation

SYS_CHANNEL="sys-channel"
CHANNEL_NAME="channel1"

echo $CHANNEL_NAME

# Generate Channel Block
configtxgen -profile ApplicationChannel -configPath . -channelID $CHANNEL_NAME  -outputBlock ../../channel-artifacts/$CHANNEL_NAME.block


