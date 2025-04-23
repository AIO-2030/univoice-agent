import React, { useState } from 'react';
import './developer.module.scss';
import style from './developer.module.scss'
import { storeWorkflowData, storeUploaderPowContract, query_workflow_ledger_by_principal_id } from "@/utils/callmugcbackend"
import Paging from '@/components/paging';
import { fmtTimestamp, fmtUvBalance } from '@/utils/index';
import { UploaderPowContractInput } from "declarations/mugc-agc-backend/mugc-agc-backend.did";
import type { WorkLoadLedgerItem, WorkflowLedgerItem } from "declarations/mugc-agc-backend/mugc-agc-backend.did";

import { useAcountStore } from '@/stores/user';
import { reConnectPlug } from '@/utils/icplug';
import { showToast } from '@/components/toast';




const Developer = () => {
    const [workflowJson, setWorkflowJson] = useState('');
    const [nodeId, setNodeId] = useState('');
    const [paramValue, setParamValue] = useState('');
    const [processInfo, setProcessInfo] = useState('');
    const [uploaderPowContract, setUploaderPowContract] = useState({
        sample_output: '',
        identity_gusserr_limit: 0.0,
        workflow_id: ''
    });
    const [sampleOutput, setSampleOutput] = useState('');
    const [identityGusserrLimit, setIdentityGusserrLimit] = useState(0.3);
    const [workflowId, setWorkflowId] = useState('');
    const [ledgerItems, setLedgerItems] = useState<Array<WorkflowLedgerItem>>([]);

    const [assetsData, setAssetsData] = useState([]);
    const [assetsPage, setAssetsPage] = useState({
        pageNum: 0,
        totalPage: 0
    });

    const { setUserByPlugWallet, getPrincipal, getWalletType } = useAcountStore();

    React.useEffect(() => {
        if (!getPrincipal()) {
            reConnectPlug()
                .then((principal_id) => {
                    if (principal_id) {
                        setUserByPlugWallet(principal_id);
                    }
                })
                .catch((e) => {
                    console.log('reConnectPlug exception!', e);
                });
        }
        queryLedger();


    }, []);

    const queryLedger = () => {
        query_workflow_ledger_by_principal_id(getPrincipal()).then((result) => {
            if ('Ok' in result) {
                console.log('Successfully retrieved workflow ledger:', result.Ok);
                setLedgerItems(result.Ok);
            } else if ('Err' in result) {
                console.log('Error querying ledger: ' + result.Err);
            }
        }).catch((error) => {
            console.log('Error: ' + error.message);
        });
    };



    const handleContracrSubmit = (e) => {
        e.preventDefault();

        try {
            //const parsedWorkflow = JSON.parse(workflowJson);
            storeWorkflowData(getPrincipal(), workflowJson).then((result) => {
                console.log('storeWorkflowData done, result:', result);
                if ('Ok' in result) {
                    showToast('Workflow stored successfully,workflowid : ' + result.Ok, 'info');
                    setWorkflowId(result.Ok);
                    queryLedger();
                    // Build uploaderPowContract object with current state values
                    const contract = {
                        sample_output: sampleOutput,
                        identity_gusserr_limit: identityGusserrLimit,
                        workflow_id: result.Ok
                    };
                    setUploaderPowContract(contract);
                    console.log('UploaderPowContract:', contract);

                    // Call backend function to store the contract
                    storeUploaderPowContract(contract).then((result) => {
                        if ('Ok' in result) {
                            showToast('Contract stored successfully', 'info');
                        } else if ('Err' in result) {
                            console.log('Error storing contract: ' + result.Err, 'error');
                        } else {
                            console.log('Unexpected response from backend', 'warn');
                        }
                    }).catch((error) => {
                        console.log('Error: ' + error.message, 'error');
                    });
                } else if ('Err' in result) {
                    console.log('Error storing workflow: ' + result.Err, 'error');
                } else {
                    console.log('Unexpected response from backend', 'warn');
                }
            }
            )
            // Add your workflow processing logic here
        } catch (error) {
            console.log('Error: Invalid JSON format', 'error');
            return;
        }


    };

    const queryAssets = (pagenum) => {
        let newData = [{
            id: 1,
            c1: 'column1',
            c2: 'column2',
            c3: 'column3',
            c4: 'column4'
        }]
        setAssetsData(newData);
        let p = assetsPage;
        p.pageNum = pagenum
        // p.totalPage = 10
        setAssetsPage(p);
    }

    return (
        <div className="uv-container-1 container-subpg pg-dashboard">
            <div className={style.develop_form_ctx}>
                <div className={style.block}>
                    <div className={style.title}>Paste your Workflow:</div>
                    <div className={style.ipt_area}>
                        <textarea
                            className={style.textareainput}
                            value={workflowJson}
                            onChange={(e) => setWorkflowJson(e.target.value)}
                            placeholder="Enter workflow JSON"
                        />
                    </div>
                </div>

                <div className="sub-block-split"></div>

                <div className={style.block}>
                    <div className={style.title}>Sample Output:</div>
                    <div className={style.ipt_area}>
                        <textarea
                            className={style.textareainputslim}
                            value={sampleOutput}
                            onChange={(e) => setSampleOutput(e.target.value)}
                            placeholder="Enter sample output"
                        />
                    </div>
                    <div className={`${style.btn} btn-link-1`} onClick={handleContracrSubmit}>Submit and Wait Identity Process</div>
                </div>

                <div className="sub-block-split"></div>

                {/* <div className="submit-section">
            <div className="process-info">
                {processInfo}
            </div>
        </div> */}
                <div className={style.myassets}>
                    <div className={style.block_title}>My Assets</div>
                    {
                        ledgerItems.length === 0 ?
                            <div className="nodata">
                                <div className="nodata-img"></div>
                                <div className="nodata-txt">No data</div>
                            </div>
                            :
                            <div className="tbl-paged">
                                <div className="tbl">
                                    <div className={`tbl-r tbl-r-title ${style.assets_row}`}>
                                        <div className="tbl-cell-title">ClientId</div>
                                        <div className="tbl-cell-title">WorkFlowID</div>
                                        <div className="tbl-cell-title">UploadTime</div>
                                        <div className="tbl-cell-title">TokensRewords</div>
                                        <div className="tbl-cell-title">Identify Status</div>

                                    </div>
                                    {ledgerItems.map((el) => (
                                        <div key={el.workflow_id} className={`tbl-r ${style.assets_row}`}>
                                            <div className="tbl-cell">{el.client_id}</div>
                                            <div className="tbl-cell">{el.workflow_id}</div>
                                            <div className="tbl-cell">{fmtTimestamp(Number(el.timestamp))}</div>
                                            <div className="tbl-cell">{fmtUvBalance(String(el.token_reward))}</div>
                                            <div className="tbl-cell">{Object.keys(el.status)[0]}</div>
                                        </div>
                                    ))}
                                </div>
                                {/* <Paging pageNum={assetsPage.pageNum} totalPage={assetsPage.totalPage} queryHandler={queryAssets} /> */}
                            </div>
                    }
                </div>

            </div>
        </div>

    );
};


export default Developer;