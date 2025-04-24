echo "========update contract======"
dfx canister call mugc-agc-backend update_minting_contract "(
   record {
      poll_account=\"6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe\";
      nft_collection_id=\"br5f7-7uaaa-aaaaa-qaaca-cai\";
      token_block=2_625_000
   }
)"

echo "=========record_work_load========"
dfx canister call mugc-agc-backend push_workload_record "(
    record {
      promt_id = \"39f010d8-ab0e-49c2-bc6c-926ba97f8c3e\";
      client_id = \"c6ab9295461a4e06b8c3af25dc8c63a4\";
      ai_node = \"Mixlab\";
      app_info = \"univoice.pro\";
      wk_id = \"6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe-1737222574182048978\";
      voice_key = \"2f852213-fcd8-486c-9ed3-61e102718673/tmp/tmpl1gq476n.wav\";
      deduce_asset_key = \"[\"{\\\"tags\\\": [\\\"\\u4e2d\\u7acb\\\"], \\\"total_duration\\\": 4.399999999999999, \\\"total_gap_duration\\\": 7.220000000000001, \\\"emotion_changes\\\": {\\\"EMO_UNKNOWN\\\": 4}, \\\"most_frequent_emotion\\\": \\\"EMO_UNKNOWN\\\", \\\"audio_types\\\": [\\\"Speech\\\", \\\"BGM\\\"], \\\"languages\\\": [\\\"zh\\\", \\\"ja\\\", \\\"en\\\"]}\"]\";
      status = \"executed\" ;
      gmt_datatime=1731837234   
    })"