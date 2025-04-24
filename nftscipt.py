import os

head_vec = "( \
    vec { "

tail_vec = " } \
)"

arguments = ""+head_vec



def creat_record_item(i:int, principal:str)->str:
    token_param = "token_id = {} : nat;"
    record_template = "record {" + token_param.format(i) + "owner = opt record { owner = principal \""+principal+"\"; subaccount = null;}; \
      metadata = variant { \
        Map = vec { \
          record { \"icrc97:metadata\"; variant { Map = vec { \
            record { \"name\"; variant { Text = \"Univoice listener\" } }; \
            record { \"description\"; variant { Text = \"A liciense for identify as Univoice-Listener.\" } }; \
            record { \"assets\"; variant { Array = vec { \
              variant { Map = vec { \
                record { \"url\"; variant { Text = \"https://bafybeibhnv326rmac22wfcxsmtrbdbzjzn5mviykq3rbt4ltqkqqfgobga.ipfs.w3s.link/thum.jpg\" } }; \
                record {\"mime\"; variant { Text = \"image/jpeg\" } }; \
                record { \"purpose\"; variant { Text = \"icrc97:image\" } } \
              }} \
            }}} \
          }}} \
        } \
      }; \
      memo = opt blob \"\\00\\01\"; \
      override = true; \
      created_at_time = null; \
    };"
    return record_template

i = 0
records:str = ""

while i <2100 :
    record_item = creat_record_item(i,'br5f7-7uaaa-aaaaa-qaaca-cai')
    records += record_item
    i=i+1

arguments+=records
arguments+=tail_vec

with open("nftscript.did","w") as tmp_file:
    tmp_file.write(arguments)


