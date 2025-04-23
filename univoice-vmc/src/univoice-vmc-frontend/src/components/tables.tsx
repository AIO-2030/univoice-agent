import { util } from 'echarts';
import { useEffect, useState } from 'react';
import {get_miner_jnl} from '@/utils/call_vmc_backend'

const MinerJnlTable = (option:any) => {
    const [minerLedgers, setMinerLedgers] = useState();
    
}