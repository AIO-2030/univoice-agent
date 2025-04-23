#dfx stop
set -ex
#trap 'dfx stop' EXIT
echo "===========SETUP========="
dfx start --background --clean

dfx identity use univoicetest
echo "===========SETUP DONE========="
dfx deploy  mugc-agc-backend 



echo "========update contract======"
dfx canister call mugc-agc-backend update_minting_contract "(
   record {
      poll_account=\"mxzaz-hqaaa-aaaar-qaada-cai\";
      nft_collection_id=\"br5f7-7uaaa-aaaaa-qaaca-cai\";
      token_block=1000
   }
)"

echo "=========record_work_load========"
dfx canister call mugc-agc-backend push_workload_record "(
    record {
      promt_id = \"086daeb4-3795-486a-8d20-725866f4ded9\";
      client_id = \"1982027079\";
      ai_node = \"http://127.0.0.1:8188/prompt\";
      app_info = \"muse_talk\";
      wk_id = \"univoice-wk-local.json\";
      voice_key = \"2f4018e2-ed5e-4821-97ba-4873b431586f/tmp/tmprh7jbr_7.wav\";
      deduce_asset_key = \"AIGC_output_video_final_00116.mp4\";
      status = \"executed\" ;
      gmt_datatime=1731837234   
    })"

echo "==========query_curr_workload======="
dfx canister call mugc-agc-backend query_curr_workload