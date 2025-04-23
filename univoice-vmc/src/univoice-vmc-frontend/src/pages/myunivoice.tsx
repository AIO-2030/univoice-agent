import { useEffect, useState } from 'react';
import { fmtInt, fmtUvBalance, fmtTimestamp, fmtSummaryAddr } from '@/utils';
import { call_tokens_of, getWalletPrincipal } from '@/utils/wallet'
import type { UnvMinnerLedgerRecord, TransferTxState, MinerJnlPageniaze } from 'declarations/univoice-vmc-backend/univoice-vmc-backend.did';
import Paging from '@/components/paging';
import style from './myunivoice.module.scss'
import ImgBgGetMoreNft from '@/assets/imgs/bg_getmorenft.png'
import ImgNftThum from '@/assets/imgs/nft_thum.png'
import { toastSuccess, toastError, toastWarn } from '@/components/toast';
import { ERROR_MSG } from '@/utils/uv_const';

import {fetch_sumary_for_myvoice, claim_to_account_by_principal, get_miner_jnl} from "@/utils/call_vmc_backend";

import { useAcountStore } from '@/stores/user';

function MyUnivoicePage() {

  const [summaryData, setSummaryData] = useState({
    rewards: '',
    claimable: '',
  });
  const [transactionData, setTransactionData] = useState<any>([]);
  const [transactionPage, setTransactionPage] = useState({
    pageNum: 0,
    totalPage: 0
  });
  const [licenseData, setLicenseData] = useState<any>([]);
  const [claimable, setClaimable] = useState(true)
  const { getPrincipal } = useAcountStore();

  const PAGE_SIZE_TRANS = 15;

  const queryTransaction = (pagenum: number) => {
    const principal_id = getPrincipal();
    if(!principal_id){
      toastWarn('Failed to query transaction data: ' + ERROR_MSG.USER_NOT_AUTH)
      return;
    }
    get_miner_jnl(principal_id, BigInt(PAGE_SIZE_TRANS * pagenum), BigInt(PAGE_SIZE_TRANS))
      .then( miner_jnls => {
        let minner_txs = [];
        let total_log = Number(miner_jnls.total_log);
        miner_jnls.ledgers.forEach((element:UnvMinnerLedgerRecord,index)=> {
          console.log("Fetch one trx_element:", element);
          let data={
            id:index,
            minner:element.minner_principalid,
            timestamp:element.gmt_claim_time == BigInt(0)?Number(element.gmt_datetime):Number(element.gmt_claim_time),
            block:String(element.block_index[0]),
            amount:Number(element.tokens),
            claimStat: 'Claimed' in element.biz_state? 'Claimed':'WaitClaim'
          };
          minner_txs[index] = data;
        });
        setTransactionData(minner_txs);
        let p = transactionPage;
        p.pageNum = pagenum;
        p.totalPage = parseInt(String( Number(total_log) / PAGE_SIZE_TRANS)) +1;
        setTransactionPage(p);
      }).catch(e => {
        toastWarn('Failed to query transaction data!')
      });
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    getWalletPrincipal().then(pid => {
      if(pid){
        loadSummary();
        loadLicense();
        queryTransaction(0);
      }
    }).catch(e => {
      toastError('Failed to load page data: ' + e.toString())
    });
  }, [getPrincipal()]);
  
  const loadSummary = () => {
    let data={
      rewards: '',
      claimable: '',
    };
    
    const principal_id = getPrincipal();
    if(!principal_id) {
      toastWarn('Failed to query my performance data: ' + ERROR_MSG.USER_NOT_AUTH)
      return;
    }
    fetch_sumary_for_myvoice(principal_id)
      .then( sum_tokens => {
        data.claimable = String(sum_tokens.sum_unclaimed);
        data.rewards = String(sum_tokens.sum_claimed);
        setSummaryData(data);
      }).catch(e => {
        toastWarn('Failed to query my performance data!')
      });  
  }

  const catchNftImgFail = (event) => {
    //event.target.src = ImgNftThum
  }

  const loadLicense = () => {
    const dataItem ={ 
       id: 1,
       imgurl: 'https://bafybeibhnv326rmac22wfcxsmtrbdbzjzn5mviykq3rbt4ltqkqqfgobga.ipfs.w3s.link/thum.jpg',
       idx: '01',
       intro: 'Univoice listener',
       quantity: 1,
       myhashs: ''
    }

    const data = [];
              
    call_tokens_of().then(tokenIds=>{
      let owner_cnt = 0;
      let myhash_str = "";
      console.log("Origin nft tokens is",tokenIds);

      for (let token_id in tokenIds) {
        console.log("hold license of token_id", tokenIds[token_id]);
        owner_cnt +=1;
        myhash_str += '#'+tokenIds[token_id]+',';
      }
      dataItem.myhashs = myhash_str;
      dataItem.quantity = owner_cnt;
      dataItem.imgurl = ImgNftThum;
      if (owner_cnt > 0) {
        data[0] = dataItem;
      }
      setLicenseData(data);
    })      
  }

  const clickClaim = () => {
    if(!getPrincipal()){
      toastWarn('Failed to claim rewards: ' + ERROR_MSG.USER_NOT_AUTH)
      return
    }
    claim_to_account_by_principal(getPrincipal()).then(trans_tokens=>{
      toastSuccess("You have claimed "+String(trans_tokens)+" success. You can recheck by your wallet.");
      loadSummary();
      setClaimable(false)
    });
  }
  
  return (
    <div className="uv-container-1 container-subpg pg-dashboard">
      <div className={`sub-qa-block ${style.panel_0}`}>
        <div className={style.pg_title}>My Univoice</div>
        <div className={style.pg_intro}>Look at my data</div>
      </div>
      <div className="sub-qa-block">
        <div className={style.block_title}>My Performance</div>
        <div className={style.summary}>
          <div className={style.rewards_panel}>
            <div className={style.label}>Token Rewards</div>
            <div className={style.data}>
              <div className={style.val}>{summaryData.rewards === '' ? '--' : fmtUvBalance(summaryData.rewards)}</div>
              <div className={style.unit}>$UVC</div>
            </div>
          </div>
          <div className={style.claimable_panel}>
            <div>
              <div className={style.label}>Rewards Claimable</div>
              <div className={style.data}>
                <div className={style.val}>{summaryData.claimable === '' ? '--' : fmtUvBalance(summaryData.claimable)}</div>
                <div className={style.unit}>$UVC</div>
              </div>
            </div>
            {
              claimable ?
              <div className={`btn-link-1 ${style.btn_claim}`} onClick={clickClaim}>Claim</div>
              :
              <div className={style.btn_claim_disable}>Claim</div>
            }
            
          </div>
        </div>
      </div>
      
      <div className="sub-qa-block">
        <div className={style.block_title}>License</div>
        {
        licenseData.length === 0 ? 
        <div className="nodata">
          <div className="nodata-img"></div>
          <div className="nodata-txt">No data</div>
        </div>
        :
        <div className={style.licenses}>
          <div className={style.tbl_r}>
            <div className={style.title}>#</div>
            <div className={style.title}>Collection</div>
            <div className={style.title}>The number I hold</div>
            <div className={style.title}>Quantity</div>
          </div>
        {licenseData.map((el: { id: string; idx: string; imgurl: string; intro: string; quantity: number; myhashs: string}) => (
          <div key={el.id} className={style.tbl_r}>
            <div className={style.cell}>{el.idx}</div>
            <div className={style.cell}>
                <div className={style.img_bg}><div className={style.img_wrap}><img className={`${style.img} img-fixed`} src={el.imgurl} onError={catchNftImgFail} /></div></div>
              <div className={style.intro}>{el.intro}</div>
            </div>
            <div className={style.cell}>
              <div className={style.myhashs}>{el.myhashs}</div>
            </div>
            <div className={`${style.cell} ${style.quantity}`}>+{fmtInt(el.quantity)}</div>
          </div>
        ))}
        </div>
        }
      </div>
      
      <div className="sub-qa-block transactions">
        <div className={style.block_title}>Transactions</div>
        {
        transactionData.length === 0 ? 
        <div className="nodata">
          <div className="nodata-img"></div>
          <div className="nodata-txt">No data</div>
        </div>
        :
        <div className="tbl-paged">
          <div className="tbl">
            <div className={`tbl-r tbl-r-title ${style.transactions_row}`}>
              <div className="tbl-cell-title">Minner</div>
              <div className="tbl-cell-title">Timestamp</div>
              <div className="tbl-cell-title">Block Index</div>
              <div className="tbl-cell-title">Tokens</div>
              <div className="tbl-cell-title">Claim State</div>
            </div>
          {transactionData.map((el: { id: string; minner: string; timestamp: number; block: string; amount: string | number; claimStat: string; }) => (
            <div key={el.id} className={`tbl-r ${style.transactions_row}`}>
              <div className="tbl-cell">{fmtSummaryAddr(el.minner)}</div>
              <div className="tbl-cell">{fmtTimestamp(el.timestamp)}</div>
              <div className="tbl-cell">{fmtSummaryAddr(el.block)}</div>
              <div className="tbl-cell">{fmtUvBalance(el.amount)}<span className="token-unit">$UVC</span></div>
              <div className="tbl-cell">{el.claimStat}</div>
            </div>
          ))}
          </div>
          <Paging pageNum={transactionPage.pageNum} totalPage={transactionPage.totalPage} queryHandler={queryTransaction} />
        </div>
        }
      </div>

      <div className="sub-qa-block">
        <div className={style.getmore_nft}>
          <img src={ImgBgGetMoreNft} className={style.img}/>
          <div className={style.title}>Get more License</div>
          <div className={`${style.btn} btn-link-1`}>Coming Soon</div>
        </div>
      </div>
    </div>
  )
}
export default MyUnivoicePage;