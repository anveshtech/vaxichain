configtxlator proto_decode --input channel1.block --type common.Block | jq .data.data[0].payload.data.config
